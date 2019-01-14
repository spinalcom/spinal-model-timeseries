import {} from 'mocha';
import {
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
} from '../../dist/index';
import { FileSystem } from 'spinal-core-connectorjs_type';
import * as assert from 'assert';
import * as tk from 'timekeeper';
tk.freeze(1546532599592);

const todayDate = new Date().setHours(0, 0, 0, 0);
const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const isFloat64ArraySorted = (array: Float64Array): number => {
  return array.every((value, index) => !index || (value >= array[index - 1]))
      ? 1 : array.every((value, index) => !index || (value <= array[index - 1]))
          ? -1 : 0;
};
describe('SpinalTimeSeriesArchiveDay', () => {
  let instanceTest: SpinalTimeSeriesArchiveDay;
  describe('test on construnctor',  () => {

    it('Create with FileSystem._sig_server === false', () => {
      FileSystem._sig_server = false;
      instanceTest = new SpinalTimeSeriesArchiveDay();
      FileSystem._sig_server = true;
      assert(typeof instanceTest.length === 'undefined');
      assert(typeof instanceTest.dateDay === 'undefined');
    });

    it('Create with initilzed value', () => {
      instanceTest = new SpinalTimeSeriesArchiveDay();
      assert(instanceTest.length.get() === 0);
      assert(instanceTest.dateDay.get() === todayDate);
      assert(instanceTest.getActualBufferSize() === 50);
    });

    it('Set the "buffer" size manualy', () => {
      instanceTest = new SpinalTimeSeriesArchiveDay(2);
      assert(instanceTest.length.get() === 0);
      assert(instanceTest.dateDay.get() === todayDate);
      assert(instanceTest.getActualBufferSize() === 2);
    });
  });
  describe('test on push', () => {
    it('Push 10 items then check "buffer" size', () => {
      for (const item of testArray) {
        instanceTest.push(item);
      }
      assert(instanceTest.getActualBufferSize() === 16);
    });
    it('wait 500ms and push again 10 items then check "buffer" size',  () => {
      tk.travel(Date.now() + 500);
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const arr1 = [1, 6, 3, 5, 2, 7, 8, 9, 4];
      for (const item of arr) {
        instanceTest.insert(arr1[item], Date.now() + arr1[item]);
      }
      assert(instanceTest.getActualBufferSize() === 32);
    });
    it('insert for an otherday does return false', () => {
      const res = instanceTest.insert(42, Date.now() + 100000000000000000);
      assert(res === false);
      assert(instanceTest.getActualBufferSize() === 32);
    });
  });
  describe('test on get', () => {
    let instanceGet: SpinalDateValueArray;
    it('get the object and compare with an Float64Array', () => {
      instanceGet = instanceTest.get();
      assert(instanceGet.dateDay === todayDate);
      const testValue = Float64Array.from(testArray.concat(testArray));
      assert(instanceGet.value.join() === testValue.join());
    });
    it('insert order', () => {
      instanceGet = instanceTest.get();
      const { date } = instanceTest.get();
      assert(isFloat64ArraySorted(date) === 1);
    });
    it('get out of range', () => {
      const test = instanceTest.at(100000000);
      const test1 = instanceTest.at(0);
      const test2 = instanceTest.at(-1);
      assert(test === undefined);
      assert(test2 === undefined);
      assert(test1 !== undefined);
    });

    it('get at index equal date and compare', () => {
      instanceGet = instanceTest.get();
      const len = instanceTest.length.get();
      for (let index = 0; index < len; index += 1) {
        const atIndex: SpinalDateValue = instanceTest.get(index);
        assert(instanceGet.date[index] === atIndex.date);
        assert(instanceGet.value[index] === atIndex.value);
      }
    });

  });
});
