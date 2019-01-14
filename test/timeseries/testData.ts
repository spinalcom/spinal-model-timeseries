import {
  SpinalDateValueArray as SDVA,
} from '../../dist/timeseries/SpinalTimeSeries';

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
  date: Float64Array;
  value: Float64Array;
  constructor(dateDay: number, date: Float64Array, value: Float64Array) {
    this.dateDay = dateDay;
    this.date = date;
    this.value = value;
  }
}

const testData: SpinalDateValueArray[] = [];
for (let index = 0; index < days.length; index += 1) {
  const day = days[index];
  testData.push(new SpinalDateValueArray(
    new Date(day).setHours(0, 0, 0, 0),
    Float64Array.from([day, day + 1, day + 2, day + 3, day + 4]),
    Float64Array.from([0, 1, 2, 3, 4]),
    ));
}

export { testData, NBR_DAYS };
