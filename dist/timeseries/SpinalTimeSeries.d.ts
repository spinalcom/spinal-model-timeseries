import { Model } from 'spinal-core-connectorjs_type';
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
declare class SpinalTimeSeries extends Model {
    /**
     * @static
     * @type {string}
     * @memberof SpinalTimeSeries
     */
    static relationName: string;
    /**
     * @static
     * @type {string}
     * @memberof SpinalTimeSeries
     */
    static nodeTypeName: string;
    id: spinal.Str;
    currentArchive: spinal.Ptr<SpinalTimeSeriesArchiveDay>;
    archive: spinal.Ptr<SpinalTimeSeriesArchive>;
    archiveProm: Promise<SpinalTimeSeriesArchive>;
    currentProm: Promise<SpinalTimeSeriesArchiveDay>;
    private loadPtrDictionary;
    /**
     * @type {spinal.Val} number of days to keep, default 2 days
     * ```
     * < 0 = keep infinitly
     * 0 = no timeseries
     * > 0 = nbr of day to keep
     * ```
     * @memberof SpinalTimeSeries
     */
    maxDay: spinal.Val;
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
    constructor(initialBlockSize?: number, maxDay?: number);
    /**
     * @param {(number|string|Date)} [start=0]
     * @param {(number|string|Date)} [end=Date.now()]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getFromIntervalTimeGen(start?: number | string | Date, end?: number | string | Date): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @param {(number|string|Date)} [start=0]
     * @param {(number|string|Date)} [end=Date.now()]
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalTimeSeries
     */
    getFromIntervalTime(start?: number | string | Date, end?: number | string | Date): Promise<SpinalDateValue[]>;
    /**
     * @returns {Promise<SpinalDateValue>}
     * @memberof SpinalTimeSeries
     */
    getCurrent(): Promise<SpinalDateValue>;
    setConfig(initialBlockSize: number, maxDay: number): Promise<void>;
    /**
     * @param {number} value
     * @returns {Promise<void>}
     * @memberof SpinalTimeSeries
     */
    push(value: number): Promise<void>;
    /**
     * @param {number} value
     * @returns {Promise<void>}
     * @memberof SpinalTimeSeries
     */
    insert(value: number, date: number | string | Date): Promise<void>;
    /**
     * @param {(number | string | Date)} date
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeries
     */
    getDataOfDay(date: number | string | Date): Promise<SpinalTimeSeriesArchiveDay>;
    /**
     * @returns {Promise<SpinalTimeSeriesArchive>}
     * @memberof SpinalTimeSeries
     */
    getArchive(): Promise<SpinalTimeSeriesArchive>;
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeries
     */
    getCurrentDay(): Promise<SpinalTimeSeriesArchiveDay>;
    /**
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromYesterday(): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @alias getDataFromLastDays(1)
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromLast24Hours(): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @param {number} [numberOfHours=1]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromLastHours(numberOfHours?: number): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @param {number} [numberOfDays=1]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromLastDays(numberOfDays?: number): Promise<AsyncIterableIterator<SpinalDateValue>>;
}
export default SpinalTimeSeries;
export { SpinalTimeSeries, SpinalTimeSeriesArchive, SpinalTimeSeriesArchiveDay, };
