"use strict";
/*
 * Copyright 2020 SpinalCom - www.spinalcom.com
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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
class SpinalTimeSeriesData extends spinal_core_connectorjs_type_1.Model {
    constructor(maxBlockSize = 50) {
        super();
        this.maxBlockSize = maxBlockSize;
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return;
        this.add_attr({
            length: 0,
            start: Date.now(),
            end: Date.now(),
            lstDate: new spinal_core_connectorjs_type_1.Ptr(new spinal_core_connectorjs_type_1.TypedArray_Float64(maxBlockSize)),
            lstValue: new spinal_core_connectorjs_type_1.Ptr(new spinal_core_connectorjs_type_1.TypedArray_Float64(maxBlockSize))
        });
    }
    push(data) {
        if (this.length.get() >= this.maxBlockSize - 1)
            return Promise.resolve(false);
        return this._getLstDateAndLstValue().then(values => {
            let lstDate = values.lstDate;
            let lstValue = values.lstValue;
            let date = Date.now();
            lstDate.set_val(this.length.get(), date);
            lstValue.set_val(this.length.get(), data);
            this.end.set(date);
            this.length.set(this.length.get() + 1);
            return true;
        });
    }
    get(index) {
        return this._getLstDateAndLstValue().then((values) => {
            if (typeof index === "number")
                return this.at(index);
            return {
                date: values.lstDate.get().subarray(0, this.length.get()),
                value: values.lstValue.get().subarray(0, this.length.get())
            };
        });
    }
    at(index) {
        return this._getLstDateAndLstValue().then((values) => {
            if (index >= this.length.get() || index < 0) {
                return undefined;
            }
            return {
                date: values.lstDate.get(index),
                value: values.lstValue.get(index)
            };
        });
    }
    getFromIntervalTimeGen(start = 0, end = Date.now()) {
        return __asyncGenerator(this, arguments, function* getFromIntervalTimeGen_1() {
            if ((end >= this.start.get()) && (start <= this.end.get())) {
                // ok
                // load
                // jump start > date
                // while end > date or length
                //   yeild res
                let data = yield __await(this._getPtrValue(this.lstDate));
                for (let index = 0; index < this.length.get(); index++) {
                    const dateValue = data.get(index);
                    if (dateValue > end)
                        return yield __await(void 0);
                    yield yield __await(dateValue);
                }
            }
        });
    }
    _getPtrValue(_ptr) {
        return new Promise(resolve => {
            _ptr.load(value => {
                return resolve(value);
            });
        });
    }
    _getLstDateAndLstValue() {
        return Promise.all([
            this._getPtrValue(this.lstDate),
            this._getPtrValue(this.lstValue)
        ]).then((values) => {
            return {
                lstDate: values[0],
                lstValue: values[1]
            };
        });
    }
}
exports.SpinalTimeSeriesData = SpinalTimeSeriesData;
exports.default = SpinalTimeSeriesData;
spinal_core_connectorjs_type_1.default.register_models(SpinalTimeSeriesData);
//# sourceMappingURL=SpinalTimeSeriesData.js.map