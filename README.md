# spinal-model-timeseries

Model + service to store values in time to an BmsEndpoint Node.
The value will be sorted by time etc...

doc/api : https://spinalcom.github.io/spinal-model-timeseries/

### Exemple to get the mean / max of last hours

```ts
const spinalServiceTimeseries = new SpinalServiceTimeseries();
const dateInter = spinalServiceTimeseries.getDateFromLastHours(1);
const mean = await spinalServiceTimeseries.getMean(endpointNodeId, dateInter);
const max = await spinalServiceTimeseries.getMax(endpointNodeId, dateInter);
```

_/!\ SpinalServiceTimeseries is suposed to have only one instance running_

## Some usefull method of the `SpinalServiceTimeseries`

### Add data to an Endpoint

```ts
pushFromEndpoint(endpointNodeId: EndpointId, value: number | boolean): Promise<boolean>;
insertFromEndpoint(endpointNodeId: EndpointId, value: number | boolean, date: number | string | Date): Promise<boolean>;
```

A pushed value is dated when `pushFromEndpoint` (or `SpinalTimeSeries.push`) is
called, not when it is stored : finding the timeseries or loading the archive
of the day can wait for the hub, and the value keeps its time. A value measured
earlier can be pushed with its own date : `timeseries.push(value, date)`.
Concurrent calls for an endpoint without timeseries create a single one.

### Get Date Interface

```ts
getDateFromLastHours(numberOfHours?: number): TimeSeriesIntervalDate;
getDateFromLastDays(numberOfDays?: number): TimeSeriesIntervalDate;
```

### Get Data using the Date Interface

```ts
getData(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<SpinalDateValue[]>;
getMean(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
getMax(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
getMin(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
getSum(endpointNodeId: EndpointId, timeSeriesIntervalDate: TimeSeriesIntervalDate): Promise<number>;
```

Reading an interval loads its days a few at a time, the next ones while one is
read, instead of one round trip to the hub per day :
`SpinalTimeSeriesArchive.loadAhead` days at once (8 by default). More is faster
on long intervals, but the hub sends them in one answer, that the program
handles at once.

### Misaligned archives

The archive keeps the dates of its days (`lstDate`) and the days (`lstItem`) in
two lists, that the hub stores apart. A write of one of them lost (a program
that stops while sending, a hub that restarts) leaves them misaligned : a date
pointing to another day, or to none. The reads, the pushes and the inserts on
such an archive rebuild `lstDate` from the day each archive of `lstItem` holds
(`dateDay`), and log it : `[spinal-model-timeseries] timeseries archive ...: 27
dates for 25 days, the dates were rebuilt from the days`. The purge waits until
the lists are aligned again. `archive.realign()` does it on demand.
