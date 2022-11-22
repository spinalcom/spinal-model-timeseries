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
  spinalCore,
} from 'spinal-core-connectorjs_type';
import { genUID } from '../utils/genUID';
import { loadPtr } from '../utils/loadPtr';
import { SpinalDateValue } from '../interfaces/SpinalDateValue';
import { SpinalTimeSeriesArchive } from './SpinalTimeSeriesArchive';
import { SpinalTimeSeriesArchiveDay } from './SpinalTimeSeriesArchiveDay';

/**
 * @class SpinalTimeSeries
 * @property {spinal.Str} id
 * @property {spinal.Val} maxDay
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

  public id: spinal.Str;
  public currentArchive: spinal.Ptr<SpinalTimeSeriesArchiveDay>;
  public archive: spinal.Ptr<SpinalTimeSeriesArchive>;

  public archiveProm: Promise<SpinalTimeSeriesArchive>;
  public currentProm: Promise<SpinalTimeSeriesArchiveDay>;
  private loadPtrDictionary: Map<
    number,
    Promise<SpinalTimeSeriesArchiveDay | SpinalTimeSeriesArchive>
  >;
  /**
   * @type {spinal.Val} number of days to keep, default 2 days
   * ```
   * < 0 = keep infinitly
   * 0 = no timeseries
   * > 0 = nbr of day to keep
   * ```
   * @memberof SpinalTimeSeries
   */
  public maxDay: spinal.Val;

  /**
   * Creates an instance of SpinalTimeSeries.
   * @param {number} [initialBlockSize=50]
   * @param {number} [maxDay=2] number of days to keep, default 2 days
   * ```
   * 0 = keep infinitly
   * > 0 = nbr of day to keep
   * ```
   * @memberof SpinalTimeSeries
   */
  constructor(initialBlockSize: number = 50, maxDay: number = 2) {
    super();
    this.archiveProm = null;
    this.currentProm = null;
    this.loadPtrDictionary = new Map();
    if (FileSystem._sig_server === false) return;

    const archive = new SpinalTimeSeriesArchive(initialBlockSize);
    this.archiveProm = Promise.resolve(archive);

    this.add_attr({
      id: genUID(),
      maxDay,
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
    start: number | string | Date = 0,
    end: number | string | Date = Date.now()
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
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
    start: number | string | Date = 0,
    end: number | string | Date = Date.now()
  ): Promise<SpinalDateValue[]> {
    const archive = await this.getArchive();
    return archive.getFromIntervalTime(start, end);
  }
  /**
   * @returns {Promise<SpinalDateValue>}
   * @memberof SpinalTimeSeries
   */
  public async getCurrent(): Promise<SpinalDateValue> {
    if (this.maxDay.get() === 0) {
      return Promise.resolve({
        date: NaN,
        value: NaN,
      });
    }
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

  public async setConfig(
    initialBlockSize: number,
    maxDay: number
  ): Promise<void> {
    const archive = await this.getArchive();
    archive.initialBlockSize.set(initialBlockSize);
    if (typeof this.maxDay === 'undefined') {
      this.add_attr('maxDay', maxDay);
    } else this.maxDay.set(maxDay);
  }

  /**
   * @param {number} value
   * @returns {Promise<void>}
   * @memberof SpinalTimeSeries
   */
  public async push(value: number): Promise<void> {
    if (this.maxDay.get() === 0) {
      const archive = await this.getArchive();
      archive.purgeArchive(this.maxDay.get());
      return;
    }
    let currentDay: SpinalTimeSeriesArchiveDay;
    try {
      currentDay = await this.getCurrentDay();
    } catch (error) {
      const archive = await this.getArchive();
      currentDay = await archive.getTodayArchive();
    }
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(
      Date.now()
    );
    const archive = await this.getArchive();
    if (currentDay.dateDay.get() !== normalizedDate) {
      //const archive = await this.getArchive();
      this.currentProm = archive.getTodayArchive();
      currentDay = await this.currentProm;
    }
    currentDay.push(value);
    archive.purgeArchive(this.maxDay.get());
  }

  /**
   * @param {number} value
   * @returns {Promise<void>}
   * @memberof SpinalTimeSeries
   */
  public async insert(
    value: number,
    date: number | string | Date
  ): Promise<void> {
    let currentDay: SpinalTimeSeriesArchiveDay;
    const archive = await this.getArchive();
    if (this.maxDay.get() !== 0) {
      currentDay = await archive.getOrCreateArchiveAtDate(date);
      currentDay.insert(value, date);
    }
    archive.purgeArchive(this.maxDay.get());
  }

  /**
   * @param {(number | string | Date)} date
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  public async getDataOfDay(
    date: number | string | Date
  ): Promise<SpinalTimeSeriesArchiveDay> {
    const archive = await this.getArchive();
    return archive.getArchiveAtDate(date);
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchive>}
   * @memberof SpinalTimeSeries
   */
  public getArchive(): Promise<SpinalTimeSeriesArchive> {
    if (this.archiveProm !== null) return this.archiveProm;
    this.archiveProm = <Promise<SpinalTimeSeriesArchive>>(
      loadPtr(this.loadPtrDictionary, this.archive)
    );
    return this.archiveProm;
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  public getCurrentDay(): Promise<SpinalTimeSeriesArchiveDay> {
    if (this.currentProm !== null) return this.currentProm;
    this.currentProm = <Promise<SpinalTimeSeriesArchiveDay>>(
      loadPtr(this.loadPtrDictionary, this.currentArchive)
    );
    return this.currentProm;
  }

  /**
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromYesterday(): Promise<
    AsyncIterableIterator<SpinalDateValue>
  > {
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
  public getDataFromLast24Hours(): Promise<
    AsyncIterableIterator<SpinalDateValue>
  > {
    return this.getDataFromLastDays(1);
  }

  /**
   * @param {number} [numberOfHours=1]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getDataFromLastHours(
    numberOfHours: number = 1
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
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
  public async getDataFromLastDays(
    numberOfDays: number = 1
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
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
};
