"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
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
const SpinalTimeSeriesArchiveDay_1 = require("./SpinalTimeSeriesArchiveDay");
/**
 * @class SpinalTimeSeriesArchive
 * @extends {Model}
 */
class SpinalTimeSeriesArchive extends spinal_core_connectorjs_type_1.Model {
    /**
     *Creates an instance of SpinalTimeSeriesArchive.
     * @param {number} [initialBlockSize=50]
     * @memberof SpinalTimeSeriesArchive
     */
    constructor(initialBlockSize = 50) {
        super({
            initialBlockSize,
            lstDate: [],
            lstItem: [],
        });
        this.itemLoadedDictionary = new Map;
        this.loadPtrDictionary = new Map;
    }
    /**
     * @static
     * @param {(number | string | Date)} date
     * @returns {number}
     * @memberof SpinalTimeSeriesArchive
     */
    static normalizeDate(date) {
        return new Date(date).setUTCHours(0, 0, 0, 0);
    }
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
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getTodayArchive() {
        const now = Date.now();
        const date = SpinalTimeSeriesArchive.normalizeDate(now);
        const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);
        if (spinalTimeSeriesArchiveDay !== undefined) {
            return spinalTimeSeriesArchiveDay;
        }
        for (let index = 0; index < this.lstDate.length; index += 1) {
            const element = this.lstDate[index];
            const ptr = this.lstItem[index];
            if (element.get() === date) {
                return this.loadPtr(ptr);
            }
        }
        const value = new SpinalTimeSeriesArchiveDay_1.SpinalTimeSeriesArchiveDay(this.initialBlockSize.get());
        this.lstDate.push(date);
        this.lstItem.push(new spinal_core_connectorjs_type_1.Ptr(value));
        const prom = Promise.resolve(value);
        this.itemLoadedDictionary.set(date, prom);
        return prom;
    }
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getOrCreateArchiveAtDate(atDate) {
        const date = SpinalTimeSeriesArchive.normalizeDate(atDate);
        const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);
        if (spinalTimeSeriesArchiveDay !== undefined) {
            return spinalTimeSeriesArchiveDay;
        }
        for (let index = 0; index < this.lstDate.length; index += 1) {
            const element = this.lstDate[index];
            const ptr = this.lstItem[index];
            if (element.get() === date) {
                return this.loadPtr(ptr);
            }
        }
        const value = new SpinalTimeSeriesArchiveDay_1.SpinalTimeSeriesArchiveDay(this.initialBlockSize.get());
        value.dateDay.set(date);
        // search index
        let index = 0;
        for (let idx = 0; idx < this.lstDate.length; idx += 1) {
            const element = this.lstDate[idx];
            if (element > date) {
                break;
            }
            index += 1;
        }
        this.lstDate.insert(index, [date]);
        this.lstItem.insert(index, [new spinal_core_connectorjs_type_1.Ptr(value)]);
        const prom = Promise.resolve(value);
        this.itemLoadedDictionary.set(date, prom);
        return prom;
    }
    /**
     * @param {(number|string)} [start=0]
     * @param {(number|string)} [end=Date.now()]
     * @returns {AsyncIterableIterator<SpinalDateValue>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTimeGen(start = 0, end = Date.now()) {
        return __asyncGenerator(this, arguments, function* getFromIntervalTimeGen_1() {
            const normalizedStart = SpinalTimeSeriesArchive.normalizeDate(start);
            const normalizedEnd = (typeof end === 'number' || typeof end === 'string') ?
                new Date(end).getTime() : end;
            for (let idx = 0; idx < this.lstDate.length; idx += 1) {
                const element = this.lstDate[idx].get();
                if (normalizedStart > element)
                    continue;
                const archive = yield __await(this.getArchiveAtDate(element));
                let index = 0;
                const archiveLen = archive.length.get();
                if (normalizedStart === element) {
                    for (; index < archiveLen; index += 1) {
                        const dateValue = archive.get(index);
                        if (dateValue.date >= start) {
                            break;
                        }
                    }
                }
                for (; index < archiveLen; index += 1) {
                    const dateValue = archive.get(index);
                    if (dateValue.date > normalizedEnd)
                        return yield __await(void 0);
                    yield yield __await(dateValue);
                }
            }
        });
    }
    /**
     * getFromIntervalTimeGen is prefered.
     * @param {number} start
     * @param {(number|string)} [end=Date.now()]
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTime(start, end = Date.now()) {
        return __awaiter(this, void 0, void 0, function* () {
            var e_1, _a;
            const result = [];
            try {
                for (var _b = __asyncValues(this.getFromIntervalTimeGen(start, end)), _c; _c = yield _b.next(), !_c.done;) {
                    const data = _c.value;
                    result.push(data);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return result;
        });
    }
    /**
     * @param {(number | string | Date)} date
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getArchiveAtDate(date) {
        const normalizedDate = SpinalTimeSeriesArchive.normalizeDate(date);
        if (this.itemLoadedDictionary.has(normalizedDate)) {
            return this.itemLoadedDictionary.get(normalizedDate);
        }
        const idx = this.lstDate.indexOf(normalizedDate);
        if (idx < 0)
            return Promise.reject(new Error(`Date '${date}' not fond.`));
        const promise = new Promise((resolve) => {
            const ptr = this.lstItem[idx];
            if (typeof ptr.data.model !== 'undefined') {
                resolve(ptr.data.model);
            }
            else {
                ptr.load((element) => {
                    resolve(element);
                });
            }
        });
        this.itemLoadedDictionary.set(normalizedDate, promise);
        return promise;
    }
    /**
     * @returns {spinal.Lst<spinal.Val>}
     * @memberof SpinalTimeSeriesArchive
     */
    getDates() {
        return this.lstDate;
    }
    /**
     * @param {(number | string | Date)} date
     * @returns {boolean}
     * @memberof SpinalTimeSeriesArchive
     */
    dateExist(date) {
        const normalizedDate = SpinalTimeSeriesArchive.normalizeDate(date);
        for (let idx = this.lstDate.length - 1; idx >= 0; idx -= 1) {
            if (this.lstDate[idx].get() === normalizedDate)
                return true;
        }
        return false;
    }
}
exports.SpinalTimeSeriesArchive = SpinalTimeSeriesArchive;
spinal_core_connectorjs_type_1.spinalCore.register_models(SpinalTimeSeriesArchive);
exports.default = SpinalTimeSeriesArchive;
//# sourceMappingURL=SpinalTimeSeriesArchive.js.map