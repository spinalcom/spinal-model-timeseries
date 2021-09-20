"use strict";
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
exports.SpinalTimeSeriesArchiveDay = exports.SpinalTimeSeriesArchive = exports.SpinalTimeSeries = exports.SpinalServiceTimeseries = void 0;
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const SpinalTimeSeries_1 = require("./timeseries/SpinalTimeSeries");
Object.defineProperty(exports, "SpinalTimeSeries", { enumerable: true, get: function () { return SpinalTimeSeries_1.SpinalTimeSeries; } });
Object.defineProperty(exports, "SpinalTimeSeriesArchive", { enumerable: true, get: function () { return SpinalTimeSeries_1.SpinalTimeSeriesArchive; } });
Object.defineProperty(exports, "SpinalTimeSeriesArchiveDay", { enumerable: true, get: function () { return SpinalTimeSeries_1.SpinalTimeSeriesArchiveDay; } });
const spinal_env_viewer_plugin_documentation_service_1 = require("spinal-env-viewer-plugin-documentation-service");
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
            // get timeseries config from endpoints
            // set config to timeseries
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
                yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategoryName(node, 'default', 'timeSeries maxDay', maxDay.toLocaleString());
                yield spinal_env_viewer_plugin_documentation_service_1.attributeService.addAttributeByCategoryName(node, 'default', 'timeSeries initialBlockSize', initialBlockSize.toLocaleString());
                return {
                    maxDay: maxDay,
                    initialBlockSize: initialBlockSize,
                };
            }
            catch (e) {
                return {
                    maxDay: 2,
                    initialBlockSize: 50,
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
     * @return {*}  {Promise<SpinalDateValue>}
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
}
exports.SpinalServiceTimeseries = SpinalServiceTimeseries;
exports.default = SpinalServiceTimeseries;
//# sourceMappingURL=index.js.map