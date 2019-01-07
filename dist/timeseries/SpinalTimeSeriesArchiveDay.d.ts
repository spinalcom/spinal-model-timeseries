import { Model } from 'spinal-core-connectorjs_type';
interface SpinalDateValue {
    date: number;
    value: number;
}
interface SpinalDateValueArray {
    dateDay: number;
    date: Float64Array;
    value: Float64Array;
}
declare class SpinalTimeSeriesArchiveDay extends Model {
    private lstDate;
    private lstValue;
    length: spinal.Val;
    dateDay: spinal.Val;
    constructor(initialBlockSize?: number);
    push(data: number): void;
    insert(data: number, date: number | string | Date): boolean;
    get(index: number): SpinalDateValue;
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
    private addBufferSizeLength;
}
export { SpinalTimeSeriesArchiveDay, SpinalDateValue, SpinalDateValueArray };
export default SpinalTimeSeriesArchiveDay;
