import {
  Model,
  FileSystem,
  spinalCore,
  TypedArray_Float64,
} from 'spinal-core-connectorjs_type';

interface SpinalDateValue {
  date: number;
  value: number;
}

interface SpinalDateValueArray {
  dateDay: number;
  date: Float64Array;
  value: Float64Array;
}

class SpinalTimeSeriesArchiveDay extends Model {
  private lstDate: spinal.TypedArray_Float64;
  private lstValue: spinal.TypedArray_Float64;
  public length: spinal.Val;
  public dateDay: spinal.Val;

  constructor(initialBlockSize: number = 50) {
    super();
    if (FileSystem._sig_server === false) return;
    this.add_attr({
      lstDate: new TypedArray_Float64(),
      lstValue: new TypedArray_Float64(),
      dateDay: new Date().setHours(0, 0, 0, 0),
      length: 0,
    });
    this.lstDate.resize([initialBlockSize]);
    this.lstValue.resize([initialBlockSize]);
  }

  push(data: number): void {
    if (this.lstDate.size(0) <= this.length.get()) this.addBufferSizeLength();
    this.lstDate.set_val(this.length.get(), Date.now());
    this.lstValue.set_val(this.length.get(), data);
    this.length.set(this.length.get() + 1);
  }
  insert(data: number, date: number|string|Date): boolean {
    const targetDate = new Date(date).getTime();
    const maxDate = new Date().setHours(23, 59, 59, 999);
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

  get(index: number): SpinalDateValue;
  get(): SpinalDateValueArray;
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
    if (index >= this.length.get()) return undefined;
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

  private addBufferSizeLength() {
    this.lstDate.resize([this.length.get() * 2]);
    this.lstValue.resize([this.length.get() * 2]);
  }
}

export { SpinalTimeSeriesArchiveDay, SpinalDateValue, SpinalDateValueArray };
export default SpinalTimeSeriesArchiveDay;

spinalCore.register_models(SpinalTimeSeriesArchiveDay);
