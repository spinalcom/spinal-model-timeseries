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
import { Model, Ptr, spinalCore, FileSystem } from 'spinal-core-connectorjs_type';
import { genUID } from '../genUID';
import { SpinalTimeSeriesArchive } from './SpinalTimeSeriesArchive';
import {
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
} from './SpinalTimeSeriesArchiveDay';

console.log("fichier");


/**
 * @class SpinalTimeSeries
 * @property {spinal.Str} id
 * @property {spinal.Ptr<SpinalTimeSeriesArchive>} archive
 * @property {spinal.Ptr<SpinalTimeSeriesArchiveDay>} currentArchive
 * @extends {Model}
 */
class SpinalTimeSeries extends Model {
  /**
   * @static
   * @type {string}
   * @memberof SpinalTimeSeries
   */
  public static relationName: string = 'hasTimeSeries';
  /**
   * @static
   * @type {string}
   * @memberof SpinalTimeSeries
   */
  public static nodeTypeName: string = 'TimeSeries';

  id: spinal.Str;
  currentArchive: spinal.Ptr<SpinalTimeSeriesArchiveDay>;
  archive: spinal.Ptr<SpinalTimeSeriesArchive>;

  private archiveProm: Promise<SpinalTimeSeriesArchive>;
  private currentProm: Promise<SpinalTimeSeriesArchiveDay>;
  private loadPtrDictionary: Map<number,
    Promise<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive>>;

  /**
   *Creates an instance of SpinalTimeSeries.
   * @memberof SpinalTimeSeries
   */
  constructor() {
    super();
    this.archiveProm = null;
    this.currentProm = null;
    this.loadPtrDictionary = new Map;
    if (FileSystem._sig_server === false) return;

    const archive = new SpinalTimeSeriesArchive();
    this.archiveProm = Promise.resolve(archive);

    this.add_attr({
      id: genUID('SpinalTimeSeries'),
      archive: new Ptr(archive),
      currentArchive: new Ptr(0),
      currentData: 0,
    });
  }

  /**
   * @param {(number|string|Date)} [start=0]
   * @param {(number|string|Date)} [end=Date.now()]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getFromIntervalTimeGen(
    start: number|string|Date = 0,
    end: number|string|Date = Date.now())
    : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    return archive.getFromIntervalTimeGen(start, end);
  }
  /**
   * @param {(number|string|Date)} [start=0]
   * @param {(number|string|Date)} [end=Date.now()]
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalTimeSeries
   */
  public async getFromIntervalTime(
    start: number|string|Date = 0,
    end: number|string|Date = Date.now(),
    ): Promise<SpinalDateValue[]> {
    const archive = await this.getArchive();
    return archive.getFromIntervalTime(start, end);
  }
  /**
   * @returns {Promise<SpinalDateValue>}
   * @memberof SpinalTimeSeries
   */
  public async getCurrent(): Promise<SpinalDateValue> {
    let currentDay: SpinalTimeSeriesArchiveDay;
    try {
      currentDay = await this.getCurrentDay();
    } catch (error) {
      const archive = await this.getArchive();
      currentDay = await archive.getTodayArchive();
    }
    const len = currentDay.length.get();
    return currentDay.get(len - 1);
  }

  /**
   * @param {number} value
   * @returns {Promise<void>}
   * @memberof SpinalTimeSeries
   */
  async push(value: number): Promise<void> {
    let currentDay: SpinalTimeSeriesArchiveDay;
    try {
      currentDay = await this.getCurrentDay();
    } catch (error) {
      const archive = await this.getArchive();
      currentDay = await archive.getTodayArchive();
    }
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(Date.now());
    const archive = await this.getArchive();
    if (currentDay.dateDay.get() !== normalizedDate) {
      //const archive = await this.getArchive();
      this.currentProm = archive.getTodayArchive();
      currentDay = await this.currentProm;
    }
    currentDay.push(value);

    archive.purgeArchive();
    
  }

  /**
   * @param {number} value
   * @returns {Promise<void>}
   * @memberof SpinalTimeSeries
   */
  async insert(value: number, date: number|string|Date): Promise<void> {
    let currentDay: SpinalTimeSeriesArchiveDay;
    const archive = await this.getArchive();
    currentDay = await archive.getOrCreateArchiveAtDate(date);
    currentDay.insert(value, date);

    archive.purgeArchive();
  }

  /**
   * @param {(number | string | Date)} date
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  public async getDataOfDay(date: number | string | Date): Promise<SpinalTimeSeriesArchiveDay> {
    const archive = await this.getArchive();
    return archive.getArchiveAtDate(date);
  }

  /**
   * @param {spinal.Ptr<SpinalTimeSeriesArchiveDay>} ptr
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  loadPtr(ptr: spinal.Ptr<SpinalTimeSeriesArchiveDay>)
  : Promise<SpinalTimeSeriesArchiveDay>;
  /**
   * @param {spinal.Ptr<SpinalTimeSeriesArchive>} ptr
   * @returns {Promise<SpinalTimeSeriesArchive>}
   * @memberof SpinalTimeSeries
   */
  loadPtr(ptr: spinal.Ptr<SpinalTimeSeriesArchive>)
  : Promise<SpinalTimeSeriesArchive>;
  /**
   * @param {(spinal.Ptr<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive>)} ptr
   * @returns {(Promise<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive>)}
   * @memberof SpinalTimeSeries
   */
  loadPtr(ptr: spinal.Ptr<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive>)
  : Promise<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive> {
    if (typeof ptr.data.value !== 'undefined' &&
        this.loadPtrDictionary.has(ptr.data.value)) {
      return this.loadPtrDictionary.get(ptr.data.value);
    }

    if (typeof ptr.data.model !== 'undefined') {
      const res = Promise.resolve(ptr.data.model);
      if (ptr.data.value) {
        this.loadPtrDictionary.set(ptr.data.value, res);
      }
      return res;
    }

    if (typeof ptr.data.value !== 'undefined' && ptr.data.value === 0) {
      return Promise.reject('Load Ptr to 0');
    }

    if (typeof FileSystem._objects[ptr.data.value] !== 'undefined') {
      const res = Promise.resolve(
          <SpinalTimeSeriesArchiveDay>FileSystem._objects[ptr.data.value]);
      this.loadPtrDictionary.set(ptr.data.value, res);
      return Promise.resolve(res);
    }
    const res: Promise<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive> =
      new Promise((resolve) => {
        ptr.load((element) => {
          resolve(element);
        });
      });
    this.loadPtrDictionary.set(ptr.data.value, res);
    return res;

  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchive>}
   * @memberof SpinalTimeSeries
   */
  getArchive(): Promise<SpinalTimeSeriesArchive> {
    if (this.archiveProm !== null) return this.archiveProm;
    this.archiveProm = this.loadPtr(this.archive);
    return this.archiveProm;
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  getCurrentDay(): Promise<SpinalTimeSeriesArchiveDay> {
    if (this.currentProm !== null) return this.currentProm;
    this.currentProm = this.loadPtr(this.currentArchive);
    return this.currentProm;
  }

  /**
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromYesterday()
    : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    const end = new Date().setUTCHours(0, 0, 0, -1);
    const start = new Date(end).setUTCHours(0, 0, 0, 0);
    return archive.getFromIntervalTimeGen(start, end);
  }

  /**
   * @alias getDataFromLastDays(1)
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public getDataFromLast24Hours()
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    return this.getDataFromLastDays(1);
  }

  /**
   * @param {number} [numberOfHours=1]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromLastHours(numberOfHours: number = 1)
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    const end = Date.now();
    const start = new Date();
    start.setUTCHours(start.getUTCHours() - numberOfHours);
    return archive.getFromIntervalTimeGen(start, end);
  }
  /**
   * @param {number} [numberOfDays=1]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromLastDays(numberOfDays: number = 1)
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    const end = Date.now();
    const start = new Date();
    start.setDate(start.getDate() - numberOfDays);
    return archive.getFromIntervalTimeGen(start, end);
  }

}

spinalCore.register_models(SpinalTimeSeries);

export default SpinalTimeSeries;
export {
  SpinalTimeSeries,
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
};
