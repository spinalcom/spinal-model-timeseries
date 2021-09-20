/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
 *
 * This file is part of SpinalCore.
 *
 * Please read all of the following terms and conditions
 * of the Free Software license Agreement ("Agreement")
 * carefully.
 *
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 *
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

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

import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
type EndpointId = string;
interface TimeSeriesEndpointCfg {
  maxDay: number;
  initialBlockSize: number;
}
interface SpinalAttribute extends spinal.Model {
  label: spinal.Str;
  value: spinal.Str;
  date: spinal.Val;
  type: spinal.Str;
  unit: spinal.Str;
}

/**
 * @class SpinalServiceTimeseries
 */
class SpinalServiceTimeseries {
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
  public async pushFromEndpoint(
    endpointNodeId: EndpointId,
    value: number | boolean
  ): Promise<boolean> {
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
  public async insertFromEndpoint(
    endpointNodeId: EndpointId,
    value: number | boolean,
    date: number | string | Date
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
  public async hasTimeSeries(endpointNodeId: EndpointId): Promise<boolean> {
    if (this.timeSeriesDictionnary.has(endpointNodeId)) {
      return true;
    }
    const children = await SpinalGraphService.getChildren(endpointNodeId, [
      SpinalTimeSeries.relationName,
    ]);
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
  public async getOrCreateTimeSeries(
    endpointNodeId: EndpointId
  ): Promise<SpinalTimeSeries> {
    if (this.timeSeriesDictionnary.has(endpointNodeId)) {
      return this.timeSeriesDictionnary.get(endpointNodeId);
    }
    const cfg = await this.getConfigFormEndpoint(endpointNodeId);
    const promise: Promise<SpinalTimeSeries> = new Promise(
      this.getOrCreateTimeSeriesProm(endpointNodeId, cfg)
    );
    // get timeseries config from endpoints
    // set config to timeseries

    this.timeSeriesDictionnary.set(endpointNodeId, promise);

    return promise;
  }
  private async getConfigFormEndpoint(
    endpointNodeId: EndpointId
  ): Promise<TimeSeriesEndpointCfg> {
    try {
      const node = SpinalGraphService.getRealNode(endpointNodeId);
      const cat = await attributeService.getCategoryByName(node, 'default');

      const attrs: SpinalAttribute[] =
        await attributeService.getAttributesByCategory(node, cat);
      let maxDay: number = null;
      let initialBlockSize: number = null;
      for (const attr of attrs) {
        switch (attr.label.get()) {
          case 'timeSeries maxDay':
            maxDay = parseInt(attr.value.get());
            break;
          case 'timeSeries initialBlockSize':
            initialBlockSize = parseInt(attr.value.get());
            break;
          default:
            break;
        }
      }
      maxDay = maxDay === null ? 2 : maxDay;
      initialBlockSize = initialBlockSize === null ? 50 : initialBlockSize;
      //
      await attributeService.addAttributeByCategoryName(
        node,
        'default',
        'timeSeries maxDay',
        maxDay.toLocaleString()
      );
      await attributeService.addAttributeByCategoryName(
        node,
        'default',
        'timeSeries initialBlockSize',
        initialBlockSize.toLocaleString()
      );

      return {
        maxDay: maxDay,
        initialBlockSize: initialBlockSize,
      };
    } catch (e) {
      return {
        maxDay: 2,
        initialBlockSize: 50,
      };
    }
  }

  private getOrCreateTimeSeriesProm(
    endpointNodeId: string,
    cfg: TimeSeriesEndpointCfg
  ): (
    resolve: (value: SpinalTimeSeries | PromiseLike<SpinalTimeSeries>) => void,
    reject: (reason?: any) => void
  ) => void {
    return async (resolve) => {
      const children = await SpinalGraphService.getChildren(endpointNodeId, [
        SpinalTimeSeries.relationName,
      ]);
      let timeSeriesProm: SpinalTimeSeries | PromiseLike<SpinalTimeSeries>;
      if (children.length === 0) {
        // create element
        const timeSeries = new SpinalTimeSeries(
          cfg.initialBlockSize,
          cfg.maxDay
        );
        timeSeriesProm = timeSeries;
        // create node
        const node = SpinalGraphService.createNode(
          { timeSeriesId: timeSeries.id.get() },
          timeSeries
        );
        // push node to parent
        await SpinalGraphService.addChild(
          endpointNodeId,
          node,
          SpinalTimeSeries.relationName,
          SPINAL_RELATION_PTR_LST_TYPE
        );
      } else {
        const timeSeries = await (<Promise<SpinalTimeSeries>>(
          children[0].element.load()
        ));
        await timeSeries.setConfig(cfg.initialBlockSize, cfg.maxDay);
        timeSeriesProm = timeSeries;
      }
      resolve(timeSeriesProm);
      return timeSeriesProm;
    };
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @return {*}  {Promise<SpinalDateValue>}
   * @memberof SpinalServiceTimeseries
   */
  public getCurrent(timeseries: SpinalTimeSeries): Promise<SpinalDateValue> {
    return timeseries.getCurrent();
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  public getDataFromLast24Hours(
    timeseries: SpinalTimeSeries
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getDataFromLast24Hours();
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @param {number} [numberOfHours=1]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  public getDataFromLastHours(
    timeseries: SpinalTimeSeries,
    numberOfHours: number = 1
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getDataFromLastHours(numberOfHours);
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  public getDataFromYesterday(
    timeseries: SpinalTimeSeries
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getDataFromYesterday();
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @param {(string|number|Date)} [start=0]
   * @param {(string|number|Date)} [end=Date.now()]
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalServiceTimeseries
   */
  public getFromIntervalTime(
    timeseries: SpinalTimeSeries,
    start: string | number | Date = 0,
    end: string | number | Date = Date.now()
  ): Promise<SpinalDateValue[]> {
    return timeseries.getFromIntervalTime(start, end);
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @param {(string|number|Date)} [start=0]
   * @param {(string|number|Date)} [end=Date.now()]
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  public getFromIntervalTimeGen(
    timeseries: SpinalTimeSeries,
    start: string | number | Date = 0,
    end: string | number | Date = Date.now()
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
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
