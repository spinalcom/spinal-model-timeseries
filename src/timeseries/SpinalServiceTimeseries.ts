/*
 * Copyright 2023 SpinalCom - www.spinalcom.com
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
import { attributeService } from 'spinal-env-viewer-plugin-documentation-service';
import { SpinalAttribute } from 'spinal-models-documentation';
import { SpinalTimeSeries } from './SpinalTimeSeries';
import { SpinalTimeSeriesConfig } from '../SpinalTimeSeriesConfig';
import type { TimeSeriesEndpointCfg } from '../interfaces/TimeSeriesEndpointCfg';
import type { TimeSeriesIntervalDate } from '../interfaces/TimeSeriesIntervalDate';
import type { SpinalDateValue } from '../interfaces/SpinalDateValue';

type EndpointId = string;

/**
 * @class SpinalServiceTimeseries
 */
export class SpinalServiceTimeseries {
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
    // the time of the measure : finding the timeseries can wait for the hub
    const date = Date.now();
    try {
      const timeseries = await this.getOrCreateTimeSeries(endpointNodeId);
      let valueToPush = value;
      if (typeof value === 'boolean') {
        valueToPush = value ? 1 : 0;
      }
      await timeseries.push(<number>valueToPush, date);
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
  public getOrCreateTimeSeries(
    endpointNodeId: EndpointId
  ): Promise<SpinalTimeSeries> {
    if (this.timeSeriesDictionnary.has(endpointNodeId)) {
      return this.timeSeriesDictionnary.get(endpointNodeId);
    }
    // kept before anything is awaited : the calls made meanwhile for the same
    // endpoint wait for this one, instead of creating a timeseries each
    return this.keep(endpointNodeId, this.loadOrCreateTimeSeries(endpointNodeId));
  }

  private async loadOrCreateTimeSeries(
    endpointNodeId: EndpointId
  ): Promise<SpinalTimeSeries> {
    const cfg = await this.getConfigFormEndpoint(endpointNodeId);
    const children = await SpinalGraphService.getChildren(endpointNodeId, [
      SpinalTimeSeries.relationName,
    ]);
    if (children.length === 0) {
      // create element
      const timeSeries = new SpinalTimeSeries(cfg.initialBlockSize, cfg.maxDay);
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
      return timeSeries;
    }
    const timeSeries = await (<Promise<SpinalTimeSeries>>children[0].element.load());
    await timeSeries.setConfig(cfg.initialBlockSize, cfg.maxDay);
    return timeSeries;
  }

  /** keeps a timeseries loading, forgets it if it fails : the next call tries again */
  private keep(
    endpointNodeId: EndpointId,
    promise: Promise<SpinalTimeSeries>
  ): Promise<SpinalTimeSeries> {
    this.timeSeriesDictionnary.set(endpointNodeId, promise);
    promise.catch(() => {
      if (this.timeSeriesDictionnary.get(endpointNodeId) === promise) {
        this.timeSeriesDictionnary.delete(endpointNodeId);
      }
    });
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
      // the values stored, to only write the attributes that need it
      let storedMaxDay: string = null;
      let storedInitialBlockSize: string = null;
      for (const attr of attrs) {
        switch (attr.label.get()) {
          case 'timeSeries maxDay':
            storedMaxDay = attr.value.get().toString();
            maxDay = parseInt(storedMaxDay);
            break;
          case 'timeSeries initialBlockSize':
            storedInitialBlockSize = attr.value.get().toString();
            initialBlockSize = parseInt(storedInitialBlockSize);
            break;
          default:
            break;
        }
      }
      maxDay = maxDay === null ? SpinalTimeSeriesConfig.MAX_DAY : maxDay;
      initialBlockSize =
        initialBlockSize === null
          ? SpinalTimeSeriesConfig.INIT_BLOCK_SIZE
          : initialBlockSize;
      // written when missing or different : each write looks the category up again
      if (storedMaxDay !== maxDay.toString()) {
        await attributeService.addAttributeByCategoryName(
          node,
          'default',
          'timeSeries maxDay',
          maxDay.toString()
        );
      }
      if (storedInitialBlockSize !== initialBlockSize.toString()) {
        await attributeService.addAttributeByCategoryName(
          node,
          'default',
          'timeSeries initialBlockSize',
          initialBlockSize.toString()
        );
      }

      return {
        maxDay: maxDay,
        initialBlockSize: initialBlockSize,
      };
    } catch (e) {
      return {
        maxDay: SpinalTimeSeriesConfig.MAX_DAY,
        initialBlockSize: SpinalTimeSeriesConfig.INIT_BLOCK_SIZE,
      };
    }
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @return {Promise<SpinalDateValue>}
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
   * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
   * @returns {Promise<SpinalDateValue[]>}
   * @memberof SpinalServiceTimeseries
   */
  public getFromIntervalTime(
    timeseries: SpinalTimeSeries,
    start: string | number | Date = 0,
    end: string | number | Date = Date.now(),
    includeLastBeforeStart: boolean = false
  ): Promise<SpinalDateValue[]> {
    return timeseries.getFromIntervalTime(start, end, includeLastBeforeStart);
  }

  /**
   * @param {SpinalTimeSeries} timeseries
   * @param {(string|number|Date)} [start=0]
   * @param {(string|number|Date)} [end=Date.now()]
   * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
   * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
   * @memberof SpinalServiceTimeseries
   */
  public getFromIntervalTimeGen(
    timeseries: SpinalTimeSeries,
    start: string | number | Date = 0,
    end: string | number | Date = Date.now(),
    includeLastBeforeStart: boolean = false,
  ): Promise<AsyncIterableIterator<SpinalDateValue>> {
    return timeseries.getFromIntervalTimeGen(start, end, includeLastBeforeStart);
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @return {Promise<SpinalTimeSeries>}
   * @memberof SpinalServiceTimeseries
   */
  async getTimeSeries(endpointNodeId: EndpointId): Promise<SpinalTimeSeries> {
    if (this.timeSeriesDictionnary.has(endpointNodeId)) {
      return this.timeSeriesDictionnary.get(endpointNodeId);
    }
    const children = await SpinalGraphService.getChildren(endpointNodeId, [
      SpinalTimeSeries.relationName,
    ]);
    if (children.length === 0) {
      return undefined;
    }
    return this.keep(
      endpointNodeId,
      <Promise<SpinalTimeSeries>>children[0].element.load()
    );
  }

  /**
   * @param {number} [numberOfHours=1]
   * @return {TimeSeriesIntervalDate}
   * @memberof SpinalServiceTimeseries
   */
  public getDateFromLastHours(
    numberOfHours: number = 1
  ): TimeSeriesIntervalDate {
    const end = Date.now();
    const start = new Date();
    start.setUTCHours(start.getUTCHours() - numberOfHours);
    return { start, end };
  }

  /**
   * @param {number} [numberOfDays=1]
   * @return {TimeSeriesIntervalDate}
   * @memberof SpinalServiceTimeseries
   */
  public getDateFromLastDays(numberOfDays: number = 1): TimeSeriesIntervalDate {
    const end = Date.now();
    const start = new Date();
    start.setDate(start.getDate() - numberOfDays);
    return { start, end };
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
   * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
   * @return {Promise<SpinalDateValue[]>}
   * @memberof SpinalServiceTimeseries
   */
  public async getData(
    endpointNodeId: EndpointId,
    timeSeriesIntervalDate: TimeSeriesIntervalDate,
    includeLastBeforeStart: boolean = false
  ): Promise<SpinalDateValue[]> {
    const timeSeries = await this.getTimeSeries(endpointNodeId);
    if (!timeSeries) throw new Error('endpoint have no timeseries');
    // the array read : the same values, without going through the generator
    return this.getFromIntervalTime(
      timeSeries,
      timeSeriesIntervalDate.start,
      timeSeriesIntervalDate.end,
      includeLastBeforeStart
    );
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
   * @return {Promise<number>}
   * @memberof SpinalServiceTimeseries
   */
  async getMean(
    endpointNodeId: EndpointId,
    timeSeriesIntervalDate: TimeSeriesIntervalDate
  ): Promise<number> {
    const data = await this.getData(endpointNodeId, timeSeriesIntervalDate);
    if (data.length === 0) return NaN;
    if (data.length === 1) return data[0].value;
    let res = 0;
    const fullTime = data[data.length - 1].date - data[0].date;
    for (let idx = 1, d1 = data[0]; idx < data.length; d1 = data[idx++]) {
      // (((d1 + d2) / 2) * (t2 - t1)) / fulltime
      res +=
        (((d1.value + data[idx].value) / 2) * (data[idx].date - d1.date)) /
        fullTime;
    }
    return res;
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
   * @return {Promise<number>}
   * @memberof SpinalServiceTimeseries
   */
  async getMeanWithoutNegativeValues(
    endpointNodeId: EndpointId,
    timeSeriesIntervalDate: TimeSeriesIntervalDate
  ): Promise<number> {
    const dataNotFiltred = await this.getData(
      endpointNodeId,
      timeSeriesIntervalDate
    );
    //exclude negative values from data
    const data = dataNotFiltred.filter((x) => {
      return x.value >= 0;
    });

    if (data.length === 0) return NaN;
    if (data.length === 1) return data[0].value;
    let res = 0;
    const fullTime = data[data.length - 1].date - data[0].date;
    for (let idx = 1, d1 = data[0]; idx < data.length; d1 = data[idx++]) {
      // (((d1 + d2) / 2) * (t2 - t1)) / fulltime
      res +=
        (((d1.value + data[idx].value) / 2) * (data[idx].date - d1.date)) /
        fullTime;
    }
    return res;
  }
  /**
   * getIntegral | time in ms
   * @param {EndpointId} endpointNodeId
   * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
   * @return {Promise<number>}
   * @memberof SpinalServiceTimeseries
   */
  async getIntegral(
    endpointNodeId: EndpointId,
    timeSeriesIntervalDate: TimeSeriesIntervalDate
  ): Promise<number> {
    const data = await this.getData(endpointNodeId, timeSeriesIntervalDate);
    if (data.length === 0) return NaN;
    if (data.length === 1) return data[0].value;
    let res = 0;
    for (let idx = 1, d1 = data[0]; idx < data.length; d1 = data[idx++]) {
      // ((d1 + d2) / 2) * (t2 - t1)
      res += ((d1.value + data[idx].value) / 2) * (data[idx].date - d1.date);
    }
    return res;
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
   * @return  {Promise<number>}
   * @memberof SpinalServiceTimeseries
   */
  async getMax(
    endpointNodeId: EndpointId,
    timeSeriesIntervalDate: TimeSeriesIntervalDate
  ): Promise<number> {
    const data = await this.getData(endpointNodeId, timeSeriesIntervalDate);
    if (data.length === 0) return 0;
    return data.reduce((a, b) => (a < b.value ? b.value : a), data[0].value);
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
   * @return {Promise<number>}
   * @memberof SpinalServiceTimeseries
   */
  async getMin(
    endpointNodeId: EndpointId,
    timeSeriesIntervalDate: TimeSeriesIntervalDate
  ): Promise<number> {
    const data = await this.getData(endpointNodeId, timeSeriesIntervalDate);
    if (data.length === 0) return 0;
    return data.reduce((a, b) => (a > b.value ? b.value : a), data[0].value);
  }

  /**
   * @param {EndpointId} endpointNodeId
   * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
   * @return {Promise<number>}
   * @memberof SpinalServiceTimeseries
   */
  async getSum(
    endpointNodeId: EndpointId,
    timeSeriesIntervalDate: TimeSeriesIntervalDate
  ): Promise<number> {
    const data = await this.getData(endpointNodeId, timeSeriesIntervalDate);
    return data.reduce((a, b) => a + b.value, 0);
  }
}
