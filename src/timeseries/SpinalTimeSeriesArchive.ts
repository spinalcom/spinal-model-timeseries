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

  /**
   * number of days a read loads ahead : more is faster on long intervals, but
   * the hub sends them in one answer, that the program handles at once
   */
  public static loadAhead: number = 8;

  // not synchronized
  private itemLoadedDictionary: Map<
    number,
    Promise<SpinalTimeSeriesArchiveDay>
  >;
  private loadPtrDictionary: Map<number, Promise<SpinalTimeSeriesArchiveDay>>;
  // the rebuild of lstDate in progress, see realign
  private realigning: Promise<void>;

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
    this.realigning = null;
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
    return this.getOrCreateArchiveAtDate(Date.now());
  }

  /**
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getOrCreateArchiveAtDate(
    atDate: number | string | Date
  ): Promise<SpinalTimeSeriesArchiveDay> {
    const date = SpinalTimeSeriesArchive.normalizeDate(atDate);
    if (isNaN(date)) {
      throw `the value [${atDate}] is not a valid date`;
    }
    return this.getOrCreateDay(date, true);
  }

  private getOrCreateDay(
    date: number,
    mayRealign: boolean
  ): Promise<SpinalTimeSeriesArchiveDay> {
    if (!this.isAligned()) {
      return mayRealign
        ? this.realign().then(() => this.getOrCreateDay(date, false))
        : Promise.reject(new MisalignedError(this));
    }
    this.cleanUpNaNDates();
    const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);

    if (spinalTimeSeriesArchiveDay !== undefined) {
      return spinalTimeSeriesArchiveDay;
    }
    for (let index = 0; index < this.lstDate.length; index += 1) {
      const element = this.lstDate[index];
      const ptr = this.lstItem[index];
      if (element.get() === date) {
        const promise = loadPtr(this.loadPtrDictionary, ptr).then((day) => {
          if (isDayOf(day, date)) return day;
          // the list said this archive is another day : rebuilt, then looked for again
          if (!mayRealign) throw new MisalignedError(this, date, day);
          return this.realign().then(() => this.getOrCreateDay(date, false));
        });
        return this.keepLoaded(date, promise);
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
    // it removes a date and the archive at the same index : only when they match
    if (!this.isAligned()) return;
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
    if (!this.isAligned()) await this.realign();
    const interval = this.intervalOf(start, end);
    if (includeLastBeforeStart) {
      const lastTs = await this.getLastTimeSeriesAtDate(interval.startEpoch);
      if (lastTs && lastTs.date < interval.startEpoch) { // only yield if before start date because if equal it will be yielded in the main loop
        yield lastTs;
      }
    }
    try {
      for await (const values of this.valuesByDay(interval)) {
        for (const value of values) yield value;
      }
    } catch (error) {
      // the values already given cannot be taken back : this read fails, the
      // next ones read the rebuilt archive
      if (error instanceof MisalignedError) await this.realign();
      throw error;
    }
  }

  /**
   * The interval asked, checked, and the days that may hold it, in the order
   * of the list : the readers go through them in that order.
   */
  private intervalOf(
    start: number | string | Date,
    end: number | string | Date
  ): Interval {
    this.cleanUpNaNDates();
    const normalizedStart = SpinalTimeSeriesArchive.normalizeDate(start); // Get the date at start of the day
    const endEpoch =
      typeof end === 'number' || typeof end === 'string'
        ? new Date(end).getTime()
        : end.getTime();
    const startEpoch = typeof start === 'number' || typeof start === 'string'
      ? new Date(start).getTime()
      : start.getTime();

    if (isNaN(normalizedStart)) {
      throw `the value 'start' [${start}] is not a valid date`;
    }
    if (isNaN(endEpoch)) {
      throw `the value 'end' [${end}] is not a valid date`;
    }
    // a date listed twice reads its first archive, like getArchiveAtDate
    const firstPtr = new Map<number, Ptr<SpinalTimeSeriesArchiveDay>>();
    const dates: number[] = [];
    for (let idx = 0; idx < this.lstDate.length; idx += 1) {
      const date = this.lstDate[idx].get();
      if (!firstPtr.has(date)) firstPtr.set(date, this.lstItem[idx]);
      if (normalizedStart > date) continue; // Skip until correct day.
      dates.push(date);
    }
    const days = dates.map((date) => ({ date, ptr: firstPtr.get(date) }));
    return { normalizedStart, startEpoch, endEpoch, days };
  }

  /**
   * The values of an interval, a day at a time. The next days load while one
   * is read : SpinalTimeSeriesArchive.loadAhead days at once, not one round
   * trip to the hub per day, nor one answer big enough to block the program.
   */
  private async *valuesByDay(interval: Interval): AsyncGenerator<SpinalDateValue[]> {
    const { days } = interval;
    // the days after the first one past the interval are only read if it is
    // empty : they load when needed, not ahead
    const firstAfter = days.findIndex((day) => day.date > interval.endEpoch);
    const aheadLimit = firstAfter < 0 ? days.length : firstAfter + 1;
    const ahead: Promise<SpinalTimeSeriesArchiveDay>[] = [];
    let next = 0;
    for (let i = 0; i < days.length; i += 1) {
      while (
        next < days.length &&
        (next === i ||
          (next < aheadLimit && next - i < SpinalTimeSeriesArchive.loadAhead))
      ) {
        ahead.push(this.loadDay(days[next].date, days[next].ptr));
        next += 1;
      }
      const archive = await ahead.shift();
      const values: SpinalDateValue[] = [];
      const goOn = readDay(archive, days[i].date, interval, values);
      if (values.length > 0) yield values;
      if (!goOn) return;
    }
  }

  /**
   * This function is used to get the last timeseries at a specific date.
   * It will fetch the last timeseries before or at the given date.
   * @param date 
   */
  public async getLastTimeSeriesAtDate(
    date: number | string | Date
  ) {
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(date);
    if (isNaN(normalizedDate)) {
      throw `the value [${date}] is not a valid date`;
    }
    if (!this.isAligned()) await this.realign();

    let validArchiveDate = null;
    let idx;

    for (idx = 0; idx < this.lstDate.length; idx += 1) {
      const element = this.lstDate[idx].get();
      if (element > normalizedDate) break; // Skip until correct day.
      validArchiveDate = element;
    }

    if (validArchiveDate === null) return null;


    const archive = await this.getArchiveAtDate(validArchiveDate);

    const startEpoch = typeof date === 'number' || typeof date === 'string'
      ? new Date(date).getTime()
      : date.getTime();

    const archiveLen = archive.length.get();
    for (let index = archiveLen - 1; index >= 0; index -= 1) {
      const dateValue = archive.get(index);
      if (dateValue.date <= startEpoch) {
        return dateValue;
      }
    }



    // if no data found in the current archive, return last data from previous archive
    idx -= 2; // move to previous archive
    if (idx < 0) return null; // no previous archive
    const previousArchiveDate = this.lstDate[idx].get();
    const previousArchive = await this.getArchiveAtDate(previousArchiveDate);
    const previousArchiveLen = previousArchive.length.get();
    if (previousArchiveLen === 0) return null;
    return previousArchive.get(previousArchiveLen - 1);



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
    if (!this.isAligned()) await this.realign();
    try {
      return await this.readInterval(start, end, includeLastBeforeStart);
    } catch (error) {
      if (!(error instanceof MisalignedError)) throw error;
      // a day was not the one its date said : rebuilt, then read again
      await this.realign();
      return this.readInterval(start, end, includeLastBeforeStart);
    }
  }

  private async readInterval(
    start: number | string | Date,
    end: number | string | Date,
    includeLastBeforeStart: boolean
  ): Promise<SpinalDateValue[]> {
    const interval = this.intervalOf(start, end);
    const result: SpinalDateValue[] = [];
    if (includeLastBeforeStart) {
      const lastTs = await this.getLastTimeSeriesAtDate(interval.startEpoch);
      if (lastTs && lastTs.date < interval.startEpoch) result.push(lastTs);
    }
    // a day at a time, not a value at a time through the generator
    for await (const values of this.valuesByDay(interval)) {
      for (const value of values) result.push(value);
    }
    return result;
  }

  /**
   * @param {(number | string | Date)} date
   * @returns {Promise<SpinalTimeSeriesArchiveDay>}
   * @memberof SpinalTimeSeriesArchive
   */
  public getArchiveAtDate(
    date: number | string | Date,
    offsetArchive: number = 0
  ): Promise<SpinalTimeSeriesArchiveDay> {
    const normalizedDate: number = SpinalTimeSeriesArchive.normalizeDate(date);
    if (isNaN(normalizedDate)) {
      throw `the value [${date}] is not a valid date`;
    }
    return this.findDay(date, normalizedDate, offsetArchive, true);
  }

  private findDay(
    date: number | string | Date,
    normalizedDate: number,
    offsetArchive: number,
    mayRealign: boolean
  ): Promise<SpinalTimeSeriesArchiveDay> {
    const again = (error: unknown): Promise<SpinalTimeSeriesArchiveDay> => {
      if (!(error instanceof MisalignedError) || !mayRealign) return Promise.reject(error);
      return this.realign().then(() => this.findDay(date, normalizedDate, offsetArchive, false));
    };
    if (!this.isAligned()) return again(new MisalignedError(this));
    this.cleanUpNaNDates();
    if (offsetArchive === 0 && this.itemLoadedDictionary.has(normalizedDate)) {
      return this.itemLoadedDictionary.get(normalizedDate);
    }
    let idx = this.lstDate.indexOf(normalizedDate);
    if (idx < 0) return Promise.reject(new Error(`Date '${date}' not found.`));

    idx += offsetArchive;
    if (idx < 0 || idx >= this.lstDate.length) {
      return Promise.reject(
        new Error(
          `Offset '${offsetArchive}' is out of bounds for date '${date}'.`
        )
      );
    }
    // the day loaded, which is not the one asked with an offset
    const archiveDate: number = this.lstDate[idx].get();
    if (this.itemLoadedDictionary.has(archiveDate)) {
      return this.itemLoadedDictionary.get(archiveDate);
    }

    return this.loadDay(archiveDate, this.lstItem[idx]).catch(again);
  }

  /** the archive of a day, loaded once ; a failed load is tried again on the next call */
  private loadDay(
    date: number,
    ptr: Ptr<SpinalTimeSeriesArchiveDay>
  ): Promise<SpinalTimeSeriesArchiveDay> {
    const loaded = this.itemLoadedDictionary.get(date);
    if (loaded !== undefined) return loaded;
    // a date without archive : lstDate is longer than lstItem
    if (ptr === undefined) return Promise.reject(new MisalignedError(this, date));
    const promise = new Promise<SpinalTimeSeriesArchiveDay>((resolve, reject) => {
      if (typeof ptr.data.model !== 'undefined') {
        resolve(ptr.data.model);
      } else {
        ptr.load((element: SpinalTimeSeriesArchiveDay, error?: boolean | string) => {
          if (element && !error) resolve(element);
          else reject(new Error(`the archive of the day ${new Date(date).toISOString()} could not be loaded`));
        });
      }
    }).then((day) => {
      if (!isDayOf(day, date)) throw new MisalignedError(this, date, day);
      return day;
    });
    return this.keepLoaded(date, promise);
  }

  /** whether there is an archive for every date, the same number of each */
  public isAligned(): boolean {
    return this.lstDate.length === this.lstItem.length;
  }

  /**
   * lstDate and lstItem are two lists that the hub stores apart : a write of
   * one that does not reach it (a program that stops between the two, a hub
   * that restarts), or two programs writing the archive at once, leave them
   * misaligned, the date of a day pointing to another day or to nothing.
   *
   * Rebuilds lstDate from the day each archive of lstItem holds, in the same
   * order, the way it is fixed by hand. An empty pointer of lstItem is dropped.
   * Nothing changes if an archive can not be loaded. Loads every archive once.
   * One rebuild at a time ; the calls made meanwhile wait for it.
   */
  public realign(): Promise<void> {
    if (this.realigning === null) {
      const done = () => {
        this.realigning = null;
      };
      this.realigning = this.rebuildDates().then(done, (error) => {
        done();
        throw error;
      });
    }
    return this.realigning;
  }

  private async rebuildDates(): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const ptrs: Ptr<SpinalTimeSeriesArchiveDay>[] = [];
      for (let idx = 0; idx < this.lstItem.length; idx += 1) ptrs.push(this.lstItem[idx]);
      // a few archives at a time, not every day in one answer of the hub
      const dates: number[] = [];
      for (let idx = 0; idx < ptrs.length; idx += SpinalTimeSeriesArchive.loadAhead) {
        const chunk = ptrs.slice(idx, idx + SpinalTimeSeriesArchive.loadAhead);
        dates.push(...(await Promise.all(chunk.map(dayOfPtr))));
      }
      // the list changed while the archives loaded (the hub, another program)
      if (ptrs.length !== this.lstItem.length || ptrs.some((ptr, idx) => this.lstItem[idx] !== ptr)) {
        continue;
      }
      const before = this.lstDate.length;
      this.lstDate.set(dates);
      // found through the misaligned lists
      this.itemLoadedDictionary.clear();
      // the empty pointers have a NaN date
      const dropped = dates.filter((date) => isNaN(date)).length;
      this.cleanUpNaNDates();
      console.warn(
        `[spinal-model-timeseries] timeseries archive ${this._server_id}: ${before} dates for ${ptrs.length} days, the dates were rebuilt from the days` +
          (dropped > 0 ? `, ${dropped} empty pointers removed` : '')
      );
      return;
    }
    throw new Error('the archive kept changing while its dates were rebuilt');
  }

  /** keeps a day loading, forgets it if the load fails : the next call tries again */
  private keepLoaded(
    date: number,
    promise: Promise<SpinalTimeSeriesArchiveDay>
  ): Promise<SpinalTimeSeriesArchiveDay> {
    this.itemLoadedDictionary.set(date, promise);
    promise.catch(() => {
      if (this.itemLoadedDictionary.get(date) === promise) {
        this.itemLoadedDictionary.delete(date);
      }
    });
    return promise;
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
    // it removes a date and the archive at the same index : only when they match
    if (maxDay > 0 && !this.isAligned()) return;
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
        // a value inserted later at this date goes to a new archive, not the purged one
        this.itemLoadedDictionary.delete(elt);
      }
    } else if (maxDay === 0) {
      this.lstDate.clear();
      this.lstItem.clear();
      this.itemLoadedDictionary.clear();
    }
  }
}

/** an archive whose dates do not match its days, see SpinalTimeSeriesArchive.realign */
class MisalignedError extends Error {
  constructor(
    archive: SpinalTimeSeriesArchive,
    date?: number,
    day?: SpinalTimeSeriesArchiveDay
  ) {
    super(
      day !== undefined
        ? `the date ${new Date(date).toISOString()} of the timeseries archive ${archive._server_id} holds the day ${new Date(day.dateDay.get()).toISOString()}`
        : `the timeseries archive ${archive._server_id} has ${archive.getDates().length} dates for another number of days`
    );
    this.name = 'MisalignedError';
  }
}

/** true when the archive holds the day of date, or does not say which day it holds */
function isDayOf(day: SpinalTimeSeriesArchiveDay, date: number): boolean {
  const dateDay = day?.dateDay;
  if (dateDay === undefined || typeof dateDay.get !== 'function') return true;
  return dateDay.get() === date;
}

/** the day an archive holds, NaN for an empty pointer */
async function dayOfPtr(ptr: Ptr<SpinalTimeSeriesArchiveDay>): Promise<number> {
  if (!ptr || (ptr.data.model === undefined && !ptr.data.value)) return NaN;
  const day = await new Promise<SpinalTimeSeriesArchiveDay>((resolve, reject) => {
    if (ptr.data.model !== undefined) resolve(ptr.data.model);
    else
      ptr.load((element: SpinalTimeSeriesArchiveDay, error?: boolean | string) => {
        // maybe the hub that does not answer : nothing is changed, tried again on the next call
        if (element && !error) resolve(element);
        else reject(new Error(`the timeseries day archive ${ptr.data.value} could not be loaded`));
      });
  });
  const dateDay = day.dateDay;
  if (dateDay === undefined || typeof dateDay.get !== 'function') {
    // no way to tell its day : nothing is changed
    throw new Error(`the timeseries day archive ${day._server_id} does not say which day it holds`);
  }
  return dateDay.get();
}

interface Interval {
  /** start of the day of the start */
  normalizedStart: number;
  startEpoch: number;
  endEpoch: number;
  days: { date: number; ptr: Ptr<SpinalTimeSeriesArchiveDay> }[];
}

/**
 * Pushes the values of a day that are in the interval, the way the reading
 * always went : the day of the start skips the values before it, and the
 * interval is over at the first value after its end. Returns false then.
 */
function readDay(
  archive: SpinalTimeSeriesArchiveDay,
  dayDate: number,
  interval: Interval,
  out: SpinalDateValue[]
): boolean {
  repairLength(archive);
  const archiveLen = archive.length.get();
  let index = 0;
  if (interval.normalizedStart === dayDate) {
    for (; index < archiveLen; index += 1) {
      if (archive.get(index).date >= interval.startEpoch) break;
    }
  }
  for (; index < archiveLen; index += 1) {
    const dateValue = archive.get(index);
    if (dateValue.date === 0) continue; // skip empty timeseries
    if (dateValue.date > interval.endEpoch || dateValue.date < interval.normalizedStart) return false;
    out.push(dateValue);
  }
  return true;
}

/** Fix added for weird case where archive.length has been corrupted. */
function repairLength(archive: SpinalTimeSeriesArchiveDay): void {
  if (archive.length?.get()) return;
  const incorrectlyNamedAttr = archive._attribute_names.find((attrName) => {
    return !['lstDate', 'lstValue', 'length', 'dateDay'].includes(attrName);
  });
  if (incorrectlyNamedAttr) {
    const lengthValue = archive[incorrectlyNamedAttr].get();
    archive.add_attr('length', lengthValue);
    archive.rem_attr(incorrectlyNamedAttr);
  }
}

spinalCore.register_models(SpinalTimeSeriesArchive);
