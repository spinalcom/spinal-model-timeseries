"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinalTimeSeriesArchive = void 0;
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
const spinal_core_connectorjs_1 = require("spinal-core-connectorjs");
const loadPtr_1 = require("../utils/loadPtr");
const SpinalTimeSeriesArchiveDay_1 = require("./SpinalTimeSeriesArchiveDay");
const SpinalTimeSeriesConfig_1 = require("../SpinalTimeSeriesConfig");
/**
 * @class SpinalTimeSeriesArchive
 * @extends {Model}
 */
class SpinalTimeSeriesArchive extends spinal_core_connectorjs_1.Model {
    /**
     *Creates an instance of SpinalTimeSeriesArchive.
     * @param {number} [initialBlockSize=SpinalTimeSeriesConfig.INIT_BLOCK_SIZE]
     * @memberof SpinalTimeSeriesArchive
     */
    constructor(initialBlockSize = SpinalTimeSeriesConfig_1.SpinalTimeSeriesConfig.INIT_BLOCK_SIZE) {
        super({
            initialBlockSize,
            lstDate: [],
            lstItem: [],
        });
        this.itemLoadedDictionary = new Map();
        this.loadPtrDictionary = new Map();
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
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getTodayArchive() {
        return this.getOrCreateArchiveAtDate(Date.now());
    }
    /**
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getOrCreateArchiveAtDate(atDate) {
        this.cleanUpNaNDates();
        const date = SpinalTimeSeriesArchive.normalizeDate(atDate);
        if (isNaN(date)) {
            throw `the value [${atDate}] is not a valid date`;
        }
        const spinalTimeSeriesArchiveDay = this.itemLoadedDictionary.get(date);
        if (spinalTimeSeriesArchiveDay !== undefined) {
            return spinalTimeSeriesArchiveDay;
        }
        for (let index = 0; index < this.lstDate.length; index += 1) {
            const element = this.lstDate[index];
            const ptr = this.lstItem[index];
            if (element.get() === date) {
                return this.keepLoaded(date, (0, loadPtr_1.loadPtr)(this.loadPtrDictionary, ptr));
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
        this.lstItem.insert(index, [new spinal_core_connectorjs_1.Ptr(value)]);
        const prom = Promise.resolve(value);
        this.itemLoadedDictionary.set(date, prom);
        return prom;
    }
    /**
     * @memberof SpinalTimeSeriesArchive
     */
    cleanUpNaNDates() {
        let idx = 0;
        while (idx < this.lstDate.length) {
            const date = this.lstDate[idx];
            if (date && isNaN(date.get())) {
                this.lstDate.splice(idx, 1);
                this.lstItem.splice(idx, 1);
            }
            else {
                ++idx;
            }
        }
    }
    /**
     * @param {(number|string)} [start=0]
     * @param {(number|string)} [end=Date.now()]
     * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
     * @returns {AsyncIterableIterator<SpinalDateValue>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTimeGen(start = 0, end = Date.now(), includeLastBeforeStart = false) {
        return __asyncGenerator(this, arguments, function* getFromIntervalTimeGen_1() {
            var _a, e_1, _b, _c;
            const interval = this.intervalOf(start, end);
            if (includeLastBeforeStart) {
                const lastTs = yield __await(this.getLastTimeSeriesAtDate(interval.startEpoch));
                if (lastTs && lastTs.date < interval.startEpoch) { // only yield if before start date because if equal it will be yielded in the main loop
                    yield yield __await(lastTs);
                }
            }
            try {
                for (var _d = true, _e = __asyncValues(this.valuesByDay(interval)), _f; _f = yield __await(_e.next()), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        const values = _c;
                        for (const value of values)
                            yield yield __await(value);
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield __await(_b.call(_e));
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    }
    /**
     * The interval asked, checked, and the days that may hold it, in the order
     * of the list : the readers go through them in that order.
     */
    intervalOf(start, end) {
        this.cleanUpNaNDates();
        const normalizedStart = SpinalTimeSeriesArchive.normalizeDate(start); // Get the date at start of the day
        const endEpoch = typeof end === 'number' || typeof end === 'string'
            ? new Date(end).getTime()
            : end.getTime();
        const startEpoch = typeof start === 'number' || typeof start === 'string'
            ? new Date(start).getTime()
            : start.getTime();
        if (isNaN(normalizedStart)) {
            throw `the value 'start' [${start}] is not a valid date`;
        }
        if (isNaN(endEpoch)) {
            throw `the value 'end' [${end}] is not a valid date`;
        }
        // a date listed twice reads its first archive, like getArchiveAtDate
        const firstPtr = new Map();
        const dates = [];
        for (let idx = 0; idx < this.lstDate.length; idx += 1) {
            const date = this.lstDate[idx].get();
            if (!firstPtr.has(date))
                firstPtr.set(date, this.lstItem[idx]);
            if (normalizedStart > date)
                continue; // Skip until correct day.
            dates.push(date);
        }
        const days = dates.map((date) => ({ date, ptr: firstPtr.get(date) }));
        return { normalizedStart, startEpoch, endEpoch, days };
    }
    /**
     * The values of an interval, a day at a time. The next days load while one
     * is read : SpinalTimeSeriesArchive.loadAhead days at once, not one round
     * trip to the hub per day, nor one answer big enough to block the program.
     */
    valuesByDay(interval) {
        return __asyncGenerator(this, arguments, function* valuesByDay_1() {
            const { days } = interval;
            // the days after the first one past the interval are only read if it is
            // empty : they load when needed, not ahead
            const firstAfter = days.findIndex((day) => day.date > interval.endEpoch);
            const aheadLimit = firstAfter < 0 ? days.length : firstAfter + 1;
            const ahead = [];
            let next = 0;
            for (let i = 0; i < days.length; i += 1) {
                while (next < days.length &&
                    (next === i ||
                        (next < aheadLimit && next - i < SpinalTimeSeriesArchive.loadAhead))) {
                    ahead.push(this.loadDay(days[next].date, days[next].ptr));
                    next += 1;
                }
                const archive = yield __await(ahead.shift());
                const values = [];
                const goOn = readDay(archive, days[i].date, interval, values);
                if (values.length > 0)
                    yield yield __await(values);
                if (!goOn)
                    return yield __await(void 0);
            }
        });
    }
    /**
     * This function is used to get the last timeseries at a specific date.
     * It will fetch the last timeseries before or at the given date.
     * @param date
     */
    getLastTimeSeriesAtDate(date) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedDate = SpinalTimeSeriesArchive.normalizeDate(date);
            if (isNaN(normalizedDate)) {
                throw `the value [${date}] is not a valid date`;
            }
            let validArchiveDate = null;
            let idx;
            for (idx = 0; idx < this.lstDate.length; idx += 1) {
                const element = this.lstDate[idx].get();
                if (element > normalizedDate)
                    break; // Skip until correct day.
                validArchiveDate = element;
            }
            if (validArchiveDate === null)
                return null;
            const archive = yield this.getArchiveAtDate(validArchiveDate);
            const startEpoch = typeof date === 'number' || typeof date === 'string'
                ? new Date(date).getTime()
                : date.getTime();
            const archiveLen = archive.length.get();
            for (let index = archiveLen - 1; index >= 0; index -= 1) {
                const dateValue = archive.get(index);
                if (dateValue.date <= startEpoch) {
                    return dateValue;
                }
            }
            // if no data found in the current archive, return last data from previous archive
            idx -= 2; // move to previous archive
            if (idx < 0)
                return null; // no previous archive
            const previousArchiveDate = this.lstDate[idx].get();
            const previousArchive = yield this.getArchiveAtDate(previousArchiveDate);
            const previousArchiveLen = previousArchive.length.get();
            if (previousArchiveLen === 0)
                return null;
            return previousArchive.get(previousArchiveLen - 1);
        });
    }
    /**
     * getFromIntervalTimeGen is prefered.
     * @param {number} start
     * @param {(number|string)} [end=Date.now()]
     * @param {boolean} [includeLastBeforeStart=false] - If true, include the last value before start.
     * @returns {Promise<SpinalDateValue[]>}
     * @memberof SpinalTimeSeriesArchive
     */
    getFromIntervalTime(start, end = Date.now(), includeLastBeforeStart = false) {
        var _a, e_2, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            const interval = this.intervalOf(start, end);
            const result = [];
            if (includeLastBeforeStart) {
                const lastTs = yield this.getLastTimeSeriesAtDate(interval.startEpoch);
                if (lastTs && lastTs.date < interval.startEpoch)
                    result.push(lastTs);
            }
            try {
                // a day at a time, not a value at a time through the generator
                for (var _d = true, _e = __asyncValues(this.valuesByDay(interval)), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        const values = _c;
                        for (const value of values)
                            result.push(value);
                    }
                    finally {
                        _d = true;
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            return result;
        });
    }
    /**
     * @param {(number | string | Date)} date
     * @returns {Promise<SpinalTimeSeriesArchiveDay>}
     * @memberof SpinalTimeSeriesArchive
     */
    getArchiveAtDate(date, offsetArchive = 0) {
        this.cleanUpNaNDates();
        const normalizedDate = SpinalTimeSeriesArchive.normalizeDate(date);
        if (isNaN(normalizedDate)) {
            throw `the value [${date}] is not a valid date`;
        }
        if (offsetArchive === 0 && this.itemLoadedDictionary.has(normalizedDate)) {
            return this.itemLoadedDictionary.get(normalizedDate);
        }
        let idx = this.lstDate.indexOf(normalizedDate);
        if (idx < 0)
            return Promise.reject(new Error(`Date '${date}' not found.`));
        idx += offsetArchive;
        if (idx < 0 || idx >= this.lstDate.length) {
            return Promise.reject(new Error(`Offset '${offsetArchive}' is out of bounds for date '${date}'.`));
        }
        // the day loaded, which is not the one asked with an offset
        const archiveDate = this.lstDate[idx].get();
        if (this.itemLoadedDictionary.has(archiveDate)) {
            return this.itemLoadedDictionary.get(archiveDate);
        }
        return this.loadDay(archiveDate, this.lstItem[idx]);
    }
    /** the archive of a day, loaded once ; a failed load is tried again on the next call */
    loadDay(date, ptr) {
        const loaded = this.itemLoadedDictionary.get(date);
        if (loaded !== undefined)
            return loaded;
        const promise = new Promise((resolve, reject) => {
            if (typeof ptr.data.model !== 'undefined') {
                resolve(ptr.data.model);
            }
            else {
                ptr.load((element, error) => {
                    if (element && !error)
                        resolve(element);
                    else
                        reject(new Error(`the archive of the day ${new Date(date).toISOString()} could not be loaded`));
                });
            }
        });
        return this.keepLoaded(date, promise);
    }
    /** keeps a day loading, forgets it if the load fails : the next call tries again */
    keepLoaded(date, promise) {
        this.itemLoadedDictionary.set(date, promise);
        promise.catch(() => {
            if (this.itemLoadedDictionary.get(date) === promise) {
                this.itemLoadedDictionary.delete(date);
            }
        });
        return promise;
    }
    /**
     * @returns {Lst<Val>}
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
    purgeArchive(maxDay) {
        if (maxDay > 0) {
            let lstDateToDelete = [];
            const maxDayMS = maxDay * 86400000;
            const minDateMS = new Date().valueOf() - maxDayMS;
            for (let index = 0; index < this.lstDate.length; index += 1) {
                if (this.lstDate[index].get() <= minDateMS) {
                    lstDateToDelete.push(this.lstDate[index].get());
                }
            }
            for (let elt of lstDateToDelete) {
                let id = this.lstDate.indexOf(elt);
                this.lstDate.splice(id, 1);
                this.lstItem.splice(id, 1);
                // a value inserted later at this date goes to a new archive, not the purged one
                this.itemLoadedDictionary.delete(elt);
            }
        }
        else if (maxDay === 0) {
            this.lstDate.clear();
            this.lstItem.clear();
            this.itemLoadedDictionary.clear();
        }
    }
}
exports.SpinalTimeSeriesArchive = SpinalTimeSeriesArchive;
/**
 * number of days a read loads ahead : more is faster on long intervals, but
 * the hub sends them in one answer, that the program handles at once
 */
SpinalTimeSeriesArchive.loadAhead = 8;
/**
 * Pushes the values of a day that are in the interval, the way the reading
 * always went : the day of the start skips the values before it, and the
 * interval is over at the first value after its end. Returns false then.
 */
function readDay(archive, dayDate, interval, out) {
    repairLength(archive);
    const archiveLen = archive.length.get();
    let index = 0;
    if (interval.normalizedStart === dayDate) {
        for (; index < archiveLen; index += 1) {
            if (archive.get(index).date >= interval.startEpoch)
                break;
        }
    }
    for (; index < archiveLen; index += 1) {
        const dateValue = archive.get(index);
        if (dateValue.date === 0)
            continue; // skip empty timeseries
        if (dateValue.date > interval.endEpoch || dateValue.date < interval.normalizedStart)
            return false;
        out.push(dateValue);
    }
    return true;
}
/** Fix added for weird case where archive.length has been corrupted. */
function repairLength(archive) {
    var _a;
    if ((_a = archive.length) === null || _a === void 0 ? void 0 : _a.get())
        return;
    const incorrectlyNamedAttr = archive._attribute_names.find((attrName) => {
        return !['lstDate', 'lstValue', 'length', 'dateDay'].includes(attrName);
    });
    if (incorrectlyNamedAttr) {
        const lengthValue = archive[incorrectlyNamedAttr].get();
        archive.add_attr('length', lengthValue);
        archive.rem_attr(incorrectlyNamedAttr);
    }
}
spinal_core_connectorjs_1.spinalCore.register_models(SpinalTimeSeriesArchive);
//# sourceMappingURL=SpinalTimeSeriesArchive.js.map