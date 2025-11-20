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
  Model,
  Ptr,
  spinalCore,
  type Lst,
  type Val,
} from 'spinal-core-connectorjs';
import { loadPtr } from '../utils/loadPtr';
import { SpinalTimeSeriesArchiveDay } from './SpinalTimeSeriesArchiveDay';
import { SpinalTimeSeriesConfig } from '../SpinalTimeSeriesConfig';
import type { SpinalDateValue } from '../interfaces/SpinalDateValue';

/**
 * @class SpinalTimeSeriesArchive
 * @extends {Model}
 */
export class SpinalTimeSeriesArchive extends Model {
  // synchronized
  private lstDate: Lst<Val>;
  private lstItem: Lst<Ptr<SpinalTimeSeriesArchiveDay>>;
  public initialBlockSize: Val;

  // not synchronized
  private itemLoadedDictionary: Map<
    number,
    Promise<SpinalTimeSeriesArchiveDay>
  >;
  private loadPtrDictionary: Map<number, Promise<SpinalTimeSeriesArchiveDay>>;

  /**
   *Creates an instance of SpinalTimeSeriesArchive.
   * @param {number} [initialBlockSize=SpinalTimeSeriesConfig.INIT_BLOCK_SIZE]
   * @memberof SpinalTimeSeriesArchive
   */
  constructor(
    initialBlockSize: number = SpinalTimeSeriesConfig.INIT_BLOCK_SIZE
  ) {
    super({
      initialBlockSize,
      lstDate: [],
      lstItem: [],
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

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getTodayArchive(): Promise<SpinalTimeSeriesArchiveDay> {
    this.cleanUpNaNDates();
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
        return loadPtr(this.loadPtrDictionary, ptr);
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
    this.cleanUpNaNDates();
    const date = SpinalTimeSeriesArchive.normalizeDate(atDate);
    if (isNaN(date)) {
      throw `the value [${atDate}] is not a valid date`;
    }
    const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);

    if (spinalTimeSeriesArchiveDay !== undefined) {
      return spinalTimeSeriesArchiveDay;
    }
    for (let index = 0; index < this.lstDate.length; index += 1) {
      const element = this.lstDate[index];
      const ptr = this.lstItem[index];
      if (element.get() === date) {
        return loadPtr(this.loadPtrDictionary, ptr);
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
   * @memberof SpinalTimeSeriesArchive
   */
  cleanUpNaNDates() {
    let idx = 0;
    while (idx < this.lstDate.length) {
      const date = this.lstDate[idx];
      if (date && isNaN(date.get())) {
        this.lstDate.splice(idx, 1);
        this.lstItem.splice(idx, 1);
      } else {
        ++idx;
      }
    }
  }

  /**
   * @param {(number|string)} [start=0]
   * @param {(number|string)} [end=Date.now()]
   * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
   * @returns {AsyncIterableIterator<SpinalDateValue>}
   * @memberof SpinalTimeSeriesArchive
   */
  public async *getFromIntervalTimeGen(
    start: number | string | Date = 0,
    end: number | string | Date = Date.now(),
    includeLastBeforeStart: boolean = false
  ): AsyncIterableIterator<SpinalDateValue> {
    this.cleanUpNaNDates();
    const normalizedStart = SpinalTimeSeriesArchive.normalizeDate(start); // Get the date at start of the day
    const normalizedEnd =
      typeof end === 'number' || typeof end === 'string'
        ? new Date(end).getTime()
        : end.getTime();

    const startEpoch = typeof start === 'number' || typeof start === 'string'
    ? new Date(start).getTime()
    : start.getTime();

    if (isNaN(normalizedStart)) {
      throw `the value 'start' [${start}] is not a valid date`;
    }
    if (isNaN(normalizedEnd)) {
      throw `the value 'end' [${end}] is not a valid date`;
    }
    for (let idx = 0; idx < this.lstDate.length; idx += 1) {
      const element = this.lstDate[idx].get();
      if (normalizedStart > element) continue; // Skip until correct day.

      const archive = await this.getArchiveAtDate(element); // Get the archive for the day.
      let index = 0;

      // !! here check length 
      if (!archive.length?.get()) {
      // capture weird case where length is missing
      const incorrectlyNamedAttr = this._attribute_names.find((attrName) => {
        return !['lstDate', 'lstValue' , 'length'].includes(attrName)
      })

      if( incorrectlyNamedAttr ) {
        const lengthValue = this[incorrectlyNamedAttr].get();
        archive.add_attr('length', lengthValue);
        archive.rem_attr(incorrectlyNamedAttr);
      }
    }
      const archiveLen = archive.length.get();
      if (normalizedStart === element) {
        let lastData = null;
        for (; index < archiveLen; index += 1) {
          const dateValue = archive.get(index);
          if(dateValue.date > startEpoch) {
            break
          }
          if(dateValue.date == startEpoch) {
            includeLastBeforeStart = false;
            break;
          }
          lastData = dateValue; // retain last value before start condition is met.
        }

        if(includeLastBeforeStart) {
          if(!lastData) {
            let backtrack = idx-1;
            while(!lastData && backtrack >= 0) {      
              const lastArchive = await this.getArchiveAtDate(this.lstDate[backtrack].get());
              if(lastArchive.length.get() > 0) {
                lastData = lastArchive.get(lastArchive.length.get()-1);
              }
              backtrack--;
            }
          }
          if(lastData) {
              yield lastData; // yield the last value before start.
          }
        }
      }

      for (; index < archiveLen; index += 1) {
        const dateValue = archive.get(index);
        if (dateValue.date > normalizedEnd) return;
        yield dateValue;
      }
    }
  }

  /**
   * getFromIntervalTimeGen is prefered.
   * @param {number} start
   * @param {(number|string)} [end=Date.now()]
   * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalTimeSeriesArchive
   */
  public async getFromIntervalTime(
    start: number | string | Date,
    end: number | string | Date = Date.now(),
    includeLastBeforeStart: boolean = false
  ): Promise<SpinalDateValue[]> {
    const result = [];
    for await (const data of this.getFromIntervalTimeGen(start, end, includeLastBeforeStart)) {
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
    this.cleanUpNaNDates();
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(date);
    if (isNaN(normalizedDate)) {
      throw `the value [${date}] is not a valid date`;
    }
    if (this.itemLoadedDictionary.has(normalizedDate)) {
      return this.itemLoadedDictionary.get(normalizedDate);
    }
    const idx = this.lstDate.indexOf(normalizedDate);
    if (idx < 0) return Promise.reject(new Error(`Date '${date}' not fond.`));

    const promise: Promise<SpinalTimeSeriesArchiveDay> = getArchive.call(this);
    this.itemLoadedDictionary.set(normalizedDate, promise);
    return promise;

    function getArchive(): Promise<SpinalTimeSeriesArchiveDay> {
      return new Promise((resolve) => {
        const ptr: Ptr<SpinalTimeSeriesArchiveDay> = this.lstItem[idx];
        if (typeof ptr.data.model !== 'undefined') {
          resolve(ptr.data.model);
        } else {
          ptr.load((element: SpinalTimeSeriesArchiveDay) => {
            resolve(element);
          });
        }
      });
    }
  }

  /**
   * @returns {Lst<Val>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getDates(): Lst<Val> {
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

  public purgeArchive(maxDay: number): void {
    if (maxDay > 0) {
      let lstDateToDelete = [];
      const maxDayMS = maxDay * 86400000;
      const minDateMS = new Date().valueOf() - maxDayMS;
      for (let index = 0; index < this.lstDate.length; index += 1) {
        if (this.lstDate[index].get() <= minDateMS) {
          lstDateToDelete.push(this.lstDate[index].get());
        }
      }

      for (let elt of lstDateToDelete) {
        let id = this.lstDate.indexOf(elt);
        this.lstDate.splice(id, 1);
        this.lstItem.splice(id, 1);
      }
    } else if (maxDay === 0) {
      this.lstDate.clear();
      this.lstItem.clear();
    }
  }
}

spinalCore.register_models(SpinalTimeSeriesArchive);
