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
import { Model, Ptr } from 'spinal-core-connectorjs';
import { SpinalGraph } from 'spinal-model-graph';
import { SpinalGraphService } from 'spinal-env-viewer-graph-service';
import {
  SpinalServiceTimeseries,
  SpinalTimeSeries,
  SpinalTimeSeriesArchive,
  SpinalTimeSeriesArchiveDay,
} from '../../src';

// the time the other test files freeze at
const T0 = 1546532599592;

/** a timeseries whose archive answers late, like a hub that does not answer */
async function withSlowArchive(ts: SpinalTimeSeries): Promise<SpinalTimeSeriesArchive> {
  const archive = await ts.getArchive();
  ts.archiveProm = new Promise((resolve) => setTimeout(() => resolve(archive), 20));
  (<any>ts).dayCache = null;
  return archive;
}

describe('SpinalTimeSeries push date', () => {
  after(() => tk.freeze(T0));

  it('keeps the time push is called at, while the archive loads', async () => {
    tk.freeze(T0);
    const ts = new SpinalTimeSeries();
    await withSlowArchive(ts);
    const pushed = ts.push(42);
    // a minute later the archive arrives
    tk.freeze(T0 + 60000);
    await pushed;
    const points = await ts.getFromIntervalTime(T0 - 1, T0 + 120000);
    assert.deepStrictEqual(points.map((p) => [p.date, p.value]), [[T0, 42]]);
  });

  it('stores a push called before midnight in that day, even after midnight', async () => {
    const beforeMidnight = new Date(T0).setUTCHours(23, 59, 59, 900);
    tk.freeze(beforeMidnight);
    const ts = new SpinalTimeSeries();
    const archive = await withSlowArchive(ts);
    const pushed = ts.push(7);
    tk.freeze(beforeMidnight + 200);
    await pushed;
    const day = await archive.getArchiveAtDate(beforeMidnight);
    assert.strictEqual(day.length.get(), 1);
    assert.deepStrictEqual(day.get(0), { date: beforeMidnight, value: 7 });
    assert.strictEqual(archive.dateExist(beforeMidnight + 200), false);
  });

  it('puts a value older than the last one stored at its place', () => {
    tk.freeze(T0);
    const day = new SpinalTimeSeriesArchiveDay();
    day.push(1, T0 + 2000);
    day.push(2, T0 + 1000);
    day.push(3, T0 + 3000);
    const { date, value } = <{ date: Float64Array; value: Float64Array }>(<unknown>day.get());
    assert.deepStrictEqual(Array.from(date), [T0 + 1000, T0 + 2000, T0 + 3000]);
    assert.deepStrictEqual(Array.from(value), [2, 1, 3]);
  });

  it('pushes the values of concurrent calls to the same timeseries', async () => {
    tk.freeze(T0);
    await SpinalGraphService.setGraph(new SpinalGraph('graph'));
    const endpointId = SpinalGraphService.createNode({ name: 'endpoint', type: 'BmsEndpoint' }, new Model());
    const service = new SpinalServiceTimeseries();
    const pushed = await Promise.all([1, 2, 3, 4, 5].map((v) => service.pushFromEndpoint(endpointId, v)));
    assert.deepStrictEqual(pushed, [true, true, true, true, true]);
    const children = await SpinalGraphService.getChildren(endpointId, [SpinalTimeSeries.relationName]);
    assert.strictEqual(children.length, 1, 'one timeseries for the endpoint');
    const ts = <SpinalTimeSeries>await children[0].element.load();
    const points = await ts.getFromIntervalTime(T0 - 1, T0 + 1);
    assert.deepStrictEqual(points.map((p) => p.value).sort(), [1, 2, 3, 4, 5]);
  });
});

describe('SpinalTimeSeriesArchive reads', () => {
  const DAY = 86400000;
  const D0 = Date.UTC(2026, 0, 1);
  after(() => tk.freeze(T0));

  /** an archive whose list of days is unsorted, with a date listed twice */
  function legacyArchive(): SpinalTimeSeriesArchive {
    const archive = new SpinalTimeSeriesArchive();
    const day = (d: number, values: number[]) => {
      const archiveDay = new SpinalTimeSeriesArchiveDay();
      archiveDay.dateDay.set(D0 + d * DAY);
      values.forEach((v, i) => archiveDay.insert(v, D0 + d * DAY + (i + 1) * 1000));
      return archiveDay;
    };
    for (const [d, values] of <[number, number[]][]>[[3, [30, 31]], [1, [10]], [5, [50]], [3, [99]], [2, [20]]]) {
      (<any>archive).lstDate.push(D0 + d * DAY);
      (<any>archive).lstItem.push(new Ptr(day(d, values)));
    }
    return archive;
  }

  it('reads the days in the order of the list, a date listed twice from its first archive', async () => {
    const archive = legacyArchive();
    const values = (await archive.getFromIntervalTime(D0, D0 + 10 * DAY)).map((v) => v.value);
    // the reading stops at the first value past the end : in list order, nothing stops here
    assert.deepStrictEqual(values, [30, 31, 10, 50, 30, 31, 20]);
    // day 5 comes before day 2 in the list : the reading stops there
    const untilDay4 = (await archive.getFromIntervalTime(D0, D0 + 4 * DAY)).map((v) => v.value);
    assert.deepStrictEqual(untilDay4, [30, 31, 10]);
  });

  it('returns the same values as an array and as a generator', async () => {
    tk.freeze(T0);
    const ts = new SpinalTimeSeries(10, -1);
    for (let i = 0; i < 300; i++) await ts.insert(i, T0 - 10 * DAY + i * 2900000);
    const archive = await ts.getArchive();
    for (const [start, end, last] of <[number, number, boolean][]>[
      [T0 - 9 * DAY, T0 - 3 * DAY, false],
      [T0 - 9 * DAY + 123, T0, true],
      [T0 - 20 * DAY, T0 + DAY, true],
    ]) {
      const array = await archive.getFromIntervalTime(start, end, last);
      const generated = [];
      for await (const value of archive.getFromIntervalTimeGen(start, end, last)) generated.push(value);
      assert.deepStrictEqual(array, generated);
      assert.ok(array.length > 0);
    }
  });
});
