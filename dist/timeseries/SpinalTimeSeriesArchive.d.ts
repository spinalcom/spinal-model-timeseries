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
     * @returns {AsyncIterableIterator<SpinalDateValue>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTimeGen(start?: number | string | Date, end?: number | string | Date): AsyncIterableIterator<SpinalDateValue>;
    /**
     * getFromIntervalTimeGen is prefered.
     * @param {number} start
     * @param {(number|string)} [end=Date.now()]
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTime(start: number | string | Date, end?: number | string | Date): Promise<SpinalDateValue[]>;
    /**
     * @param {(number | string | Date)} date
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getArchiveAtDate(date: number | string | Date): Promise<SpinalTimeSeriesArchiveDay>;
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
