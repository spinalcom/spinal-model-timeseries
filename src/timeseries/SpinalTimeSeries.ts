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
  type Val,
  type Str,
} from 'spinal-core-connectorjs';
import { genUID } from '../utils/genUID';
import { loadPtr } from '../utils/loadPtr';
import { SpinalDateValue } from '../interfaces/SpinalDateValue';
import { SpinalTimeSeriesArchive } from './SpinalTimeSeriesArchive';
import { SpinalTimeSeriesArchiveDay } from './SpinalTimeSeriesArchiveDay';
import { SpinalTimeSeriesConfig } from '../SpinalTimeSeriesConfig';

/**
 * @class SpinalTimeSeries
 * @property {Str} id
 * @property {Val} maxDay
 * @property {Ptr<SpinalTimeSeriesArchive>} archive
 * @property {Ptr<SpinalTimeSeriesArchiveDay>} currentArchive
 * @extends {Model}
 */
export class SpinalTimeSeries extends Model {
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

  public id: Str;
  public currentArchive: Ptr<SpinalTimeSeriesArchiveDay>;
  public archive: Ptr<SpinalTimeSeriesArchive>;

  public archiveProm: Promise<SpinalTimeSeriesArchive>;
  // the archive of the last day pushed to, at hand for the next pushes
  private dayCache: { day: number; promise: Promise<SpinalTimeSeriesArchiveDay> } = null;
  private loadPtrDictionary: Map<
    number,
    Promise<SpinalTimeSeriesArchiveDay | SpinalTimeSeriesArchive>
  >;
  /**
   * @type {Val} number of days to keep, default 2 days
   * ```
   * < 0 = keep infinitly
   * 0 = no timeseries
   * > 0 = nbr of day to keep
   * ```
   * @memberof SpinalTimeSeries
   */
  public maxDay: Val;

  /**
   * Creates an instance of SpinalTimeSeries.
   * @param {number} [initialBlockSize=SpinalTimeSeriesConfig.INIT_BLOCK_SIZE]
   * @param {number} [maxDay=SpinalTimeSeriesConfig.MAX_DAY] number of days to keep, default 2 days
   * ```
   * 0 = keep infinitly
   * > 0 = nbr of day to keep
   * ```
   * @memberof SpinalTimeSeries
   */
  constructor(
    initialBlockSize: number = SpinalTimeSeriesConfig.INIT_BLOCK_SIZE,
    maxDay: number = SpinalTimeSeriesConfig.MAX_DAY
  ) {
    super();
    this.archiveProm = null;
    this.dayCache = null;
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
   * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalTimeSeries
   */
  public async getFromIntervalTimeGen(
    start: number | string | Date = 0,
    end: number | string | Date = Date.now(),
    includeLastBeforeStart: boolean = false,
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
    const archive = await this.getArchive();
    return archive.getFromIntervalTimeGen(start, end, includeLastBeforeStart);
  }
  /**
   * @param {(number|string|Date)} [start=0]
   * @param {(number|string|Date)} [end=Date.now()]
   * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalTimeSeries
   */
  public async getFromIntervalTime(
    start: number | string | Date = 0,
    end: number | string | Date = Date.now(),
    includeLastBeforeStart: boolean = false,
  ): Promise<SpinalDateValue[]> {
    const archive = await this.getArchive();
    return archive.getFromIntervalTime(start, end, includeLastBeforeStart);
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
    const currentDay = await this.getCurrentDay();
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
   * Adds a value at the end of the timeseries.
   *
   * The date defaults to the moment push is called, not to the moment the
   * value is stored : when the archive of the day has to be loaded first, the
   * hub may take long to answer (or be down), and the value keeps its time.
   * @param {number} value
   * @param {(number|string|Date)} [date=Date.now()] the time of the measure
   * @return {*}  {Promise<void>}
   * @memberof SpinalTimeSeries
   */
  public async push(
    value: number,
    date: number | string | Date = Date.now()
  ): Promise<void> {
    const time = new Date(date).getTime();
    if (isNaN(time)) throw new Error(`the value [${date}] is not a valid date`);
    const archive = await this.getArchive();
    if (this.maxDay.get() !== 0) {
      const day = await this.getDayArchive(time);
      day.push(value, time);
    }
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
    const promise = <Promise<SpinalTimeSeriesArchive>>(
      loadPtr(this.loadPtrDictionary, this.archive)
    );
    this.archiveProm = promise;
    // a failed load is tried again on the next call, instead of failing forever
    promise.catch(() => {
      if (this.archiveProm === promise) this.archiveProm = null;
    });
    return promise;
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeries
   */
  public getCurrentDay(): Promise<SpinalTimeSeriesArchiveDay> {
    return this.getDayArchive(Date.now());
  }

  /**
   * The archive of the day of a date, created if needed. The last one is kept
   * at hand : consecutive pushes do not look for it again.
   */
  private getDayArchive(date: number): Promise<SpinalTimeSeriesArchiveDay> {
    const day = SpinalTimeSeriesArchive.normalizeDate(date);
    if (this.dayCache !== null && this.dayCache.day === day) {
      return this.dayCache.promise;
    }
    const promise = this.getArchive().then((archive) =>
      archive.getOrCreateArchiveAtDate(day)
    );
    this.dayCache = { day, promise };
    // a failed load is tried again on the next call
    promise.catch(() => {
      if (this.dayCache !== null && this.dayCache.promise === promise) {
        this.dayCache = null;
      }
    });
    return promise;
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
