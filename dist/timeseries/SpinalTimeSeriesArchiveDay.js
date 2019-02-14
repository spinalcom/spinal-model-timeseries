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
Object.defineProperty(exports, "__esModule", { value: true });
const spinal_core_connectorjs_type_1 = require("spinal-core-connectorjs_type");
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
        if (spinal_core_connectorjs_type_1.FileSystem._sig_server === false)
            return;
        this.add_attr({
            lstDate: new spinal_core_connectorjs_type_1.TypedArray_Float64(),
            lstValue: new spinal_core_connectorjs_type_1.TypedArray_Float64(),
            dateDay: new Date().setUTCHours(0, 0, 0, 0),
            length: 0,
        });
        this.lstDate.resize([initialBlockSize]);
        this.lstValue.resize([initialBlockSize]);
    }
    /**
     * @param {number} data
     * @memberof SpinalTimeSeriesArchiveDay
     */
    push(data) {
        if (this.lstDate.size(0) <= this.length.get())
            this.addBufferSizeLength();
        this.lstDate.set_val(this.length.get(), Date.now());
        this.lstValue.set_val(this.length.get(), data);
        this.length.set(this.length.get() + 1);
    }
    /**
     * @param {number} data
     * @param {(number|string|Date)} date
     * @returns {boolean}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    insert(data, date) {
        const targetDate = new Date(date).getTime();
        const maxDate = new Date(this.dateDay.get()).setUTCHours(23, 59, 59, 999);
        if (this.dateDay.get() <= targetDate && targetDate <= maxDate) {
            if (this.lstDate.size(0) <= this.length.get())
                this.addBufferSizeLength();
            let index = 0;
            for (; index < this.length.get(); index += 1) {
                const element = this.lstDate.get(index);
                if (element === targetDate) { // check exist
                    this.lstValue.set_val([index], data);
                    return true;
                }
                if (element > targetDate)
                    break;
            }
            if (index === this.length.get()) {
                this.lstDate.set_val(this.length.get(), targetDate);
                this.lstValue.set_val(this.length.get(), data);
                this.length.set(this.length.get() + 1);
            }
            else {
                for (let idx = this.length.get() - 1; idx >= index; idx -= 1) {
                    this.lstDate.set_val([idx + 1], this.lstDate.get(idx));
                    this.lstValue.set_val([idx + 1], this.lstValue.get(idx));
                }
                this.lstDate.set_val([index], targetDate);
                this.lstValue.set_val([index], data);
                this.length.set(this.length.get() + 1);
            }
            return true;
        }
        return false;
    }
    /**
     * @param {number} [index]
     * @returns {(SpinalDateValue | SpinalDateValueArray)}
     * @memberof SpinalTimeSeriesArchiveDay
     */
    get(index) {
        if (typeof index === 'number')
            return this.at(index);
        return {
            dateDay: this.dateDay.get(),
            date: this.lstDate.get().subarray(0, this.length.get()),
            value: this.lstValue.get().subarray(0, this.length.get()),
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
            value: this.lstValue.get(index),
        };
    }
    /**
     * For Tests - returns the TypedArrays' size
     * @memberof SpinalTimeSeriesArchiveDay
     */
    getActualBufferSize() {
        return this.lstDate.size(0);
    }
    /**
     * @private
     * @memberof SpinalTimeSeriesArchiveDay
     */
    addBufferSizeLength() {
        this.lstDate.resize([this.length.get() * 2]);
        this.lstValue.resize([this.length.get() * 2]);
    }
}
exports.SpinalTimeSeriesArchiveDay = SpinalTimeSeriesArchiveDay;
exports.default = SpinalTimeSeriesArchiveDay;
spinal_core_connectorjs_type_1.spinalCore.register_models(SpinalTimeSeriesArchiveDay);
//# sourceMappingURL=SpinalTimeSeriesArchiveDay.js.map