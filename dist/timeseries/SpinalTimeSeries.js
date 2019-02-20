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
/*
 * Copyright 2018 SpinalCom - www.spinalcom.com
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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const genUID_1 = require("../genUID");
const SpinalTimeSeriesArchive_1 = require("./SpinalTimeSeriesArchive");
exports.SpinalTimeSeriesArchive = SpinalTimeSeriesArchive_1.SpinalTimeSeriesArchive;
const SpinalTimeSeriesArchiveDay_1 = require("./SpinalTimeSeriesArchiveDay");
exports.SpinalTimeSeriesArchiveDay = SpinalTimeSeriesArchiveDay_1.SpinalTimeSeriesArchiveDay;
/**
 * @class SpinalTimeSeries
 * @property {spinal.Str} id
 * @property {spinal.Ptr<SpinalTimeSeriesArchive>} archive
 * @property {spinal.Ptr<SpinalTimeSeriesArchiveDay>} currentArchive
 * @extends {Model}
 */
class SpinalTimeSeries extends spinal_core_connectorjs_type_1.Model {
    /**
     *Creates an instance of SpinalTimeSeries.
     * @memberof SpinalTimeSeries
     */
    constructor() {
        super();
        this.archiveProm = null;
        this.currentProm = null;
        this.loadPtrDictionary = new Map;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return;
        const archive = new SpinalTimeSeriesArchive_1.SpinalTimeSeriesArchive();
        this.archiveProm = Promise.resolve(archive);
        this.add_attr({
            id: genUID_1.genUID('SpinalTimeSeries'),
            archive: new spinal_core_connectorjs_type_1.Ptr(archive),
            currentArchive: new spinal_core_connectorjs_type_1.Ptr(0),
            currentData: 0,
        });
    }
    /**
     * @param {(number|string|Date)} [start=0]
     * @param {(number|string|Date)} [end=Date.now()]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getFromIntervalTimeGen(start = 0, end = Date.now()) {
        return __awaiter(this, void 0, void 0, function* () {
            const archive = yield this.getArchive();
            return archive.getFromIntervalTimeGen(start, end);
        });
    }
    /**
     * @param {(number|string|Date)} [start=0]
     * @param {(number|string|Date)} [end=Date.now()]
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalTimeSeries
     */
    getFromIntervalTime(start = 0, end = Date.now()) {
        return __awaiter(this, void 0, void 0, function* () {
            const archive = yield this.getArchive();
            return archive.getFromIntervalTime(start, end);
        });
    }
    /**
     * @returns {Promise<SpinalDateValue>}
     * @memberof SpinalTimeSeries
     */
    getCurrent() {
        return __awaiter(this, void 0, void 0, function* () {
            let currentDay;
            try {
                currentDay = yield this.getCurrentDay();
            }
            catch (error) {
                const archive = yield this.getArchive();
                currentDay = yield archive.getTodayArchive();
            }
            const len = currentDay.length.get();
            return currentDay.get(len - 1);
        });
    }
    /**
     * @param {number} value
     * @returns {Promise<void>}
     * @memberof SpinalTimeSeries
     */
    push(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentDay;
            try {
                currentDay = yield this.getCurrentDay();
            }
            catch (error) {
                const archive = yield this.getArchive();
                currentDay = yield archive.getTodayArchive();
            }
            const normalizedDate = SpinalTimeSeriesArchive_1.SpinalTimeSeriesArchive.normalizeDate(Date.now());
            if (currentDay.dateDay.get() !== normalizedDate) {
                const archive = yield this.getArchive();
                this.currentProm = archive.getTodayArchive();
                currentDay = yield this.currentProm;
            }
            currentDay.push(value);
        });
    }
    /**
     * @param {number} value
     * @returns {Promise<void>}
     * @memberof SpinalTimeSeries
     */
    insert(value, date) {
        return __awaiter(this, void 0, void 0, function* () {
            let currentDay;
            const archive = yield this.getArchive();
            currentDay = yield archive.getOrCreateArchiveAtDate(date);
            currentDay.insert(value, date);
        });
    }
    /**
     * @param {(number | string | Date)} date
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeries
     */
    getDataOfDay(date) {
        return __awaiter(this, void 0, void 0, function* () {
            const archive = yield this.getArchive();
            return archive.getArchiveAtDate(date);
        });
    }
    /**
     * @param {(spinal.Ptr<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive>)} ptr
     * @returns {(Promise<SpinalTimeSeriesArchiveDay|SpinalTimeSeriesArchive>)}
     * @memberof SpinalTimeSeries
     */
    loadPtr(ptr) {
        if (typeof ptr.data.value !== 'undefined' &&
            this.loadPtrDictionary.has(ptr.data.value)) {
            return this.loadPtrDictionary.get(ptr.data.value);
        }
        if (typeof ptr.data.model !== 'undefined') {
            const res = Promise.resolve(ptr.data.model);
            if (ptr.data.value) {
                this.loadPtrDictionary.set(ptr.data.value, res);
            }
            return res;
        }
        if (typeof ptr.data.value !== 'undefined' && ptr.data.value === 0) {
            return Promise.reject('Load Ptr to 0');
        }
        if (typeof spinal_core_connectorjs_type_1.FileSystem._objects[ptr.data.value] !== 'undefined') {
            const res = Promise.resolve(spinal_core_connectorjs_type_1.FileSystem._objects[ptr.data.value]);
            this.loadPtrDictionary.set(ptr.data.value, res);
            return Promise.resolve(res);
        }
        const res = new Promise((resolve) => {
            ptr.load((element) => {
                resolve(element);
            });
        });
        this.loadPtrDictionary.set(ptr.data.value, res);
        return res;
    }
    /**
     * @returns {Promise<SpinalTimeSeriesArchive>}
     * @memberof SpinalTimeSeries
     */
    getArchive() {
        if (this.archiveProm !== null)
            return this.archiveProm;
        this.archiveProm = this.loadPtr(this.archive);
        return this.archiveProm;
    }
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeries
     */
    getCurrentDay() {
        if (this.currentProm !== null)
            return this.currentProm;
        this.currentProm = this.loadPtr(this.currentArchive);
        return this.currentProm;
    }
    /**
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromYesterday() {
        return __awaiter(this, void 0, void 0, function* () {
            const archive = yield this.getArchive();
            const end = new Date().setUTCHours(0, 0, 0, -1);
            const start = new Date(end).setUTCHours(0, 0, 0, 0);
            return archive.getFromIntervalTimeGen(start, end);
        });
    }
    /**
     * @alias getDataFromLastDays(1)
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromLast24Hours() {
        return this.getDataFromLastDays(1);
    }
    /**
     * @param {number} [numberOfHours=1]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromLastHours(numberOfHours = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const archive = yield this.getArchive();
            const end = Date.now();
            const start = new Date();
            start.setUTCHours(start.getUTCHours() - numberOfHours);
            return archive.getFromIntervalTimeGen(start, end);
        });
    }
    /**
     * @param {number} [numberOfDays=1]
     * @returns {Promise<AsyncIterableIterator<SpinalDateValue>>}
     * @memberof SpinalTimeSeries
     */
    getDataFromLastDays(numberOfDays = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            const archive = yield this.getArchive();
            const end = Date.now();
            const start = new Date();
            start.setDate(start.getDate() - numberOfDays);
            return archive.getFromIntervalTimeGen(start, end);
        });
    }
}
/**
 * @static
 * @type {string}
 * @memberof SpinalTimeSeries
 */
SpinalTimeSeries.relationName = 'hasTimeSeries';
/**
 * @static
 * @type {string}
 * @memberof SpinalTimeSeries
 */
SpinalTimeSeries.nodeTypeName = 'TimeSeries';
exports.SpinalTimeSeries = SpinalTimeSeries;
spinal_core_connectorjs_type_1.spinalCore.register_models(SpinalTimeSeries);
exports.default = SpinalTimeSeries;
//# sourceMappingURL=SpinalTimeSeries.js.map