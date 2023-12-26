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

import {
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
} from 'spinal-model-timeseries';

import * as tk from 'timekeeper';
tk.freeze(1546532599592);

import * as assert from 'assert';

describe('SpinalTimeSeriesArchive', () => {
  let instanceTest: SpinalTimeSeriesArchive;
  describe('test on construnctor', () => {
    it('Create with initilzed value', () => {
      instanceTest = new SpinalTimeSeriesArchive();
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();

      assert.strictEqual(instanceTest.initialBlockSize.get(), 50);
      assert.strictEqual(dates.length, 0);
    });

    it('Set the "buffer" size manualy', () => {
      instanceTest = new SpinalTimeSeriesArchive(2);
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();

      assert.strictEqual(instanceTest.initialBlockSize.get(), 2);
      assert.strictEqual(dates.length, 0);
    });
  });

  describe('test on create SpinalTimeSeriesArchiveDay', () => {
    it('Create today archive', async () => {
      await instanceTest.getTodayArchive();
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();
      assert.strictEqual(dates.length, 1);
    });
    it('Calling again should not create a new ArchiveDay', async () => {
      await instanceTest.getTodayArchive();
      const dates: spinal.Lst<spinal.Val> = instanceTest.getDates();
      assert.strictEqual(dates.length, 1);
    });
    it('ArchiveDay initial buffer size ', async () => {
      const today: SpinalTimeSeriesArchiveDay =
        await instanceTest.getTodayArchive();
      assert.strictEqual(
        today.getActualBufferSize(),
        instanceTest.initialBlockSize.get()
      );
    });

    it('jump to tomorow create automatically a new SpinalTimeSeriesArchiveDay', async () => {
      const tomorowDate = new Date();
      tomorowDate.setDate(tomorowDate.getDate() + 1);
      tk.travel(tomorowDate);
      await instanceTest.getTodayArchive();
      assert.strictEqual(instanceTest.getDates().length, 2);
    });

    it('test async getOrCreateArchiveAtDate to an existing date', async () => {
      const todayDate = new Date();
      await instanceTest.getOrCreateArchiveAtDate(todayDate);
      assert.strictEqual(instanceTest.getDates().length, 2);
    });
    it('test async getOrCreateArchiveAtDate put error in date (invalid string)', async () => {
      assert.throws(() => {
        instanceTest.getOrCreateArchiveAtDate('sahbdbsakbdkjsab');
      }, 'it should throw');
    });

    it('test async getOrCreateArchiveAtDate put error in date (NaN)', async () => {
      assert.throws(() => {
        instanceTest.getOrCreateArchiveAtDate(NaN);
      }, 'it should throw');
    });
    it('test async getOrCreateArchiveAtDate auto clean up NaN date', async () => {
      // // to test it remove the if isNan in getOrCreateArchiveAtDate
      assert.strictEqual(instanceTest.getDates().length, 2);
    });
  });
});
