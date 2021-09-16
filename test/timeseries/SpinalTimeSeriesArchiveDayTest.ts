/*
 * Copyright 2021 SpinalCom - www.spinalcom.com
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

import {} from 'mocha';
import {
  SpinalTimeSeriesArchiveDay,
  SpinalDateValue,
  SpinalDateValueArray,
} from '../../src/index';
import { FileSystem } from 'spinal-core-connectorjs_type';
import * as assert from 'assert';
import * as tk from 'timekeeper';
tk.freeze(1546532599592);

const todayDate = new Date().setUTCHours(0, 0, 0, 0);
const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const isFloat64ArraySorted = (array: number[]): number => {
  return array.every((value, index) => !index || value >= array[index - 1])
    ? 1
    : array.every((value, index) => !index || value <= array[index - 1])
    ? -1
    : 0;
};
describe('SpinalTimeSeriesArchiveDay', () => {
  let instanceTest: SpinalTimeSeriesArchiveDay;
  describe('test on construnctor', () => {
    it('Create with FileSystem._sig_server === false', () => {
      FileSystem._sig_server = false;
      instanceTest = new SpinalTimeSeriesArchiveDay();
      FileSystem._sig_server = true;
      assert.strictEqual(typeof instanceTest.length, 'undefined');
      assert.strictEqual(typeof instanceTest.dateDay, 'undefined');
    });

    it('Create with initilzed value', () => {
      instanceTest = new SpinalTimeSeriesArchiveDay();
      assert.strictEqual(instanceTest.length.get(), 0);
      assert.strictEqual(instanceTest.dateDay.get(), todayDate);
      assert.strictEqual(instanceTest.getActualBufferSize(), 50);
    });

    it('Set the "buffer" size manualy', () => {
      instanceTest = new SpinalTimeSeriesArchiveDay(2);
      assert.strictEqual(instanceTest.length.get(), 0);
      assert.strictEqual(instanceTest.dateDay.get(), todayDate);
      assert.strictEqual(instanceTest.getActualBufferSize(), 2);
    });
  });
  describe('test on push', () => {
    it('Push 10 items then check "buffer" size', () => {
      for (const item of testArray) {
        instanceTest.push(item);
      }
      assert.strictEqual(instanceTest.getActualBufferSize(), 16);
    });
    it('wait 500ms and push again 10 items then check "buffer" size', () => {
      tk.travel(Date.now() + 500);
      const arr = [0, 1, 2, 3, 4, 5, 6, 7, 8];
      const arr1 = [1, 6, 3, 5, 2, 7, 8, 9, 4];
      for (const item of arr) {
        instanceTest.insert(arr1[item], Date.now() + arr1[item]);
      }
      assert.strictEqual(instanceTest.getActualBufferSize(), 32);
    });

    it('push to an existing date should just edit it', () => {
      instanceTest.insert(42, Date.now() + 1);
      const data = instanceTest.get(9);
      assert.strictEqual(data.value, 42);
    });

    it('insert for an otherday does return false', () => {
      const res = instanceTest.insert(42, Date.now() + 100000000000000000);
      assert.strictEqual(res, false);
      assert.strictEqual(instanceTest.getActualBufferSize(), 32);
    });
  });
  describe('test on get', () => {
    let instanceGet: SpinalDateValueArray;
    it('get the object and compare with an number[]', () => {
      instanceGet = instanceTest.get();
      assert.strictEqual(instanceGet.dateDay, todayDate);
      const testValue = Array.from(testArray.concat(testArray));
      testValue[9] = 42;
      assert.strictEqual(instanceGet.value.join(), testValue.join());
    });
    it('insert order', () => {
      instanceGet = instanceTest.get();
      const { date } = instanceTest.get();
      assert.strictEqual(isFloat64ArraySorted(date), 1);
    });
    it('get out of range', () => {
      const test = instanceTest.at(100000000);
      const test1 = instanceTest.at(0);
      const test2 = instanceTest.at(-1);
      assert.strictEqual(test, undefined);
      assert.strictEqual(test2, undefined);
      assert.notStrictEqual(test1, undefined);
    });

    it('get at index equal date and compare', () => {
      instanceGet = instanceTest.get();
      const len = instanceTest.length.get();
      for (let index = 0; index < len; index += 1) {
        const atIndex: SpinalDateValue = instanceTest.get(index);
        assert.strictEqual(instanceGet.date[index], atIndex.date);
        assert.strictEqual(instanceGet.value[index], atIndex.value);
      }
    });
  });
});
