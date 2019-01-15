import { Model } from 'spinal-core-connectorjs_type';
/**
 * @property {number} date
 * @property {number} value
 * @interface SpinalDateValue
 */
export interface SpinalDateValue {
    date: number;
    value: number;
}
/**
 * @property {number} dateDay
 * @property {Float64Array} date
 * @property {Float64Array} value
 * @interface SpinalDateValueArray
 */
export interface SpinalDateValueArray {
    dateDay: number;
    date: Float64Array;
    value: Float64Array;
}
/**
 * @property {spinal.TypedArray_Float64} lstDate
 * @property {spinal.TypedArray_Float64} lstValue
 * @property {spinal.Val} length
 * @property {spinal.Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
export declare class SpinalTimeSeriesArchiveDay extends Model {
    /**
     * @private
     * @type {spinal.TypedArray_Float64}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    private lstDate;
    /**
     * @private
     * @type {spinal.TypedArray_Float64}
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
}
export default SpinalTimeSeriesArchiveDay;
