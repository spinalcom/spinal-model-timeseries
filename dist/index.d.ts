import { SpinalTimeSeries, SpinalTimeSeriesArchive, SpinalTimeSeriesArchiveDay } from './timeseries/SpinalTimeSeries';
import { TimeSeriesEndpointCfg } from './interfaces/TimeSeriesEndpointCfg';
import { TimeSeriesIntervalDate } from './interfaces/TimeSeriesIntervalDate';
import { SpinalAttribute } from 'spinal-models-documentation';
import { SpinalDateValue } from './interfaces/SpinalDateValue';
import { SpinalDateValueArray } from './interfaces/SpinalDateValueArray';
type EndpointId = string;
/**
 * @class SpinalServiceTimeseries
 */
export default class SpinalServiceTimeseries {
    private timeSeriesDictionnary;
    /**
     *Creates an instance of SpinalServiceTimeseries.
     * @memberof SpinalServiceTimeseries
     */
    constructor();
    /**
     * @param {EndpointId} endpointNodeId
     * @param {(number|boolean)} value
     * @returns {Promise<boolean>}
     * @memberof SpinalServiceTimeseries
     */
    pushFromEndpoint(endpointNodeId: EndpointId, value: number | boolean): Promise<boolean>;
    /**
     * @param {EndpointId} endpointNodeId
     * @param {(number|boolean)} value
     * @param {(number|string|Date)} date
     * @returns {Promise<boolean>}
     * @memberof SpinalServiceTimeseries
     */
    insertFromEndpoint(endpointNodeId: EndpointId, value: number | boolean, date: number | string | Date): Promise<boolean>;
    /**
     * @param {EndpointId} endpointNodeId
     * @returns {Promise<boolean>}
     * @memberof SpinalServiceTimeseries
     */
    hasTimeSeries(endpointNodeId: EndpointId): Promise<boolean>;
    /**
     * @param {EndpointId} endpointNodeId
     * @returns {Promise<SpinalTimeSeries>}
     * @memberof SpinalServiceTimeseries
     */
    getOrCreateTimeSeries(endpointNodeId: EndpointId): Promise<SpinalTimeSeries>;
    private getConfigFormEndpoint;
    private getOrCreateTimeSeriesProm;
    /**
     * @param {SpinalTimeSeries} timeseries
     * @return {Promise<SpinalDateValue>}
     * @memberof SpinalServiceTimeseries
     */
    getCurrent(timeseries: SpinalTimeSeries): Promise<SpinalDateValue>;
    /**
     * @param {SpinalTimeSeries} timeseries
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getDataFromLast24Hours(timeseries: SpinalTimeSeries): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @param {SpinalTimeSeries} timeseries
     * @param {number} [numberOfHours=1]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getDataFromLastHours(timeseries: SpinalTimeSeries, numberOfHours?: number): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @param {SpinalTimeSeries} timeseries
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getDataFromYesterday(timeseries: SpinalTimeSeries): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @param {SpinalTimeSeries} timeseries
     * @param {(string|number|Date)} [start=0]
     * @param {(string|number|Date)} [end=Date.now()]
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalServiceTimeseries
     */
    getFromIntervalTime(timeseries: SpinalTimeSeries, start?: string | number | Date, end?: string | number | Date): Promise<SpinalDateValue[]>;
    /**
     * @param {SpinalTimeSeries} timeseries
     * @param {(string|number|Date)} [start=0]
     * @param {(string|number|Date)} [end=Date.now()]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getFromIntervalTimeGen(timeseries: SpinalTimeSeries, start?: string | number | Date, end?: string | number | Date): Promise<AsyncIterableIterator<SpinalDateValue>>;
    /**
     * @param {EndpointId} endpointNodeId
     * @return {Promise<SpinalTimeSeries>}
     * @memberof SpinalServiceTimeseries
     */
    getTimeSeries(endpointNodeId: EndpointId): Promise<SpinalTimeSeries>;
    /**
     * @param {number} [numberOfHours=1]
     * @return {TimeSeriesIntervalDate}
     * @memberof SpinalServiceTimeseries
     */
    getDateFromLastHours(numberOfHours?: number): TimeSeriesIntervalDate;
    /**
     * @param {number} [numberOfDays=1]
     * @return {TimeSeriesIntervalDate}
     * @memberof SpinalServiceTimeseries
     */
    getDateFromLastDays(numberOfDays?: number): TimeSeriesIntervalDate;
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<SpinalDateValue[]>}
     * @memberof SpinalServiceTimeseries
     */
    getData(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<SpinalDateValue[]>;
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMean(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMeanWithoutNegativeValues(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
    /**
     * getIntegral | time in ms
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getIntegral(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return  {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMax(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMin(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getSum(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
}
/**
 * @template T
 * @param {AsyncIterableIterator<T>} it
 * @return {Promise<T[]>}
 */
declare function asyncGenToArray<T>(it: AsyncIterableIterator<T>): Promise<T[]>;
export { asyncGenToArray, SpinalServiceTimeseries, SpinalTimeSeries, SpinalTimeSeriesArchive, SpinalTimeSeriesArchiveDay, TimeSeriesEndpointCfg, TimeSeriesIntervalDate, SpinalAttribute, SpinalDateValue, SpinalDateValueArray, };
