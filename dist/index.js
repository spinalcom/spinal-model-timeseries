"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_env_viewer_graph_service_1 = require("spinal-env-viewer-graph-service");
const SpinalTimeSeries_1 = require("./timeseries/SpinalTimeSeries");
exports.SpinalTimeSeries = SpinalTimeSeries_1.SpinalTimeSeries;
exports.SpinalTimeSeriesArchive = SpinalTimeSeries_1.SpinalTimeSeriesArchive;
exports.SpinalTimeSeriesArchiveDay = SpinalTimeSeries_1.SpinalTimeSeriesArchiveDay;
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
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(endpointNodeId, [SpinalTimeSeries_1.SpinalTimeSeries.relationName]);
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
        if (this.timeSeriesDictionnary.has(endpointNodeId)) {
            return this.timeSeriesDictionnary.get(endpointNodeId);
        }
        const promise = new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
            const children = yield spinal_env_viewer_graph_service_1.SpinalGraphService.getChildren(endpointNodeId, [SpinalTimeSeries_1.SpinalTimeSeries.relationName]);
            let timeSeriesProm;
            if (children.length === 0) {
                // create element
                const timeSeries = new SpinalTimeSeries_1.SpinalTimeSeries();
                timeSeriesProm = Promise.resolve(timeSeries);
                // create node
                const node = spinal_env_viewer_graph_service_1.SpinalGraphService.createNode({ timeSeriesId: timeSeries.id.get() }, timeSeries);
                // push node to parent
                yield spinal_env_viewer_graph_service_1.SpinalGraphService.addChild(endpointNodeId, node, SpinalTimeSeries_1.SpinalTimeSeries.relationName, spinal_env_viewer_graph_service_1.SPINAL_RELATION_PTR_LST_TYPE);
            }
            else {
                timeSeriesProm = children[0].element.load();
            }
            resolve(timeSeriesProm);
            return timeSeriesProm;
        }));
        this.timeSeriesDictionnary.set(endpointNodeId, promise);
        return promise;
    }
    /**
     * @param {SpinalTimeSeries} timeseries
     * @returns {Promise<SpinalDateValue>}
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