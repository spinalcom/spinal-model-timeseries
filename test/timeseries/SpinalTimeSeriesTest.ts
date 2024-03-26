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

import * as tk from 'timekeeper';
tk.freeze(1546532599592);

import { testData, NBR_DAYS } from './testData';
import * as assert from 'assert';
import { SpinalTimeSeries, SpinalDateValue } from '../../src';

describe('SpinalTimeSeries', () => {
  let instanceTest: SpinalTimeSeries;
  describe('test on construnctor', () => {
    it('Create with initilzed value', () => {
      instanceTest = new SpinalTimeSeries();
    });
  });

  describe('push / get Datas', () => {
    it('create data from testData', async () => {
      for (let index = 0; index < testData.length; index += 1) {
        const element = testData[index];
        const dateKeys = element.date.keys();
        const valueKeys = element.value.keys();
        let date = dateKeys.next();
        let value = valueKeys.next();
        for (
          ;
          date.done === false;
          date = dateKeys.next(), value = valueKeys.next()
        ) {
          tk.travel(element.date[date.value]);
          await instanceTest.push(element.value[value.value]);
        }
      }
    });

    it('test nbr days pushed', async () => {
      const archive = await instanceTest.getArchive();
      assert.strictEqual(archive.getDates().get().length, 2);
    });

    it('test if data push are right', async () => {
      const reverse = testData.reverse();
      for (let idx = 0; idx < reverse.length && idx < 2; idx++) {
        const element = reverse[idx];
        const dateStart = element.date[0];
        const dateEnd = element.date[element.date.length - 1];
        const datas = await instanceTest.getFromIntervalTime(
          dateStart,
          dateEnd
        );
        assert.strictEqual(datas.length, element.date.length, 'meh');
        assert.strictEqual(datas.length, element.value.length);
        assert.deepStrictEqual(
          datas.map((e) => e.date),
          element.date
        );
      }
    });
    it('test if get timeseries from interval works', async() => {
      const sample = testData[0];
      const datas = await instanceTest.getFromIntervalTime(
        sample.date[0],
        sample.date[sample.date.length -1]
      );
      const datas2 = await instanceTest.getFromIntervalTime(
        sample.date[1],
        sample.date[sample.date.length -1]
      );

      const datas3 = await instanceTest.getFromIntervalTime(
        sample.date[2],
        sample.date[sample.date.length -1],
        true
      );
      assert.strictEqual(datas.length, sample.date.length);
      assert.strictEqual(datas2.length, sample.date.length-1);
      assert.strictEqual(datas3.length, sample.date.length-1);
    });
    it('test get last 24h', async () => {
      // At this point current Date is 1546446199596
      const datas: AsyncIterableIterator<SpinalDateValue> =
        await instanceTest.getDataFromLast24Hours();
      let size = 0;
      for await (const data of datas) {
        size += 1;
      }
      assert.strictEqual(size, 6); // 5 values from today + last value from yesterday
    });
  });
  describe('test set maxday = 0', () => {
    it('set old instance with config new maxDay', () => {
      instanceTest.setConfig(500, 0);
    });
    it('test get last 24h should stay at 10', async () => {
      const datas: AsyncIterableIterator<SpinalDateValue> =
        await instanceTest.getDataFromLast24Hours();
      let size = 0;
      for await (const data of datas) {
        size += 1;
      }
      assert.strictEqual(size, 6);
    });
    it('push a data', async () => {
      tk.travel(Date.now() + 50);
      await instanceTest.push(42);
    });
    it('test get last 24h now should equal 0', async () => {
      const datas: AsyncIterableIterator<SpinalDateValue> =
        await instanceTest.getDataFromLast24Hours();
      const n = await datas.next();
      assert.strictEqual(n.done, true);
    });
  });
});
