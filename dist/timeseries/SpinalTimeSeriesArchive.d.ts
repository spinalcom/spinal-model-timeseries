/// <reference types="node" />
import { Model } from 'spinal-core-connectorjs_type';
import { SpinalTimeSeriesArchiveDay, SpinalDateValue } from './SpinalTimeSeriesArchiveDay';
declare class SpinalTimeSeriesArchive extends Model {
    private lstDate;
    private lstItem;
    initialBlockSize: spinal.Val;
    private itemLoadedDictionary;
    constructor(initialBlockSize?: number);
    static normalizeDate(date: number | string | Date): number;
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getTodayArchive(): Promise<SpinalTimeSeriesArchiveDay>;
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
    getArchiveAtDate(date: number | string | Date): Promise<SpinalTimeSeriesArchiveDay>;
    /**
     * @returns {spinal.Lst<spinal.Val>}
     * @memberof SpinalTimeSeriesArchive
     */
    getDates(): spinal.Lst<spinal.Val>;
    dateExist(date: number | string | Date): boolean;
}
export default SpinalTimeSeriesArchive;
export { SpinalTimeSeriesArchive };
