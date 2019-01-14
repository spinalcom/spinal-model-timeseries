import {
  SpinalTimeSeries,
  SpinalDateValue,
} from '../../dist/timeseries/SpinalTimeSeries';

import * as tk from 'timekeeper';
tk.freeze(1546532599592);

import { testData, NBR_DAYS } from './testData';
import * as assert from 'assert';

describe('SpinalTimeSeries', () => {
  let instanceTest: SpinalTimeSeries;
  describe('test on construnctor',  () => {

    it('Create with initilzed value', () => {
      instanceTest = new SpinalTimeSeries();
    });
  });

  describe('push / get Datas',  () => {

    it('create data from testData', async () => {
      for (let index = 0; index < testData.length; index += 1) {
        const element = testData[index];
        const dateKeys = element.date.keys();
        const valueKeys = element.value.keys();
        let date = dateKeys.next();
        let value = valueKeys.next();
        for (;
          date.done === false;
          date = dateKeys.next(), value = valueKeys.next()
          ) {
          tk.travel(element.date[date.value]);
          await instanceTest.push(element.value[value.value]);
        }
      }
    });
    it('test if data push are right', async () => {
      const archive = await instanceTest.getArchive();
      assert(archive.getDates().get().length === NBR_DAYS);
      const farInTheFuture = 2546532599592;
      const datas = await instanceTest.getFromIntervalTime(0, farInTheFuture);
      let size = 0;
      for (const data of testData) {
        size += data.date.length;
      }
      assert(datas.length === size);
    });
    it('test get last 24h', async () => {
      const datas :AsyncIterableIterator<SpinalDateValue> =
        await instanceTest.getDataFromLast24Hours();
      let size = 0;
      for await (const data of datas) {
        size += 1;
      }
      assert(size === 6);
    });
  });

});
