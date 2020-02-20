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
  Lst,
  Val
} from "spinal-core-connectorjs_type";

import {
  SpinalDateValue,
  SpinalDateValueArray,
  SpinalTimeSeriesData
} from "./SpinalTimeSeriesData";

/**
 * @property {spinal.TypedArray_Float64} lstDate
 * @property {spinal.TypedArray_Float64} lstValue
 * @property {spinal.Val} length
 * @property {spinal.Val} dateDay
 * @class SpinalTimeSeriesArchiveDay
 * @extends {Model}
 */
export class SpinalTimeSeriesArchiveDay extends Model {
  // /**
  //  * @private
  //  * @type {spinal.TypedArray_Float64}
  //  * @memberof SpinalTimeSeriesArchiveDay
  //  */
  // private lstDate: spinal.TypedArray_Float64;
  // /**
  //  * @private
  //  * @type {spinal.TypedArray_Float64}
  //  * @memberof SpinalTimeSeriesArchiveDay
  //  */
  // private lstValue: spinal.TypedArray_Float64;
  public data: spinal.Lst<SpinalTimeSeriesData>;
  // public length: spinal.Val;
  public dateDay: spinal.Val;

  private blockSize: number;

  constructor(initialBlockSize: number = 50) {
    super();
    this.blockSize = initialBlockSize;
    if (FileSystem._sig_server === false) return;
    this.add_attr({
      // lstDate: new TypedArray_Float64(),
      // lstValue: new TypedArray_Float64(),
      data: new Lst(),
      dateDay: new Date().setUTCHours(0, 0, 0, 0),
      length: 0
    });

    this.data.push(new SpinalTimeSeriesData(this.blockSize));

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
  public async push(value: number): Promise<void> {
    let lastData = this.data[this.data.length - 1];

    let valueAdded = await lastData.push(value);
    if (valueAdded) return;

    this.data.push(new SpinalTimeSeriesData(this.blockSize));
    return this.push(value);
  }

  // /**
  //  * @param {number} data
  //  * @param {(number|string|Date)} date
  //  * @returns {boolean}
  //  * @memberof SpinalTimeSeriesArchiveDay
  //  */
  // insert(data: number, date: number | string | Date): boolean {
  //   const targetDate = new Date(date).getTime();
  //   const maxDate = new Date(this.dateDay.get()).setUTCHours(23, 59, 59, 999);
  //   if (this.dateDay.get() <= targetDate && targetDate <= maxDate) {
  //     if (this.lstDate.size(0) <= this.length.get()) this.addBufferSizeLength();
  //     let index = 0;
  //     for (; index < this.length.get(); index += 1) {
  //       const element = this.lstDate.get(index);
  //       if (element === targetDate) {
  //         // check exist
  //         this.lstValue.set_val([index], data);
  //         return true;
  //       }
  //       if (element > targetDate) break;
  //     }
  //     if (index === this.length.get()) {
  //       this.lstDate.set_val(this.length.get(), targetDate);
  //       this.lstValue.set_val(this.length.get(), data);
  //       this.length.set(this.length.get() + 1);
  //     } else {
  //       for (let idx = this.length.get() - 1; idx >= index; idx -= 1) {
  //         this.lstDate.set_val([idx + 1], this.lstDate.get(idx));
  //         this.lstValue.set_val([idx + 1], this.lstValue.get(idx));
  //       }
  //       this.lstDate.set_val([index], targetDate);
  //       this.lstValue.set_val([index], data);
  //       this.length.set(this.length.get() + 1);
  //     }
  //     return true;
  //   }
  //   return false;
  // }

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
    if (typeof index === "number") return this.at(index);
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
  at(index: number): SpinalDateValue {
    if (index >= this.length.get() || index < 0) {
      return undefined;
    }
    return {
      date: this.lstDate.get(index),
      value: this.lstValue.get(index)
    };
  }

  public async *getFromIntervalTimeGen(
    start: number | string | Date = 0,
    end: number | string | Date = Date.now()
  ) {
    // for (let i = 0; i < this.data.length; i++) {
    //   const element: SpinalTimeSeriesData = this.data[i];
    //   const elementStart = element.start.get();
    //   const elementEnd = element.end.get();
    //   if (start > element.start.get() || start < element.end.get()) continue;
    //   let archive = this._getItemDate(element);
    //   const archiveLen = element.length.get();
    // }

    for (let index = 0; index < this.data.length; index++) {
      const element: SpinalTimeSeriesData = this.data[index];

      const data = await element.getFromIntervalTimeGen(start, end);

      for await (const res of data) {
        yield res;
      }

    }
  }

  private _getItemDate(item: SpinalTimeSeriesData): Promise<any> {
    return item.get().then(val => {
      return val.date;
    });
  }

  // let index = 0;
  // const archiveLen = archive.length.get();
  // if (normalizedStart === element) {
  //   for (; index < archiveLen; index += 1) {
  //     const dateValue = archive.get(index);
  //     if (dateValue.date >= start) {
  //       break;
  //     }
  //   }
  // }
  // for (; index < archiveLen; index += 1) {
  //   const dateValue = archive.get(index);
  //   if (dateValue.date > normalizedEnd) return;
  //   yield dateValue;
  // }

  // private _getAllData() {
  //   let promises = [];

  //   for (let i = 0; i < this.data.length; i++) {
  //     const spinalData = this.data[i];
  //     promises.push(spinalData.get());
  //   }

  //   return Promise.all(promises).then(values => {
  //     let obj = {
  //       date: [],
  //       value: []
  //     };

  //     values.forEach(value => {
  //       obj.date.push(...value.date);
  //       obj.value.push(...value.value);
  //     });

  //     return obj;
  //   });
  // }

  // /**
  //  * For Tests - returns the TypedArrays' size
  //  * @memberof SpinalTimeSeriesArchiveDay
  //  */
  // getActualBufferSize(): number {
  //   return this.lstDate.size(0);
  // }

  // /**
  //  * @private
  //  * @memberof SpinalTimeSeriesArchiveDay
  //  */
  // private addBufferSizeLength() {
  //   this.lstDate.resize([this.length.get() * 2]);
  //   this.lstValue.resize([this.length.get() * 2]);
  // }
}

export default SpinalTimeSeriesArchiveDay;

spinalCore.register_models(SpinalTimeSeriesArchiveDay);
