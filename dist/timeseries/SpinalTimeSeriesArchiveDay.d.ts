import { Model } from "spinal-core-connectorjs_type";
import { SpinalDateValue, SpinalDateValueArray, SpinalTimeSeriesData } from "./SpinalTimeSeriesData";
/**
 * @property {spinal.TypedArray_Float64} lstDate
 * @property {spinal.TypedArray_Float64} lstValue
 * @property {spinal.Val} length
 * @property {spinal.Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
export declare class SpinalTimeSeriesArchiveDay extends Model {
    data: spinal.Lst<SpinalTimeSeriesData>;
    dateDay: spinal.Val;
    private blockSize;
    constructor(initialBlockSize?: number);
    /**
     * @param {number} value
     * @memberof SpinalTimeSeriesArchiveDay
     */
    push(value: number): Promise<void>;
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
    getFromIntervalTimeGen(start?: number | string | Date, end?: number | string | Date): AsyncGenerator<any, void, unknown>;
    private _getItemDate;
}
export default SpinalTimeSeriesArchiveDay;
