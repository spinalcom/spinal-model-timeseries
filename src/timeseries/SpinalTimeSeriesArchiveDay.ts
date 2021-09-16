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
  Lst,
  TypedArray,
} from 'spinal-core-connectorjs_type';
import { SpinalDateValue } from './SpinalDateValue';
import { SpinalDateValueArray } from './SpinalDateValueArray';

/**
 * @property {spinal.Lst<spinal.Val>} lstDate
 * @property {spinal.Lst<spinal.Val>} lstValue
 * @property {spinal.Val} length
 * @property {spinal.Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
export class SpinalTimeSeriesArchiveDay extends Model {
  /**
   * @private
   * @type {spinal.Lst<spinal.Val>}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  private lstDate: spinal.Lst<spinal.Val>;
  /**
   * @private
   * @type {spinal.Lst<spinal.Val>}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  private lstValue: spinal.Lst<spinal.Val>;
  public length: spinal.Val;
  public dateDay: spinal.Val;

  constructor(initialBlockSize: number = 50) {
    super();
    if (FileSystem._sig_server === false) return;
    this.add_attr({
      lstDate: new Lst(Array(initialBlockSize).fill(0)),
      lstValue: new Lst(Array(initialBlockSize).fill(0)),
      dateDay: new Date().setUTCHours(0, 0, 0, 0),
      length: 0,
    });
  }

  /**
   * @param {number} data
   * @memberof SpinalTimeSeriesArchiveDay
   */
  push(data: number): void {
    this.upgradeFromOldTimeSeries();
    if (this.lstDate.length <= this.length.get()) this.addBufferSizeLength();
    this.lstDate[this.length.get()].set(Date.now());
    this.lstValue[this.length.get()].set(data);
    this.length.set(this.length.get() + 1);
  }
  /**
   * @param {number} data
   * @param {(number|string|Date)} date
   * @returns {boolean}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  insert(data: number, date: number | string | Date): boolean {
    this.upgradeFromOldTimeSeries();
    const targetDate = new Date(date).getTime();
    const maxDate = new Date(this.dateDay.get()).setUTCHours(23, 59, 59, 999);
    if (this.dateDay.get() <= targetDate && targetDate <= maxDate) {
      if (this.lstDate.length <= this.length.get()) this.addBufferSizeLength();
      let index = 0;
      for (; index < this.length.get(); index += 1) {
        const element = this.lstDate[index].get();
        if (element === targetDate) {
          // check exist
          this.lstValue[index].set(data);
          // this.lstValue.set_val([index], data);
          return true;
        }
        if (element > targetDate) break;
      }
      if (index === this.length.get()) {
        this.lstDate[this.length.get()].set(targetDate);
        this.lstValue[this.length.get()].set(data);
        this.length.set(this.length.get() + 1);
      } else {
        for (let idx = this.length.get() - 1; idx >= index; idx -= 1) {
          this.lstDate[idx + 1].set(this.lstDate[idx].get());
          this.lstValue[idx + 1].set(this.lstValue[idx].get());
        }
        this.lstDate[index].set(targetDate);
        this.lstValue[index].set(data);
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
    this.upgradeFromOldTimeSeries();
    if (typeof index === 'number') return this.at(index);
    const date = [],
      value = [];
    for (let idx = 0; idx < this.length.get(); idx++) {
      date.push(this.lstDate[idx].get());
      value.push(this.lstValue[idx].get());
    }
    return {
      dateDay: this.dateDay.get(),
      date,
      value,
    };
  }

  /**
   * alias of 'get' method with index
   * @param {number} index
   * @returns {SpinalDateValue}
   * @memberof SpinalTimeSeriesArchiveDay
   */
  public at(index: number): SpinalDateValue {
    this.upgradeFromOldTimeSeries();
    if (index >= this.length.get() || index < 0) {
      return undefined;
    }
    return {
      date: this.lstDate[index].get(),
      value: this.lstValue[index].get(),
    };
  }

  /**
   * For Tests - returns the TypedArrays' size
   * @memberof SpinalTimeSeriesArchiveDay
   */
  public getActualBufferSize(): number {
    return this.lstDate.length;
  }

  /**
   * @private
   * @memberof SpinalTimeSeriesArchiveDay
   */
  private addBufferSizeLength() {
    this.upgradeFromOldTimeSeries();
    for (let idx = this.length.get(); idx < this.length.get() * 2; idx++) {
      this.lstDate.push(0);
      this.lstValue.push(0);
    }
  }

  private upgradeFromOldTimeSeries() {
    if (this.lstDate instanceof TypedArray) {
      const tmpDate = this.lstDate;
      const tmpValue = this.lstValue;
      this.mod_attr('lstDate', tmpDate.get());
      this.mod_attr('lstValue', tmpValue.get());
    }
  }
}

export default SpinalTimeSeriesArchiveDay;

spinalCore.register_models(SpinalTimeSeriesArchiveDay);
