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

import spinalCore, {
  Model,
  FileSystem,
  Ptr,
  TypedArray_Float64
} from "spinal-core-connectorjs_type";

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

interface SpinalData {
  lstDate: spinal.TypedArray_Float64;
  lstValue: spinal.TypedArray_Float64;
}

export class SpinalTimeSeriesData extends Model {
  public start: spinal.Val;
  public end: spinal.Val;
  public length: spinal.Val;
  private lstDate: spinal.Ptr<spinal.TypedArray_Float64>;
  private lstValue: spinal.Ptr<spinal.TypedArray_Float64>;
  private maxBlockSize: number;

  constructor(maxBlockSize: number = 50) {
    super();

    this.maxBlockSize = maxBlockSize;
    if (FileSystem._sig_server === false) return;
    this.add_attr({
      length: 0,
      start: Date.now(),
      end: Date.now(),
      lstDate: new Ptr(new TypedArray_Float64(maxBlockSize)),
      lstValue: new Ptr(new TypedArray_Float64(maxBlockSize))
    });
  }

  public push(data): Promise<boolean> {
    if (this.length.get() >= this.maxBlockSize - 1)
      return Promise.resolve(false);

    return this._getLstDateAndLstValue().then(values => {
      let lstDate: any = values.lstDate;
      let lstValue: any = values.lstValue;

      let date = Date.now();

      lstDate.set_val(this.length.get(), date);
      lstValue.set_val(this.length.get(), data);
      this.end.set(date);
      this.length.set(this.length.get() + 1);

      return true;
    });
  }

  public get(index: number): Promise<SpinalDateValue>;
  public get(): Promise<SpinalDateValueArray>;
  public get(index?: number): Promise<SpinalDateValue | SpinalDateValueArray> {
    return this._getLstDateAndLstValue().then((values: any) => {
      if (typeof index === "number") return this.at(index);

      return {
        date: values.lstDate.get().subarray(0, this.length.get()),
        value: values.lstValue.get().subarray(0, this.length.get())
      };
    });
  }

  public at(index: number): Promise<SpinalDateValue> {
    return this._getLstDateAndLstValue().then((values: any) => {
      if (index >= this.length.get() || index < 0) {
        return undefined;
      }
      return {
        date: values.lstDate.get(index),
        value: values.lstValue.get(index)
      };
    });
  }


  public async *getFromIntervalTimeGen(
    start: number | string | Date = 0,
    end: number | string | Date = Date.now()
  ) {
    if ((end >= this.start.get()) && (start <= this.end.get())) {
      // ok
      // load
      // jump start > date
      // while end > date or length
      //   yeild res

      let data: any = await this._getPtrValue(this.lstDate);

      for (let index = 0; index < this.length.get(); index++) {
        const dateValue = data.get(index);

        if (dateValue > end) return;

        yield dateValue;

      }

    }
  }


  private _getPtrValue(_ptr: spinal.Ptr<any>) {
    return new Promise(resolve => {
      _ptr.load(value => {
        return resolve(value);
      });
    });
  }

  private _getLstDateAndLstValue(): Promise<SpinalData> {
    return Promise.all([
      this._getPtrValue(this.lstDate),
      this._getPtrValue(this.lstValue)
    ]).then((values: Array<any>) => {
      return {
        lstDate: values[0],
        lstValue: values[1]
      };
    });
  }
}


export default SpinalTimeSeriesData;
spinalCore.register_models(SpinalTimeSeriesData);
