/// <reference types="node" />
import { SpinalTimeSeries, SpinalTimeSeriesArchive, SpinalTimeSeriesArchiveDay, SpinalDateValue, SpinalDateValueArray } from './timeseries/SpinalTimeSeries';
declare type EndpointId = string;
declare class SpinalServiceTimeseries {
    private timeSeriesDictionnary;
    constructor();
    pushFromEndpoint(endpointNodeId: EndpointId, value: number | boolean): Promise<boolean>;
    insertFromEndpoint(endpointNodeId: EndpointId, value: number | boolean, date: number | string | Date): Promise<boolean>;
    hasTimeSeries(endpointNodeId: EndpointId): Promise<boolean>;
    getOrCreateTimeSeries(endpointNodeId: EndpointId): Promise<SpinalTimeSeries>;
    /**
     * @param {SpinalTimeSeries} timeseries
     * @returns {Promise<SpinalDateValue>}
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
}
export default SpinalServiceTimeseries;
export { SpinalTimeSeries, SpinalTimeSeriesArchive, SpinalTimeSeriesArchiveDay, SpinalDateValue, SpinalDateValueArray, };
