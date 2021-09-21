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

import { SpinalDateValueArray as SDVA } from '../../src';

function createDay(dayToRemove: number) {
  const day = new Date();
  return day.setDate(day.getDate() - dayToRemove);
}
const days = [];
let index: number;
for (index = 0; index < 8; index += 1) {
  days.push(createDay(8 - index));
}
const NBR_DAYS = index;
class SpinalDateValueArray implements SDVA {
  dateDay: number;
  date: number[];
  value: number[];
  constructor(dateDay: number, date: number[], value: number[]) {
    this.dateDay = dateDay;
    this.date = date;
    this.value = value;
  }
}

const testData: SpinalDateValueArray[] = [];
for (let index = 0; index < days.length; index += 1) {
  const day = days[index];
  testData.push(
    new SpinalDateValueArray(
      new Date(day).setHours(0, 0, 0, 0),
      Array.from([day, day + 1, day + 2, day + 3, day + 4]),
      Array.from([0, 1, 2, 3, 4])
    )
  );
}

export { testData, NBR_DAYS };
