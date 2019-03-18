import { SpinalTimeSeries, SpinalTimeSeriesArchive, SpinalTimeSeriesArchiveDay, SpinalDateValue, SpinalDateValueArray } from './timeseries/SpinalTimeSeries';
declare type EndpointId = string;
/**
 * @class SpinalServiceTimeseries
 */
declare class SpinalServiceTimeseries {
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
export { SpinalServiceTimeseries, SpinalTimeSeries, SpinalTimeSeriesArchive, SpinalTimeSeriesArchiveDay, SpinalDateValue, SpinalDateValueArray, };
