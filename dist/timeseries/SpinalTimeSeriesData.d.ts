import { Model } from "spinal-core-connectorjs_type";
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
export declare class SpinalTimeSeriesData extends Model {
    start: spinal.Val;
    end: spinal.Val;
    length: spinal.Val;
    private lstDate;
    private lstValue;
    private maxBlockSize;
    constructor(maxBlockSize?: number);
    push(data: any): Promise<boolean>;
    get(index: number): Promise<SpinalDateValue>;
    get(): Promise<SpinalDateValueArray>;
    at(index: number): Promise<SpinalDateValue>;
    getFromIntervalTimeGen(start?: number | string | Date, end?: number | string | Date): AsyncGenerator<any, void, unknown>;
    private _getPtrValue;
    private _getLstDateAndLstValue;
}
export default SpinalTimeSeriesData;
