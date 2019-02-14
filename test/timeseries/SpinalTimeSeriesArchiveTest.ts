
import {
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
} from '../../dist/timeseries/SpinalTimeSeries';

import * as tk from 'timekeeper';
tk.freeze(1546532599592);

import * as assert from 'assert';

describe('SpinalTimeSeriesArchive', () => {
  let instanceTest: SpinalTimeSeriesArchive;
  describe('test on construnctor',  () => {

    it('Create with initilzed value', () => {
      instanceTest = new SpinalTimeSeriesArchive();
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();

      assert(instanceTest.initialBlockSize.get() === 50);
      assert(dates.length === 0);
    });

    it('Set the "buffer" size manualy', () => {
      instanceTest = new SpinalTimeSeriesArchive(2);
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();

      assert(instanceTest.initialBlockSize.get() === 2);
      assert(dates.length === 0);
    });
  });

  describe('test on create SpinalTimeSeriesArchiveDay',  () => {
    it('Create today archive', async () => {
      await instanceTest.getTodayArchive();
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();
      assert(dates.length === 1);
    });
    it('Calling again should not create a new ArchiveDay', async () => {
      await instanceTest.getTodayArchive();
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();
      assert(dates.length === 1);
    });
    it('ArchiveDay initial buffer size ', async () => {
      const today: SpinalTimeSeriesArchiveDay = await instanceTest.getTodayArchive();
      assert(today.getActualBufferSize() === instanceTest.initialBlockSize.get());
    });

    it('jump to tomorow create automatically a new SpinalTimeSeriesArchiveDay', async () => {
      const tomorowDate = new Date();
      tomorowDate.setDate(tomorowDate.getDate() + 1);
      tk.travel(tomorowDate);
      await instanceTest.getTodayArchive();
      assert(instanceTest.getDates().length === 2);
    });

    it('test async getOrCreateArchiveAtDate', async () => {
      const test = [instanceTest.getTodayArchive(), instanceTest.getTodayArchive()];
      const res = await Promise.all(test);
      assert(res[0].model_id === res[1].model_id);
    });

  });
});
