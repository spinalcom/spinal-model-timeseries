import { Model, type Val } from 'spinal-core-connectorjs';
import type { SpinalDateValue } from '../interfaces/SpinalDateValue';
import type { SpinalDateValueArray } from '../interfaces/SpinalDateValueArray';
/**
 * @property {Lst<Val>} lstDate
 * @property {Lst<Val>} lstValue
 * @property {Val} length
 * @property {Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
export declare class SpinalTimeSeriesArchiveDay extends Model {
    /**
     * @private
     * @type {Lst<Val>}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    private lstDate;
    /**
     * @private
     * @type {Lst<Val>}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    private lstValue;
    length: Val;
    dateDay: Val;
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
