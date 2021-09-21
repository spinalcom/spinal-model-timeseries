import { Model } from 'spinal-core-connectorjs_type';
import { SpinalDateValue } from '../interfaces/SpinalDateValue';
import { SpinalDateValueArray } from '../interfaces/SpinalDateValueArray';
/**
 * @property {spinal.Lst<spinal.Val>} lstDate
 * @property {spinal.Lst<spinal.Val>} lstValue
 * @property {spinal.Val} length
 * @property {spinal.Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
export declare class SpinalTimeSeriesArchiveDay extends Model {
    /**
     * @private
     * @type {spinal.Lst<spinal.Val>}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    private lstDate;
    /**
     * @private
     * @type {spinal.Lst<spinal.Val>}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    private lstValue;
    length: spinal.Val;
    dateDay: spinal.Val;
    constructor(initialBlockSize?: number);
    /**
     * @param {number} data
     * @memberof SpinalTimeSeriesArchiveDay
     */
    push(data: number): void;
    /**
     * @param {number} data
     * @param {(number|string|Date)} date
     * @returns {boolean}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    insert(data: number, date: number | string | Date): boolean;
    private setLstVal;
    /**
     * @param {number} index
     * @returns {SpinalDateValue}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    get(index: number): SpinalDateValue;
    /**
     * @returns {SpinalDateValueArray}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    get(): SpinalDateValueArray;
    /**
     * alias of 'get' method with index
     * @param {number} index
     * @returns {SpinalDateValue}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    at(index: number): SpinalDateValue;
    /**
     * For Tests - returns the TypedArrays' size
     * @memberof SpinalTimeSeriesArchiveDay
     */
    getActualBufferSize(): number;
    /**
     * @private
     * @memberof SpinalTimeSeriesArchiveDay
     */
    private addBufferSizeLength;
    private upgradeFromOldTimeSeries;
}
export default SpinalTimeSeriesArchiveDay;
