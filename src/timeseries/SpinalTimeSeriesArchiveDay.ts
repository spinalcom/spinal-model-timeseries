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

import {
  Model,
  FileSystem,
  spinalCore,
  TypedArray_Float64,
} from 'spinal-core-connectorjs_type';

/**
 * @property {number} date
 * @property {number} value
 * @interface SpinalDateValue
 */
export interface SpinalDateValue {
  date: number;
  value: number;
}

/**
 * @property {number} dateDay
 * @property {Float64Array} date
 * @property {Float64Array} value
 * @interface SpinalDateValueArray
 */
export interface SpinalDateValueArray {
  dateDay: number;
  date: Float64Array;
  value: Float64Array;
}

/**
 * @property {spinal.TypedArray_Float64} lstDate
 * @property {spinal.TypedArray_Float64} lstValue
 * @property {spinal.Val} length
 * @property {spinal.Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
export class SpinalTimeSeriesArchiveDay extends Model {
  /**
   * @private
   * @type {spinal.TypedArray_Float64}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  private lstDate: spinal.TypedArray_Float64;
  /**
   * @private
   * @type {spinal.TypedArray_Float64}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  private lstValue: spinal.TypedArray_Float64;
  public length: spinal.Val;
  public dateDay: spinal.Val;

  constructor(initialBlockSize: number = 50) {
    super();
    if (FileSystem._sig_server === false) return;
    this.add_attr({
      lstDate: new TypedArray_Float64(),
      lstValue: new TypedArray_Float64(),
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
  push(data: number): void {
    if (this.lstDate.size(0) <= this.length.get()) this.addBufferSizeLength();
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
  insert(data: number, date: number|string|Date): boolean {
    const targetDate = new Date(date).getTime();
    const maxDate = new Date(this.dateDay.get()).setUTCHours(23, 59, 59, 999);
    if (this.dateDay.get() <= targetDate && targetDate <= maxDate) {
      if (this.lstDate.size(0) <= this.length.get()) this.addBufferSizeLength();
      let index = 0;
      for (; index < this.length.get(); index += 1) {
        const element = this.lstDate.get(index);
        if (element > targetDate) break;
      }
      if (index === this.length.get()) {
        this.lstDate.set_val(this.length.get(), targetDate);
        this.lstValue.set_val(this.length.get(), data);
        this.length.set(this.length.get() + 1);
      } else {

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
   * @param {number} index
   * @returns {SpinalDateValue}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  get(index: number): SpinalDateValue;
  /**
   * @returns {SpinalDateValueArray}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  get(): SpinalDateValueArray;
  /**
   * @param {number} [index]
   * @returns {(SpinalDateValue | SpinalDateValueArray)}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  get(index?: number): SpinalDateValue | SpinalDateValueArray {
    if (typeof index === 'number') return this.at(index);
    return {
      dateDay: this.dateDay.get(),
      date : this.lstDate.get().subarray(0, this.length.get()),
      value : this.lstValue.get().subarray(0, this.length.get()),
    };
  }
  /**
   * alias of 'get' method with index
   * @param {number} index
   * @returns {SpinalDateValue}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  at(index: number): SpinalDateValue {
    if (index >= this.length.get() || index < 0) {
      return undefined;
    }
    return {
      date : this.lstDate.get(index),
      value : this.lstValue.get(index),
    };
  }

  /**
   * For Tests - returns the TypedArrays' size
   * @memberof SpinalTimeSeriesArchiveDay
   */
  getActualBufferSize(): number {
    return this.lstDate.size(0);
  }

  /**
   * @private
   * @memberof SpinalTimeSeriesArchiveDay
   */
  private addBufferSizeLength() {
    this.lstDate.resize([this.length.get() * 2]);
    this.lstValue.resize([this.length.get() * 2]);
  }
}

export default SpinalTimeSeriesArchiveDay;

spinalCore.register_models(SpinalTimeSeriesArchiveDay);
