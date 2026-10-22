/*
 * Copyright 2026 SpinalCom - www.spinalcom.com
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
import * as assert from 'assert';
import { Ptr } from 'spinal-core-connectorjs';
import {
  SpinalTimeSeries,
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
} from '../../src';

// the time the other test files freeze at
const T0 = 1546532599592;
const DAY = 86400000;
const D0 = Date.UTC(2026, 0, 1);

/** the archive of day d, holding a value d * 10 + i at the second i + 1 */
function day(d: number, count = 2): SpinalTimeSeriesArchiveDay {
  const archiveDay = new SpinalTimeSeriesArchiveDay();
  archiveDay.dateDay.set(D0 + d * DAY);
  for (let i = 0; i < count; i++) archiveDay.insert(d * 10 + i, D0 + d * DAY + (i + 1) * 1000);
  return archiveDay;
}

/** an archive whose lists hold these dates and these days, as the hub may store them */
function archiveOf(dates: number[], days: number[]): SpinalTimeSeriesArchive {
  const archive = new SpinalTimeSeriesArchive();
  for (const d of dates) (<any>archive).lstDate.push(D0 + d * DAY);
  for (const d of days) (<any>archive).lstItem.push(new Ptr(day(d)));
  return archive;
}

function datesOf(archive: SpinalTimeSeriesArchive): number[] {
  const dates = [];
  for (let i = 0; i < archive.getDates().length; i++) dates.push((archive.getDates()[i].get() - D0) / DAY);
  return dates;
}

describe('SpinalTimeSeriesArchive misaligned lists', () => {
  let warnings: string[];
  const warn = console.warn;
  beforeEach(() => {
    warnings = [];
    console.warn = (message: string) => warnings.push(message);
  });
  afterEach(() => {
    console.warn = warn;
  });
  after(() => tk.freeze(T0));

  it('reads the days of the archives when lstDate has dates without archive before them', async () => {
    // the purge of the 2 oldest days reached lstItem, not lstDate
    const archive = archiveOf([1, 2, 3, 4, 5], [3, 4, 5]);
    const values = await archive.getFromIntervalTime(D0, D0 + 10 * DAY);
    assert.deepStrictEqual(values.map((v) => v.value), [30, 31, 40, 41, 50, 51]);
    assert.deepStrictEqual(datesOf(archive), [3, 4, 5]);
    assert.strictEqual(warnings.length, 1);
    assert.match(warnings[0], /5 dates for 3 days/);
  });

  it('reads a day whose date is missing from lstDate', async () => {
    const archive = archiveOf([1, 3], [1, 2, 3]);
    const values = await archive.getFromIntervalTime(D0 + 2 * DAY, D0 + 2 * DAY + 5000);
    assert.deepStrictEqual(values.map((v) => v.value), [20, 21]);
    assert.deepStrictEqual(datesOf(archive), [1, 2, 3]);
  });

  it('reads through the generator', async () => {
    const archive = archiveOf([0, 1, 2, 3, 4], [2, 3, 4]);
    const values = [];
    for await (const v of archive.getFromIntervalTimeGen(D0 + 3 * DAY, D0 + 10 * DAY, true)) values.push(v.value);
    assert.deepStrictEqual(values, [21, 30, 31, 40, 41]);
  });

  it('pushes in the archive of the day, without creating another one', async () => {
    tk.freeze(D0 + 5 * DAY + 10000);
    const ts = new SpinalTimeSeries(50, -1);
    const archive = await ts.getArchive();
    for (const d of [1, 2, 3]) (<any>archive).lstDate.push(D0 + d * DAY);
    for (const d of [3, 4, 5]) (<any>archive).lstItem.push(new Ptr(day(d)));
    (<any>archive).lstDate.push(D0 + 4 * DAY, D0 + 5 * DAY);
    // 5 dates, 3 days : the day 5 is found at the index of day 3
    await ts.push(99);
    assert.deepStrictEqual(datesOf(archive), [3, 4, 5]);
    const today = await archive.getArchiveAtDate(D0 + 5 * DAY);
    assert.strictEqual(today.dateDay.get(), D0 + 5 * DAY);
    assert.deepStrictEqual(Array.from((<any>today.get()).value), [50, 51, 99]);
  });

  it('finds the day of a date when the lists have the same length but are shifted', async () => {
    // a date lost, then a day without date : same lengths, every date after is one day off
    const archive = archiveOf([1, 3, 4, 4], [1, 2, 3, 4]);
    const second = await archive.getArchiveAtDate(D0 + 3 * DAY);
    assert.strictEqual(second.dateDay.get(), D0 + 3 * DAY);
    assert.deepStrictEqual(datesOf(archive), [1, 2, 3, 4]);
    const values = await archive.getFromIntervalTime(D0 + 2 * DAY, D0 + 2 * DAY + 5000);
    assert.deepStrictEqual(values.map((v) => v.value), [20, 21]);
  });

  it('reads again an interval whose day turned out to be another one', async () => {
    const archive = archiveOf([1, 2, 3], [1, 3, 2]);
    const values = await archive.getFromIntervalTime(D0, D0 + 10 * DAY);
    // the list order is kept
    assert.deepStrictEqual(values.map((v) => v.value), [10, 11, 30, 31, 20, 21]);
    assert.deepStrictEqual(datesOf(archive), [1, 3, 2]);
  });

  it('drops the empty pointers of lstItem', async () => {
    const archive = archiveOf([1, 2], [1]);
    (<any>archive).lstItem.push(new Ptr(0));
    (<any>archive).lstItem.push(new Ptr(day(3)));
    await archive.realign();
    assert.deepStrictEqual(datesOf(archive), [1, 3]);
    assert.strictEqual((<any>archive).lstItem.length, 2);
  });

  it('does not purge while the lists are misaligned', () => {
    tk.freeze(D0 + 10 * DAY);
    const archive = archiveOf([1, 2, 3, 4], [3, 4]);
    archive.purgeArchive(8);
    assert.deepStrictEqual(datesOf(archive), [1, 2, 3, 4]);
    assert.strictEqual((<any>archive).lstItem.length, 2);
  });

  it('rebuilds once for concurrent calls', async () => {
    const archive = archiveOf([0, 1, 2], [1, 2]);
    const reads = await Promise.all([
      archive.getFromIntervalTime(D0, D0 + 10 * DAY),
      archive.getArchiveAtDate(D0 + DAY),
      archive.getOrCreateArchiveAtDate(D0 + 2 * DAY),
    ]);
    assert.deepStrictEqual(reads[0].map((v) => v.value), [10, 11, 20, 21]);
    assert.strictEqual(reads[1].dateDay.get(), D0 + DAY);
    assert.strictEqual(reads[2].dateDay.get(), D0 + 2 * DAY);
    assert.strictEqual(warnings.length, 1);
  });

  it('leaves aligned lists alone', async () => {
    const archive = archiveOf([1, 2, 3], [1, 2, 3]);
    await archive.getFromIntervalTime(D0, D0 + 10 * DAY);
    await archive.getArchiveAtDate(D0 + 2 * DAY);
    assert.strictEqual(warnings.length, 0);
  });
});
