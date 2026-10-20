import { Model, type Lst, type Val } from 'spinal-core-connectorjs';
import { SpinalTimeSeriesArchiveDay } from './SpinalTimeSeriesArchiveDay';
import type { SpinalDateValue } from '../interfaces/SpinalDateValue';
/**
 * @class SpinalTimeSeriesArchive
 * @extends {Model}
 */
export declare class SpinalTimeSeriesArchive extends Model {
    private lstDate;
    private lstItem;
    initialBlockSize: Val;
    /**
     * number of days a read loads ahead : more is faster on long intervals, but
     * the hub sends them in one answer, that the program handles at once
     */
    static loadAhead: number;
    private itemLoadedDictionary;
    private loadPtrDictionary;
    /**
     *Creates an instance of SpinalTimeSeriesArchive.
     * @param {number} [initialBlockSize=SpinalTimeSeriesConfig.INIT_BLOCK_SIZE]
     * @memberof SpinalTimeSeriesArchive
     */
    constructor(initialBlockSize?: number);
    /**
     * @static
     * @param {(number | string | Date)} date
     * @returns {number}
     * @memberof SpinalTimeSeriesArchive
     */
    static normalizeDate(date: number | string | Date): number;
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getTodayArchive(): Promise<SpinalTimeSeriesArchiveDay>;
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getOrCreateArchiveAtDate(atDate: number | string | Date): Promise<SpinalTimeSeriesArchiveDay>;
    /**
     * @memberof SpinalTimeSeriesArchive
     */
    cleanUpNaNDates(): void;
    /**
     * @param {(number|string)} [start=0]
     * @param {(number|string)} [end=Date.now()]
     * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
     * @returns {AsyncIterableIterator<SpinalDateValue>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTimeGen(start?: number | string | Date, end?: number | string | Date, includeLastBeforeStart?: boolean): AsyncIterableIterator<SpinalDateValue>;
    /**
     * The interval asked, checked, and the days that may hold it, in the order
     * of the list : the readers go through them in that order.
     */
    private intervalOf;
    /**
     * The values of an interval, a day at a time. The next days load while one
     * is read : SpinalTimeSeriesArchive.loadAhead days at once, not one round
     * trip to the hub per day, nor one answer big enough to block the program.
     */
    private valuesByDay;
    /**
     * This function is used to get the last timeseries at a specific date.
     * It will fetch the last timeseries before or at the given date.
     * @param date
     */
    getLastTimeSeriesAtDate(date: number | string | Date): Promise<SpinalDateValue>;
    /**
     * getFromIntervalTimeGen is prefered.
     * @param {number} start
     * @param {(number|string)} [end=Date.now()]
     * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTime(start: number | string | Date, end?: number | string | Date, includeLastBeforeStart?: boolean): Promise<SpinalDateValue[]>;
    /**
     * @param {(number | string | Date)} date
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getArchiveAtDate(date: number | string | Date, offsetArchive?: number): Promise<SpinalTimeSeriesArchiveDay>;
    /** the archive of a day, loaded once ; a failed load is tried again on the next call */
    private loadDay;
    /** keeps a day loading, forgets it if the load fails : the next call tries again */
    private keepLoaded;
    /**
     * @returns {Lst<Val>}
     * @memberof SpinalTimeSeriesArchive
     */
    getDates(): Lst<Val>;
    /**
     * @param {(number | string | Date)} date
     * @returns {boolean}
     * @memberof SpinalTimeSeriesArchive
     */
    dateExist(date: number | string | Date): boolean;
    purgeArchive(maxDay: number): void;
}
