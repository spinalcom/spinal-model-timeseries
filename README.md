# spinal-model-timeseries

Model + service to store values in time to an BmsEndpoint Node.
The value will be sorted by time etc...

doc/api : https://spinalcom.github.io/spinal-model-timeseries/

### Exemple to get the mean of last hours
```ts
const SpinalServiceTimeseries = new SpinalServiceTimeseries()
await spinalServiceTimeseries.getMean( endpointNodeId, getDateFromLastHours(1) );
```

## Some usefull method of the `SpinalServiceTimeseries`
### Add data to an Endpoint
```ts
pushFromEndpoint(endpointNodeId: EndpointId, value: number | boolean): Promise<boolean>;
insertFromEndpoint(endpointNodeId: EndpointId, value: number | boolean, date: number | string | Date): Promise<boolean>;
```
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

