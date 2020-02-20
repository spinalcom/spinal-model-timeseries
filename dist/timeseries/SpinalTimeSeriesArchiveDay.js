"use strict";
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
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
const SpinalTimeSeriesData_1 = require("./SpinalTimeSeriesData");
/**
 * @property {spinal.TypedArray_Float64} lstDate
 * @property {spinal.TypedArray_Float64} lstValue
 * @property {spinal.Val} length
 * @property {spinal.Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
class SpinalTimeSeriesArchiveDay extends spinal_core_connectorjs_type_1.Model {
    constructor(initialBlockSize = 50) {
        super();
        this.blockSize = initialBlockSize;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return;
        this.add_attr({
            // lstDate: new TypedArray_Float64(),
            // lstValue: new TypedArray_Float64(),
            data: new spinal_core_connectorjs_type_1.Lst(),
            dateDay: new Date().setUTCHours(0, 0, 0, 0),
            length: 0
        });
        this.data.push(new SpinalTimeSeriesData_1.SpinalTimeSeriesData(this.blockSize));
        // this.lstDate.resize([initialBlockSize]);
        // this.lstValue.resize([initialBlockSize]);
    }
    // /**
    //  * @param {number} data
    //  * @memberof SpinalTimeSeriesArchiveDay
    //  */
    // push(data: number): void {
    //   if (this.lstDate.size(0) <= this.length.get()) this.addBufferSizeLength();
    //   this.lstDate.set_val(this.length.get(), Date.now());
    //   this.lstValue.set_val(this.length.get(), data);
    //   this.length.set(this.length.get() + 1);
    // }
    /**
     * @param {number} value
     * @memberof SpinalTimeSeriesArchiveDay
     */
    push(value) {
        return __awaiter(this, void 0, void 0, function* () {
            let lastData = this.data[this.data.length - 1];
            let valueAdded = yield lastData.push(value);
            if (valueAdded)
                return;
            this.data.push(new SpinalTimeSeriesData_1.SpinalTimeSeriesData(this.blockSize));
            return this.push(value);
        });
    }
    /**
     * @param {number} [index]
     * @returns {(SpinalDateValue | SpinalDateValueArray)}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    get(index) {
        if (typeof index === "number")
            return this.at(index);
        return {
            dateDay: this.dateDay.get(),
            date: this.lstDate.get().subarray(0, this.length.get()),
            value: this.lstValue.get().subarray(0, this.length.get())
        };
    }
    /**
     * alias of 'get' method with index
     * @param {number} index
     * @returns {SpinalDateValue}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    at(index) {
        if (index >= this.length.get() || index < 0) {
            return undefined;
        }
        return {
            date: this.lstDate.get(index),
            value: this.lstValue.get(index)
        };
    }
    getFromIntervalTimeGen(start = 0, end = Date.now()) {
        return __asyncGenerator(this, arguments, function* getFromIntervalTimeGen_1() {
            // for (let i = 0; i < this.data.length; i++) {
            //   const element: SpinalTimeSeriesData = this.data[i];
            //   const elementStart = element.start.get();
            //   const elementEnd = element.end.get();
            //   if (start > element.start.get() || start < element.end.get()) continue;
            //   let archive = this._getItemDate(element);
            //   const archiveLen = element.length.get();
            // }
            var e_1, _a;
            for (let index = 0; index < this.data.length; index++) {
                const element = this.data[index];
                const data = yield __await(element.getFromIntervalTimeGen(start, end));
                try {
                    for (var data_1 = __asyncValues(data), data_1_1; data_1_1 = yield __await(data_1.next()), !data_1_1.done;) {
                        const res = data_1_1.value;
                        yield yield __await(res);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (data_1_1 && !data_1_1.done && (_a = data_1.return)) yield __await(_a.call(data_1));
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    }
    _getItemDate(item) {
        return item.get().then(val => {
            return val.date;
        });
    }
}
exports.SpinalTimeSeriesArchiveDay = SpinalTimeSeriesArchiveDay;
exports.default = SpinalTimeSeriesArchiveDay;
spinal_core_connectorjs_type_1.spinalCore.register_models(SpinalTimeSeriesArchiveDay);
//# sourceMappingURL=SpinalTimeSeriesArchiveDay.js.map