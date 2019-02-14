import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-env-viewer-graph-service';

import {
  SpinalTimeSeries,
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
} from './timeseries/SpinalTimeSeries';

type EndpointId = string;
/**
 * @class SpinalServiceTimeseries
 */
class SpinalServiceTimeseries{
  private timeSeriesDictionnary: Map<EndpointId, Promise<SpinalTimeSeries>>;
  /**
   *Creates an instance of SpinalServiceTimeseries.
   * @memberof SpinalServiceTimeseries
   */
  constructor() {
    this.timeSeriesDictionnary = new Map();
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {(number|boolean)} value
   * @returns {Promise<boolean>}
   * @memberof SpinalServiceTimeseries
   */
  public async pushFromEndpoint(endpointNodeId: EndpointId, value: number|boolean)
  : Promise<boolean> {
    try {
      const timeseries = await this.getOrCreateTimeSeries(endpointNodeId);
      let valueToPush = value;
      if (typeof value === 'boolean') {
        valueToPush = value ? 1 : 0;
      }
      await timeseries.push(<number>valueToPush);
    } catch (error) {
      return false;
    }
    return true;
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {(number|boolean)} value
   * @param {(number|string|Date)} date
   * @returns {Promise<boolean>}
   * @memberof SpinalServiceTimeseries
   */
  public async insertFromEndpoint(endpointNodeId: EndpointId,
                                  value: number|boolean,
                                  date: number|string|Date,
                                  ): Promise<boolean> {
    try {
      const timeseries = await this.getOrCreateTimeSeries(endpointNodeId);
      let valueToPush = value;
      if (typeof value === 'boolean') {
        valueToPush = value ? 1 : 0;
      }
      await timeseries.insert(<number>valueToPush, date);
    } catch (error) {
      return false;
    }
    return true;
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @returns {Promise<boolean>}
   * @memberof SpinalServiceTimeseries
   */
  async hasTimeSeries(endpointNodeId: EndpointId): Promise<boolean> {
    if (this.timeSeriesDictionnary.has(endpointNodeId)) {
      return true;
    }
    const children =
      await SpinalGraphService.getChildren(endpointNodeId, [SpinalTimeSeries.relationName]);
    if (children.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @returns {Promise<SpinalTimeSeries>}
   * @memberof SpinalServiceTimeseries
   */
  getOrCreateTimeSeries(endpointNodeId: EndpointId): Promise<SpinalTimeSeries> {
    if (this.timeSeriesDictionnary.has(endpointNodeId)) {
      return this.timeSeriesDictionnary.get(endpointNodeId);
    }
    const promise: Promise<SpinalTimeSeries> = new Promise(async (resolve) => {
      const children =
        await SpinalGraphService.getChildren(endpointNodeId, [SpinalTimeSeries.relationName]);
      let timeSeriesProm: Promise<SpinalTimeSeries>;
      if (children.length === 0) {
        // create element
        const timeSeries = new SpinalTimeSeries();
        timeSeriesProm = Promise.resolve(timeSeries);
        // create node
        const node = SpinalGraphService.createNode(
          { timeSeriesId: timeSeries.id.get() }, timeSeries);
        // push node to parent
        await SpinalGraphService.addChild(endpointNodeId, node,
                                          SpinalTimeSeries.relationName,
                                          SPINAL_RELATION_PTR_LST_TYPE);

      } else {
        timeSeriesProm = children[0].element.load();
      }
      resolve(timeSeriesProm);
      return timeSeriesProm;

    });
    this.timeSeriesDictionnary.set(endpointNodeId, promise);

    return promise;
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @returns {Promise<SpinalDateValue>}
   * @memberof SpinalServiceTimeseries
   */
  getCurrent(timeseries: SpinalTimeSeries): Promise<SpinalDateValue> {
    return timeseries.getCurrent();
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  getDataFromLast24Hours(timeseries: SpinalTimeSeries)
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getDataFromLast24Hours();
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @param {number} [numberOfHours=1]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  getDataFromLastHours(timeseries: SpinalTimeSeries, numberOfHours: number = 1)
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getDataFromLastHours(numberOfHours);
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  getDataFromYesterday(timeseries: SpinalTimeSeries)
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getDataFromYesterday();
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @param {(string|number|Date)} [start=0]
   * @param {(string|number|Date)} [end=Date.now()]
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalServiceTimeseries
   */
  getFromIntervalTime(timeseries: SpinalTimeSeries,
                      start: string|number|Date = 0,
                      end: string|number|Date = Date.now())
                      : Promise<SpinalDateValue[]> {
    return timeseries.getFromIntervalTime(start, end);
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @param {(string|number|Date)} [start=0]
   * @param {(string|number|Date)} [end=Date.now()]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  getFromIntervalTimeGen(timeseries: SpinalTimeSeries,
                         start: string|number|Date = 0,
                         end: string|number|Date = Date.now())
  : Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getFromIntervalTimeGen(start, end);
  }

}
export default SpinalServiceTimeseries;
export {
  SpinalServiceTimeseries,
  SpinalTimeSeries,
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
};
