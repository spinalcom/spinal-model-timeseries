"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalServiceTimeseries = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
const SpinalTimeSeries_1 = require("./SpinalTimeSeries");
const SpinalTimeSeriesConfig_1 = require("../SpinalTimeSeriesConfig");
const asyncGenToArray_1 = require("../utils/asyncGenToArray");
/**
 * @class SpinalServiceTimeseries
 */
class SpinalServiceTimeseries {
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
    pushFromEndpoint(endpointNodeId, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeseries = yield this.getOrCreateTimeSeries(endpointNodeId);
                let valueToPush = value;
                if (typeof value === 'boolean') {
                    valueToPush = value ? 1 : 0;
                }
                yield timeseries.push(valueToPush);
            }
            catch (error) {
                return false;
            }
            return true;
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @param {(number|boolean)} value
     * @param {(number|string|Date)} date
     * @returns {Promise<boolean>}
     * @memberof SpinalServiceTimeseries
     */
    insertFromEndpoint(endpointNodeId, value, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const timeseries = yield this.getOrCreateTimeSeries(endpointNodeId);
                let valueToPush = value;
                if (typeof value === 'boolean') {
                    valueToPush = value ? 1 : 0;
                }
                yield timeseries.insert(valueToPush, date);
            }
            catch (error) {
                return false;
            }
            return true;
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @returns {Promise<boolean>}
     * @memberof SpinalServiceTimeseries
     */
    hasTimeSeries(endpointNodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.timeSeriesDictionnary.has(endpointNodeId)) {
                return true;
            }
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(endpointNodeId, [
                SpinalTimeSeries_1.SpinalTimeSeries.relationName,
            ]);
            if (children.length === 0) {
                return false;
            }
            return true;
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @returns {Promise<SpinalTimeSeries>}
     * @memberof SpinalServiceTimeseries
     */
    getOrCreateTimeSeries(endpointNodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.timeSeriesDictionnary.has(endpointNodeId)) {
                return this.timeSeriesDictionnary.get(endpointNodeId);
            }
            const cfg = yield this.getConfigFormEndpoint(endpointNodeId);
            const promise = new Promise(this.getOrCreateTimeSeriesProm(endpointNodeId, cfg));
            this.timeSeriesDictionnary.set(endpointNodeId, promise);
            return promise;
        });
    }
    getConfigFormEndpoint(endpointNodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const node = spinal_env_viewer_graph_service_1.SpinalGraphService.getRealNode(endpointNodeId);
                const cat = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getCategoryByName(node, 'default');
                const attrs = yield spinal_env_viewer_plugin_documentation_service_1.attributeService.getAttributesByCategory(node, cat);
                let maxDay = null;
                let initialBlockSize = null;
                for (const attr of attrs) {
                    switch (attr.label.get()) {
                        case 'timeSeries maxDay':
                            maxDay = parseInt(attr.value.get().toString());
                            break;
                        case 'timeSeries initialBlockSize':
                            initialBlockSize = parseInt(attr.value.get().toString());
                            break;
                        default:
                            break;
                    }
                }
                maxDay = maxDay === null ? SpinalTimeSeriesConfig_1.SpinalTimeSeriesConfig.MAX_DAY : maxDay;
                initialBlockSize =
                    initialBlockSize === null
                        ? SpinalTimeSeriesConfig_1.SpinalTimeSeriesConfig.INIT_BLOCK_SIZE
                        : initialBlockSize;
                //
                yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategoryName(node, 'default', 'timeSeries maxDay', maxDay.toString());
                yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategoryName(node, 'default', 'timeSeries initialBlockSize', initialBlockSize.toString());
                return {
                    maxDay: maxDay,
                    initialBlockSize: initialBlockSize,
                };
            }
            catch (e) {
                return {
                    maxDay: SpinalTimeSeriesConfig_1.SpinalTimeSeriesConfig.MAX_DAY,
                    initialBlockSize: SpinalTimeSeriesConfig_1.SpinalTimeSeriesConfig.INIT_BLOCK_SIZE,
                };
            }
        });
    }
    getOrCreateTimeSeriesProm(endpointNodeId, cfg) {
        return (resolve) => __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(endpointNodeId, [
                SpinalTimeSeries_1.SpinalTimeSeries.relationName,
            ]);
            let timeSeriesProm;
            if (children.length === 0) {
                // create element
                const timeSeries = new SpinalTimeSeries_1.SpinalTimeSeries(cfg.initialBlockSize, cfg.maxDay);
                timeSeriesProm = timeSeries;
                // create node
                const node = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode({ timeSeriesId: timeSeries.id.get() }, timeSeries);
                // push node to parent
                yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(endpointNodeId, node, SpinalTimeSeries_1.SpinalTimeSeries.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
            else {
                const timeSeries = yield (children[0].element.load());
                yield timeSeries.setConfig(cfg.initialBlockSize, cfg.maxDay);
                timeSeriesProm = timeSeries;
            }
            resolve(timeSeriesProm);
            return timeSeriesProm;
        });
    }
    /**
     * @param {SpinalTimeSeries} timeseries
     * @return {Promise<SpinalDateValue>}
     * @memberof SpinalServiceTimeseries
     */
    getCurrent(timeseries) {
        return timeseries.getCurrent();
    }
    /**
     * @param {SpinalTimeSeries} timeseries
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getDataFromLast24Hours(timeseries) {
        return timeseries.getDataFromLast24Hours();
    }
    /**
     * @param {SpinalTimeSeries} timeseries
     * @param {number} [numberOfHours=1]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getDataFromLastHours(timeseries, numberOfHours = 1) {
        return timeseries.getDataFromLastHours(numberOfHours);
    }
    /**
     * @param {SpinalTimeSeries} timeseries
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getDataFromYesterday(timeseries) {
        return timeseries.getDataFromYesterday();
    }
    /**
     * @param {SpinalTimeSeries} timeseries
     * @param {(string|number|Date)} [start=0]
     * @param {(string|number|Date)} [end=Date.now()]
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalServiceTimeseries
     */
    getFromIntervalTime(timeseries, start = 0, end = Date.now()) {
        return timeseries.getFromIntervalTime(start, end);
    }
    /**
     * @param {SpinalTimeSeries} timeseries
     * @param {(string|number|Date)} [start=0]
     * @param {(string|number|Date)} [end=Date.now()]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalServiceTimeseries
     */
    getFromIntervalTimeGen(timeseries, start = 0, end = Date.now()) {
        return timeseries.getFromIntervalTimeGen(start, end);
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @return {Promise<SpinalTimeSeries>}
     * @memberof SpinalServiceTimeseries
     */
    getTimeSeries(endpointNodeId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.timeSeriesDictionnary.has(endpointNodeId)) {
                return this.timeSeriesDictionnary.get(endpointNodeId);
            }
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(endpointNodeId, [
                SpinalTimeSeries_1.SpinalTimeSeries.relationName,
            ]);
            if (children.length === 0) {
                return undefined;
            }
            const prom = children[0].element.load();
            this.timeSeriesDictionnary.set(endpointNodeId, prom);
            return prom;
        });
    }
    /**
     * @param {number} [numberOfHours=1]
     * @return {TimeSeriesIntervalDate}
     * @memberof SpinalServiceTimeseries
     */
    getDateFromLastHours(numberOfHours = 1) {
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
    getDateFromLastDays(numberOfDays = 1) {
        const end = Date.now();
        const start = new Date();
        start.setDate(start.getDate() - numberOfDays);
        return { start, end };
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<SpinalDateValue[]>}
     * @memberof SpinalServiceTimeseries
     */
    getData(endpointNodeId, timeSeriesIntervalDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const timeSeries = yield this.getTimeSeries(endpointNodeId);
            if (!timeSeries)
                throw new Error('endpoint have no timeseries');
            return (0, asyncGenToArray_1.asyncGenToArray)(yield this.getFromIntervalTimeGen(timeSeries, timeSeriesIntervalDate.start, timeSeriesIntervalDate.end));
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMean(endpointNodeId, timeSeriesIntervalDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getData(endpointNodeId, timeSeriesIntervalDate);
            if (data.length === 0)
                return NaN;
            if (data.length === 1)
                return data[0].value;
            let res = 0;
            const fullTime = data[data.length - 1].date - data[0].date;
            for (let idx = 1, d1 = data[0]; idx < data.length; d1 = data[idx++]) {
                // (((d1 + d2) / 2) * (t2 - t1)) / fulltime
                res +=
                    (((d1.value + data[idx].value) / 2) * (data[idx].date - d1.date)) /
                        fullTime;
            }
            return res;
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMeanWithoutNegativeValues(endpointNodeId, timeSeriesIntervalDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataNotFiltred = yield this.getData(endpointNodeId, timeSeriesIntervalDate);
            //exclude negative values from data
            const data = dataNotFiltred.filter((x) => {
                return x.value >= 0;
            });
            if (data.length === 0)
                return NaN;
            if (data.length === 1)
                return data[0].value;
            let res = 0;
            const fullTime = data[data.length - 1].date - data[0].date;
            for (let idx = 1, d1 = data[0]; idx < data.length; d1 = data[idx++]) {
                // (((d1 + d2) / 2) * (t2 - t1)) / fulltime
                res +=
                    (((d1.value + data[idx].value) / 2) * (data[idx].date - d1.date)) /
                        fullTime;
            }
            return res;
        });
    }
    /**
     * getIntegral | time in ms
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getIntegral(endpointNodeId, timeSeriesIntervalDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getData(endpointNodeId, timeSeriesIntervalDate);
            if (data.length === 0)
                return NaN;
            if (data.length === 1)
                return data[0].value;
            let res = 0;
            for (let idx = 1, d1 = data[0]; idx < data.length; d1 = data[idx++]) {
                // ((d1 + d2) / 2) * (t2 - t1)
                res += ((d1.value + data[idx].value) / 2) * (data[idx].date - d1.date);
            }
            return res;
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return  {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMax(endpointNodeId, timeSeriesIntervalDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getData(endpointNodeId, timeSeriesIntervalDate);
            if (data.length === 0)
                return 0;
            return data.reduce((a, b) => (a < b.value ? b.value : a), data[0].value);
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getMin(endpointNodeId, timeSeriesIntervalDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getData(endpointNodeId, timeSeriesIntervalDate);
            if (data.length === 0)
                return 0;
            return data.reduce((a, b) => (a > b.value ? b.value : a), data[0].value);
        });
    }
    /**
     * @param {EndpointId} endpointNodeId
     * @param {TimeSeriesIntervalDate} timeSeriesIntervalDate
     * @return {Promise<number>}
     * @memberof SpinalServiceTimeseries
     */
    getSum(endpointNodeId, timeSeriesIntervalDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.getData(endpointNodeId, timeSeriesIntervalDate);
            return data.reduce((a, b) => a + b.value, 0);
        });
    }
}
exports.SpinalServiceTimeseries = SpinalServiceTimeseries;
//# sourceMappingURL=SpinalServiceTimeseries.js.map