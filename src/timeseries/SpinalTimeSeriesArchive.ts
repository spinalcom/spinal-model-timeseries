/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */
import {
  FileSystem,
  Model,
  Ptr,
  spinalCore
} from "spinal-core-connectorjs_type";

import { SpinalTimeSeriesArchiveDay } from "./SpinalTimeSeriesArchiveDay";

import { SpinalDateValue } from "./SpinalTimeSeriesData";

/**
 * @class SpinalTimeSeriesArchive
 * @extends {Model}
 */
class SpinalTimeSeriesArchive extends Model {
  // synchronized
  private lstDate: spinal.Lst<spinal.Val>;
  private lstItem: spinal.Lst<spinal.Ptr<SpinalTimeSeriesArchiveDay>>;
  public initialBlockSize: spinal.Val;

  // not synchronized
  private itemLoadedDictionary: Map<
    number,
    Promise<SpinalTimeSeriesArchiveDay>
  >;
  private loadPtrDictionary: Map<number, Promise<SpinalTimeSeriesArchiveDay>>;

  /**
   *Creates an instance of SpinalTimeSeriesArchive.
   * @param {number} [initialBlockSize=50]
   * @memberof SpinalTimeSeriesArchive
   */
  constructor(initialBlockSize: number = 50) {
    super({
      initialBlockSize,
      lstDate: [],
      lstItem: []
    });

    this.itemLoadedDictionary = new Map();
    this.loadPtrDictionary = new Map();
  }

  /**
   * @static
   * @param {(number | string | Date)} date
   * @returns {number}
   * @memberof SpinalTimeSeriesArchive
   */
  public static normalizeDate(date: number | string | Date): number {
    return new Date(date).setUTCHours(0, 0, 0, 0);
  }

  loadPtr(
    ptr: spinal.Ptr<SpinalTimeSeriesArchiveDay>
  ): Promise<SpinalTimeSeriesArchiveDay> {
    if (
      typeof ptr.data.value !== "undefined" &&
      this.loadPtrDictionary.has(ptr.data.value)
    ) {
      return this.loadPtrDictionary.get(ptr.data.value);
    }

    if (typeof ptr.data.model !== "undefined") {
      const res = Promise.resolve(ptr.data.model);
      if (ptr.data.value) {
        this.loadPtrDictionary.set(ptr.data.value, res);
      }
      return res;
    }

    if (typeof ptr.data.value !== "undefined" && ptr.data.value === 0) {
      return Promise.reject("Load Ptr to 0");
    }

    if (typeof FileSystem._objects[ptr.data.value] !== "undefined") {
      const res = Promise.resolve(
        <SpinalTimeSeriesArchiveDay>FileSystem._objects[ptr.data.value]
      );
      this.loadPtrDictionary.set(ptr.data.value, res);
      return Promise.resolve(res);
    }
    const res: Promise<SpinalTimeSeriesArchiveDay> = new Promise(resolve => {
      ptr.load(element => {
        resolve(element);
      });
    });
    this.loadPtrDictionary.set(ptr.data.value, res);
    return res;
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getTodayArchive(): Promise<SpinalTimeSeriesArchiveDay> {
    const now = Date.now();
    const date = SpinalTimeSeriesArchive.normalizeDate(now);
    const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);

    if (spinalTimeSeriesArchiveDay !== undefined) {
      return spinalTimeSeriesArchiveDay;
    }

    for (let index = 0; index < this.lstDate.length; index += 1) {
      const element = this.lstDate[index];
      const ptr = this.lstItem[index];
      if (element.get() === date) {
        return this.loadPtr(ptr);
      }
    }
    const value = new SpinalTimeSeriesArchiveDay(this.initialBlockSize.get());
    this.lstDate.push(date);
    this.lstItem.push(new Ptr(value));
    const prom = Promise.resolve(value);
    this.itemLoadedDictionary.set(date, prom);
    return prom;
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getOrCreateArchiveAtDate(
    atDate: number | string | Date
  ): Promise<SpinalTimeSeriesArchiveDay> {
    const date = SpinalTimeSeriesArchive.normalizeDate(atDate);
    const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);

    if (spinalTimeSeriesArchiveDay !== undefined) {
      return spinalTimeSeriesArchiveDay;
    }
    for (let index = 0; index < this.lstDate.length; index += 1) {
      const element = this.lstDate[index];
      const ptr = this.lstItem[index];
      if (element.get() === date) {
        return this.loadPtr(ptr);
      }
    }
    const value = new SpinalTimeSeriesArchiveDay(this.initialBlockSize.get());
    value.dateDay.set(date);
    // search index
    let index = 0;
    for (let idx = 0; idx < this.lstDate.length; idx += 1) {
      const element = this.lstDate[idx];
      if (element > date) {
        break;
      }
      index += 1;
    }

    this.lstDate.insert(index, [date]);
    this.lstItem.insert(index, [new Ptr(value)]);
    const prom = Promise.resolve(value);
    this.itemLoadedDictionary.set(date, prom);
    return prom;
  }

  /**
   * @param {(number|string)} [start=0]
   * @param {(number|string)} [end=Date.now()]
   * @returns {AsyncIterableIterator<SpinalDateValue>}
   * @memberof SpinalTimeSeriesArchive
   */
  public async *getFromIntervalTimeGen(
    start: number | string | Date = 0,
    end: number | string | Date = Date.now()
  ): AsyncIterableIterator<SpinalDateValue> {
    const normalizedStart = SpinalTimeSeriesArchive.normalizeDate(start);
    const normalizedEnd =
      typeof end === "number" || typeof end === "string"
        ? new Date(end).getTime()
        : end;
    for (let idx = 0; idx < this.lstDate.length; idx += 1) {
      const element = this.lstDate[idx].get();
      if (normalizedStart > element) continue;

      const archiveDay: SpinalTimeSeriesArchiveDay = await this.getArchiveAtDate(
        element
      );
      const gen = archiveDay.getFromIntervalTimeGen(
        normalizedStart,
        normalizedEnd
      );

      for await (const res of gen) {
        yield res;
      }

      // const archive = await this.getArchiveAtDate(element);
      // let index = 0;
      // const archiveLen = archive.length.get();
      // if (normalizedStart === element) {
      //   for (; index < archiveLen; index += 1) {
      //     const dateValue = archive.get(index);
      //     if (dateValue.date >= start) {
      //       break;
      //     }
      //   }
      // }

      // for (; index < archiveLen; index += 1) {
      //   const dateValue = archive.get(index);
      //   if (dateValue.date > normalizedEnd) return;
      //   yield dateValue;
      // }
    }
  }

  /**
   * getFromIntervalTimeGen is prefered.
   * @param {number} start
   * @param {(number|string)} [end=Date.now()]
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalTimeSeriesArchive
   */
  public async getFromIntervalTime(
    start: number | string | Date,
    end: number | string | Date = Date.now()
  ): Promise<SpinalDateValue[]> {
    const result = [];
    for await (const data of this.getFromIntervalTimeGen(start, end)) {
      result.push(data);
    }
    return result;
  }

  /**
   * @param {(number | string | Date)} date
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getArchiveAtDate(
    date: number | string | Date
  ): Promise<SpinalTimeSeriesArchiveDay> {
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(date);
    if (this.itemLoadedDictionary.has(normalizedDate)) {
      return this.itemLoadedDictionary.get(normalizedDate);
    }
    const idx = this.lstDate.indexOf(normalizedDate);
    if (idx < 0) return Promise.reject(new Error(`Date '${date}' not found.`));

    const promise: Promise<SpinalTimeSeriesArchiveDay> = new Promise(
      resolve => {
        const ptr: spinal.Ptr<SpinalTimeSeriesArchiveDay> = this.lstItem[idx];
        if (typeof ptr.data.model !== "undefined") {
          resolve(ptr.data.model);
        } else {
          ptr.load((element: SpinalTimeSeriesArchiveDay) => {
            resolve(element);
          });
        }
      }
    );
    this.itemLoadedDictionary.set(normalizedDate, promise);
    return promise;
  }

  /**
   * @returns {spinal.Lst<spinal.Val>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getDates(): spinal.Lst<spinal.Val> {
    return this.lstDate;
  }

  /**
   * @param {(number | string | Date)} date
   * @returns {boolean}
   * @memberof SpinalTimeSeriesArchive
   */
  public dateExist(date: number | string | Date): boolean {
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(date);
    for (let idx = this.lstDate.length - 1; idx >= 0; idx -= 1) {
      if (this.lstDate[idx].get() === normalizedDate) return true;
    }
    return false;
  }
}

spinalCore.register_models(SpinalTimeSeriesArchive);

export default SpinalTimeSeriesArchive;
export { SpinalTimeSeriesArchive };
