<!-- DO NOT EDIT README.md (It will be overridden by README.hbs) -->

# spinal-model-timeseries

Model + service to store values in time to an BmsEndpoint Node.
The value will be sorted by time etc...

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Description](#description)
- [API](#api)
  - [Interface](#interface)
    - [SpinalDateValue](#spinaldatevalue)
    - [SpinalDateValueArray](#spinaldatevaluearray)
  - [Classes](#classes)
  - [Functions](#functions)
  - [SpinalServiceTimeseries](#spinalservicetimeseries)
    - [spinalServiceTimeseries.pushFromEndpoint(endpointNodeId, value) ⇒ <code>Promise.&lt;boolean&gt;</code>](#spinalservicetimeseriespushfromendpointendpointnodeid-value-%E2%87%92-codepromiseltbooleangtcode)
    - [spinalServiceTimeseries.insertFromEndpoint(endpointNodeId, value, date) ⇒ <code>Promise.&lt;boolean&gt;</code>](#spinalservicetimeseriesinsertfromendpointendpointnodeid-value-date-%E2%87%92-codepromiseltbooleangtcode)
    - [spinalServiceTimeseries.hasTimeSeries(endpointNodeId) ⇒ <code>Promise.&lt;boolean&gt;</code>](#spinalservicetimeserieshastimeseriesendpointnodeid-%E2%87%92-codepromiseltbooleangtcode)
    - [spinalServiceTimeseries.getOrCreateTimeSeries(endpointNodeId) ⇒ <code>Promise.&lt;SpinalTimeSeries&gt;</code>](#spinalservicetimeseriesgetorcreatetimeseriesendpointnodeid-%E2%87%92-codepromiseltspinaltimeseriesgtcode)
    - [spinalServiceTimeseries.getCurrent(timeseries) ⇒ <code>Promise.&lt;SpinalDateValue&gt;</code>](#spinalservicetimeseriesgetcurrenttimeseries-%E2%87%92-codepromiseltspinaldatevaluegtcode)
    - [spinalServiceTimeseries.getDataFromLast24Hours(timeseries) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinalservicetimeseriesgetdatafromlast24hourstimeseries-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [spinalServiceTimeseries.getDataFromLastHours(timeseries, [numberOfHours]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinalservicetimeseriesgetdatafromlasthourstimeseries-numberofhours-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [spinalServiceTimeseries.getDataFromYesterday(timeseries) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinalservicetimeseriesgetdatafromyesterdaytimeseries-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [spinalServiceTimeseries.getFromIntervalTime(timeseries, [start], [end]) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>](#spinalservicetimeseriesgetfromintervaltimetimeseries-start-end-%E2%87%92-codepromiseltarrayltspinaldatevaluegtgtcode)
    - [spinalServiceTimeseries.getFromIntervalTimeGen(timeseries, [start], [end]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinalservicetimeseriesgetfromintervaltimegentimeseries-start-end-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [SpinalServiceTimeseries.SpinalServiceTimeseries](#spinalservicetimeseriesspinalservicetimeseries)
      - [new SpinalServiceTimeseries()](#new-spinalservicetimeseries)
  - [SpinalTimeSeries ⇐ <code>Model</code>](#spinaltimeseries-%E2%87%90-codemodelcode)
    - [SpinalTimeSeriesgetDataFromLastDays() ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinaltimeseriesgetdatafromlastdays-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [spinalTimeSeries.getFromIntervalTimeGen([start], [end]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinaltimeseriesgetfromintervaltimegenstart-end-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [spinalTimeSeries.getFromIntervalTime([start], [end]) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>](#spinaltimeseriesgetfromintervaltimestart-end-%E2%87%92-codepromiseltarrayltspinaldatevaluegtgtcode)
    - [spinalTimeSeries.getCurrent() ⇒ <code>Promise.&lt;SpinalDateValue&gt;</code>](#spinaltimeseriesgetcurrent-%E2%87%92-codepromiseltspinaldatevaluegtcode)
    - [spinalTimeSeries.push(value) ⇒ <code>Promise.&lt;void&gt;</code>](#spinaltimeseriespushvalue-%E2%87%92-codepromiseltvoidgtcode)
    - [spinalTimeSeries.insert(value) ⇒ <code>Promise.&lt;void&gt;</code>](#spinaltimeseriesinsertvalue-%E2%87%92-codepromiseltvoidgtcode)
    - [spinalTimeSeries.getDataOfDay(date) ⇒ <code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#spinaltimeseriesgetdataofdaydate-%E2%87%92-codepromiseltspinaltimeseriesarchivedaygtcode)
    - [spinalTimeSeries.loadPtr(ptr) ⇒ <code>Promise.&lt;(SpinalTimeSeriesArchiveDay\|SpinalTimeSeriesArchive)&gt;</code>](#spinaltimeseriesloadptrptr-%E2%87%92-codepromiseltspinaltimeseriesarchiveday%5Cspinaltimeseriesarchivegtcode)
    - [spinalTimeSeries.getArchive() ⇒ <code>Promise.&lt;SpinalTimeSeriesArchive&gt;</code>](#spinaltimeseriesgetarchive-%E2%87%92-codepromiseltspinaltimeseriesarchivegtcode)
    - [spinalTimeSeries.getCurrentDay() ⇒ <code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#spinaltimeseriesgetcurrentday-%E2%87%92-codepromiseltspinaltimeseriesarchivedaygtcode)
    - [spinalTimeSeries.getDataFromYesterday() ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinaltimeseriesgetdatafromyesterday-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [spinalTimeSeries.getDataFromLastHours([numberOfHours]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinaltimeseriesgetdatafromlasthoursnumberofhours-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [spinalTimeSeries.getDataFromLastDays([numberOfDays]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>](#spinaltimeseriesgetdatafromlastdaysnumberofdays-%E2%87%92-codepromiseltasynciterableiteratorltspinaldatevaluegtgtcode)
    - [SpinalTimeSeries.SpinalTimeSeries](#spinaltimeseriesspinaltimeseries)
      - [new SpinalTimeSeries()](#new-spinaltimeseries)
  - [SpinalTimeSeriesArchive ⇐ <code>Model</code>](#spinaltimeseriesarchive-%E2%87%90-codemodelcode)
    - [spinalTimeSeriesArchive.getTodayArchive() ⇒ <code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#spinaltimeseriesarchivegettodayarchive-%E2%87%92-codepromiseltspinaltimeseriesarchivedaygtcode)
    - [spinalTimeSeriesArchive.getOrCreateArchiveAtDate() ⇒ <code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#spinaltimeseriesarchivegetorcreatearchiveatdate-%E2%87%92-codepromiseltspinaltimeseriesarchivedaygtcode)
    - [spinalTimeSeriesArchive.getFromIntervalTimeGen([start], [end]) ⇒ <code>AsyncIterableIterator.&lt;SpinalDateValue&gt;</code>](#spinaltimeseriesarchivegetfromintervaltimegenstart-end-%E2%87%92-codeasynciterableiteratorltspinaldatevaluegtcode)
    - [spinalTimeSeriesArchive.getFromIntervalTime(start, [end]) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>](#spinaltimeseriesarchivegetfromintervaltimestart-end-%E2%87%92-codepromiseltarrayltspinaldatevaluegtgtcode)
    - [spinalTimeSeriesArchive.getArchiveAtDate(date) ⇒ <code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#spinaltimeseriesarchivegetarchiveatdatedate-%E2%87%92-codepromiseltspinaltimeseriesarchivedaygtcode)
    - [spinalTimeSeriesArchive.getDates() ⇒ <code>spinal.Lst.&lt;spinal.Val&gt;</code>](#spinaltimeseriesarchivegetdates-%E2%87%92-codespinallstltspinalvalgtcode)
    - [spinalTimeSeriesArchive.dateExist(date) ⇒ <code>boolean</code>](#spinaltimeseriesarchivedateexistdate-%E2%87%92-codebooleancode)
    - [SpinalTimeSeriesArchive.SpinalTimeSeriesArchive](#spinaltimeseriesarchivespinaltimeseriesarchive)
      - [new SpinalTimeSeriesArchive([initialBlockSize])](#new-spinaltimeseriesarchiveinitialblocksize)
    - [SpinalTimeSeriesArchive.normalizeDate(date) ⇒ <code>number</code>](#spinaltimeseriesarchivenormalizedatedate-%E2%87%92-codenumbercode)
  - [SpinalTimeSeriesArchiveDay ⇐ <code>Model</code>](#spinaltimeseriesarchiveday-%E2%87%90-codemodelcode)
    - [spinalTimeSeriesArchiveDay.push(data)](#spinaltimeseriesarchivedaypushdata)
    - [spinalTimeSeriesArchiveDay.insert(data, date) ⇒ <code>boolean</code>](#spinaltimeseriesarchivedayinsertdata-date-%E2%87%92-codebooleancode)
    - [spinalTimeSeriesArchiveDay.get([index]) ⇒ <code>SpinalDateValue</code> \| <code>SpinalDateValueArray</code>](#spinaltimeseriesarchivedaygetindex-%E2%87%92-codespinaldatevaluecode-%5C-codespinaldatevaluearraycode)
    - [spinalTimeSeriesArchiveDay.at(index) ⇒ <code>SpinalDateValue</code>](#spinaltimeseriesarchivedayatindex-%E2%87%92-codespinaldatevaluecode)
    - [spinalTimeSeriesArchiveDay.getActualBufferSize()](#spinaltimeseriesarchivedaygetactualbuffersize)
  - [genUID(constructor) ⇒ <code>string</code>](#genuidconstructor-%E2%87%92-codestringcode)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Description

Model + service to store values in time to an BmsEndpoint Node.
The value will be sorted by time etc...


# API

## Interface

<a name="SpinalDateValue"></a>

### SpinalDateValue
**Kind**: interface

| Param | Type |
| --- | --- |
| date | <code>number</code> | 
| value | <code>number</code> | 

<a name="SpinalDateValueArray"></a>

### SpinalDateValueArray
**Kind**: interface

| Param | Type |
| --- | --- |
| dateDay | <code>number</code> | 
| date | <code>Float64Array</code> | 
| value | <code>Float64Array</code> | 


## Classes

<dl>
<dt><a href="#SpinalServiceTimeseries">SpinalServiceTimeseries</a></dt>
<dd></dd>
<dt><a href="#SpinalTimeSeries">SpinalTimeSeries</a> ⇐ <code>Model</code></dt>
<dd></dd>
<dt><a href="#SpinalTimeSeriesArchive">SpinalTimeSeriesArchive</a> ⇐ <code>Model</code></dt>
<dd></dd>
<dt><a href="#SpinalTimeSeriesArchiveDay">SpinalTimeSeriesArchiveDay</a> ⇐ <code>Model</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#genUID">genUID(constructor)</a> ⇒ <code>string</code></dt>
<dd></dd>
</dl>

<a name="SpinalServiceTimeseries"></a>

## SpinalServiceTimeseries
**Kind**: global class  

* [SpinalServiceTimeseries](#SpinalServiceTimeseries)
    * _instance_
        * [.pushFromEndpoint(endpointNodeId, value)](#SpinalServiceTimeseries+pushFromEndpoint) ⇒ <code>Promise.&lt;boolean&gt;</code>
        * [.insertFromEndpoint(endpointNodeId, value, date)](#SpinalServiceTimeseries+insertFromEndpoint) ⇒ <code>Promise.&lt;boolean&gt;</code>
        * [.hasTimeSeries(endpointNodeId)](#SpinalServiceTimeseries+hasTimeSeries) ⇒ <code>Promise.&lt;boolean&gt;</code>
        * [.getOrCreateTimeSeries(endpointNodeId)](#SpinalServiceTimeseries+getOrCreateTimeSeries) ⇒ [<code>Promise.&lt;SpinalTimeSeries&gt;</code>](#SpinalTimeSeries)
        * [.getCurrent(timeseries)](#SpinalServiceTimeseries+getCurrent) ⇒ <code>Promise.&lt;SpinalDateValue&gt;</code>
        * [.getDataFromLast24Hours(timeseries)](#SpinalServiceTimeseries+getDataFromLast24Hours) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getDataFromLastHours(timeseries, [numberOfHours])](#SpinalServiceTimeseries+getDataFromLastHours) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getDataFromYesterday(timeseries)](#SpinalServiceTimeseries+getDataFromYesterday) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getFromIntervalTime(timeseries, [start], [end])](#SpinalServiceTimeseries+getFromIntervalTime) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getFromIntervalTimeGen(timeseries, [start], [end])](#SpinalServiceTimeseries+getFromIntervalTimeGen) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
    * _static_
        * [.SpinalServiceTimeseries](#SpinalServiceTimeseries.SpinalServiceTimeseries)
            * [new SpinalServiceTimeseries()](#new_SpinalServiceTimeseries.SpinalServiceTimeseries_new)

<a name="SpinalServiceTimeseries+pushFromEndpoint"></a>

### spinalServiceTimeseries.pushFromEndpoint(endpointNodeId, value) ⇒ <code>Promise.&lt;boolean&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type |
| --- | --- |
| endpointNodeId | <code>EndpointId</code> | 
| value | <code>number</code> \| <code>boolean</code> | 

<a name="SpinalServiceTimeseries+insertFromEndpoint"></a>

### spinalServiceTimeseries.insertFromEndpoint(endpointNodeId, value, date) ⇒ <code>Promise.&lt;boolean&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type |
| --- | --- |
| endpointNodeId | <code>EndpointId</code> | 
| value | <code>number</code> \| <code>boolean</code> | 
| date | <code>number</code> \| <code>string</code> \| <code>Date</code> | 

<a name="SpinalServiceTimeseries+hasTimeSeries"></a>

### spinalServiceTimeseries.hasTimeSeries(endpointNodeId) ⇒ <code>Promise.&lt;boolean&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type |
| --- | --- |
| endpointNodeId | <code>EndpointId</code> | 

<a name="SpinalServiceTimeseries+getOrCreateTimeSeries"></a>

### spinalServiceTimeseries.getOrCreateTimeSeries(endpointNodeId) ⇒ [<code>Promise.&lt;SpinalTimeSeries&gt;</code>](#SpinalTimeSeries)
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type |
| --- | --- |
| endpointNodeId | <code>EndpointId</code> | 

<a name="SpinalServiceTimeseries+getCurrent"></a>

### spinalServiceTimeseries.getCurrent(timeseries) ⇒ <code>Promise.&lt;SpinalDateValue&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type |
| --- | --- |
| timeseries | [<code>SpinalTimeSeries</code>](#SpinalTimeSeries) | 

<a name="SpinalServiceTimeseries+getDataFromLast24Hours"></a>

### spinalServiceTimeseries.getDataFromLast24Hours(timeseries) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type |
| --- | --- |
| timeseries | [<code>SpinalTimeSeries</code>](#SpinalTimeSeries) | 

<a name="SpinalServiceTimeseries+getDataFromLastHours"></a>

### spinalServiceTimeseries.getDataFromLastHours(timeseries, [numberOfHours]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type | Default |
| --- | --- | --- |
| timeseries | [<code>SpinalTimeSeries</code>](#SpinalTimeSeries) |  | 
| [numberOfHours] | <code>number</code> | <code>1</code> | 

<a name="SpinalServiceTimeseries+getDataFromYesterday"></a>

### spinalServiceTimeseries.getDataFromYesterday(timeseries) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type |
| --- | --- |
| timeseries | [<code>SpinalTimeSeries</code>](#SpinalTimeSeries) | 

<a name="SpinalServiceTimeseries+getFromIntervalTime"></a>

### spinalServiceTimeseries.getFromIntervalTime(timeseries, [start], [end]) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type | Default |
| --- | --- | --- |
| timeseries | [<code>SpinalTimeSeries</code>](#SpinalTimeSeries) |  | 
| [start] | <code>string</code> \| <code>number</code> \| <code>Date</code> | <code>0</code> | 
| [end] | <code>string</code> \| <code>number</code> \| <code>Date</code> | <code>&quot;Date.now()&quot;</code> | 

<a name="SpinalServiceTimeseries+getFromIntervalTimeGen"></a>

### spinalServiceTimeseries.getFromIntervalTimeGen(timeseries, [start], [end]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  

| Param | Type | Default |
| --- | --- | --- |
| timeseries | [<code>SpinalTimeSeries</code>](#SpinalTimeSeries) |  | 
| [start] | <code>string</code> \| <code>number</code> \| <code>Date</code> | <code>0</code> | 
| [end] | <code>string</code> \| <code>number</code> \| <code>Date</code> | <code>&quot;Date.now()&quot;</code> | 

<a name="SpinalServiceTimeseries.SpinalServiceTimeseries"></a>

### SpinalServiceTimeseries.SpinalServiceTimeseries
**Kind**: static class of [<code>SpinalServiceTimeseries</code>](#SpinalServiceTimeseries)  
<a name="new_SpinalServiceTimeseries.SpinalServiceTimeseries_new"></a>

#### new SpinalServiceTimeseries()
<p>Creates an instance of SpinalServiceTimeseries.</p>

<a name="SpinalTimeSeries"></a>

## SpinalTimeSeries ⇐ <code>Model</code>
**Kind**: global class  
**Extends**: <code>Model</code>  
**Properties**

| Name | Type |
| --- | --- |
| id | <code>spinal.Str</code> | 
| archive | [<code>spinal.Ptr.&lt;SpinalTimeSeriesArchive&gt;</code>](#SpinalTimeSeriesArchive) | 
| currentArchive | [<code>spinal.Ptr.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay) | 


* [SpinalTimeSeries](#SpinalTimeSeries) ⇐ <code>Model</code>
    * [getDataFromLastDays()](#getDataFromLastDays(1)) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
    * _instance_
        * [.getFromIntervalTimeGen([start], [end])](#SpinalTimeSeries+getFromIntervalTimeGen) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getFromIntervalTime([start], [end])](#SpinalTimeSeries+getFromIntervalTime) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getCurrent()](#SpinalTimeSeries+getCurrent) ⇒ <code>Promise.&lt;SpinalDateValue&gt;</code>
        * [.push(value)](#SpinalTimeSeries+push) ⇒ <code>Promise.&lt;void&gt;</code>
        * [.insert(value)](#SpinalTimeSeries+insert) ⇒ <code>Promise.&lt;void&gt;</code>
        * [.getDataOfDay(date)](#SpinalTimeSeries+getDataOfDay) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
        * [.loadPtr(ptr)](#SpinalTimeSeries+loadPtr) ⇒ <code>Promise.&lt;(SpinalTimeSeriesArchiveDay\|SpinalTimeSeriesArchive)&gt;</code>
        * [.getArchive()](#SpinalTimeSeries+getArchive) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchive&gt;</code>](#SpinalTimeSeriesArchive)
        * [.getCurrentDay()](#SpinalTimeSeries+getCurrentDay) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
        * [.getDataFromYesterday()](#SpinalTimeSeries+getDataFromYesterday) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getDataFromLastHours([numberOfHours])](#SpinalTimeSeries+getDataFromLastHours) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getDataFromLastDays([numberOfDays])](#SpinalTimeSeries+getDataFromLastDays) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
    * _static_
        * [.SpinalTimeSeries](#SpinalTimeSeries.SpinalTimeSeries)
            * [new SpinalTimeSeries()](#new_SpinalTimeSeries.SpinalTimeSeries_new)

<a name="getDataFromLastDays(1)"></a>

### SpinalTimeSeriesgetDataFromLastDays() ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
<a name="SpinalTimeSeries+getFromIntervalTimeGen"></a>

### spinalTimeSeries.getFromIntervalTimeGen([start], [end]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type | Default |
| --- | --- | --- |
| [start] | <code>number</code> \| <code>string</code> \| <code>Date</code> | <code>0</code> | 
| [end] | <code>number</code> \| <code>string</code> \| <code>Date</code> | <code>Date.now()</code> | 

<a name="SpinalTimeSeries+getFromIntervalTime"></a>

### spinalTimeSeries.getFromIntervalTime([start], [end]) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type | Default |
| --- | --- | --- |
| [start] | <code>number</code> \| <code>string</code> \| <code>Date</code> | <code>0</code> | 
| [end] | <code>number</code> \| <code>string</code> \| <code>Date</code> | <code>Date.now()</code> | 

<a name="SpinalTimeSeries+getCurrent"></a>

### spinalTimeSeries.getCurrent() ⇒ <code>Promise.&lt;SpinalDateValue&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  
<a name="SpinalTimeSeries+push"></a>

### spinalTimeSeries.push(value) ⇒ <code>Promise.&lt;void&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type |
| --- | --- |
| value | <code>number</code> | 

<a name="SpinalTimeSeries+insert"></a>

### spinalTimeSeries.insert(value) ⇒ <code>Promise.&lt;void&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type |
| --- | --- |
| value | <code>number</code> | 

<a name="SpinalTimeSeries+getDataOfDay"></a>

### spinalTimeSeries.getDataOfDay(date) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type |
| --- | --- |
| date | <code>number</code> \| <code>string</code> \| <code>Date</code> | 

<a name="SpinalTimeSeries+loadPtr"></a>

### spinalTimeSeries.loadPtr(ptr) ⇒ <code>Promise.&lt;(SpinalTimeSeriesArchiveDay\|SpinalTimeSeriesArchive)&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type |
| --- | --- |
| ptr | <code>spinal.Ptr.&lt;(SpinalTimeSeriesArchiveDay\|SpinalTimeSeriesArchive)&gt;</code> | 

<a name="SpinalTimeSeries+getArchive"></a>

### spinalTimeSeries.getArchive() ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchive&gt;</code>](#SpinalTimeSeriesArchive)
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  
<a name="SpinalTimeSeries+getCurrentDay"></a>

### spinalTimeSeries.getCurrentDay() ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  
<a name="SpinalTimeSeries+getDataFromYesterday"></a>

### spinalTimeSeries.getDataFromYesterday() ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  
<a name="SpinalTimeSeries+getDataFromLastHours"></a>

### spinalTimeSeries.getDataFromLastHours([numberOfHours]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type | Default |
| --- | --- | --- |
| [numberOfHours] | <code>number</code> | <code>1</code> | 

<a name="SpinalTimeSeries+getDataFromLastDays"></a>

### spinalTimeSeries.getDataFromLastDays([numberOfDays]) ⇒ <code>Promise.&lt;AsyncIterableIterator.&lt;SpinalDateValue&gt;&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  

| Param | Type | Default |
| --- | --- | --- |
| [numberOfDays] | <code>number</code> | <code>1</code> | 

<a name="SpinalTimeSeries.SpinalTimeSeries"></a>

### SpinalTimeSeries.SpinalTimeSeries
**Kind**: static class of [<code>SpinalTimeSeries</code>](#SpinalTimeSeries)  
<a name="new_SpinalTimeSeries.SpinalTimeSeries_new"></a>

#### new SpinalTimeSeries()
<p>Creates an instance of SpinalTimeSeries.</p>

<a name="SpinalTimeSeriesArchive"></a>

## SpinalTimeSeriesArchive ⇐ <code>Model</code>
**Kind**: global class  
**Extends**: <code>Model</code>  

* [SpinalTimeSeriesArchive](#SpinalTimeSeriesArchive) ⇐ <code>Model</code>
    * _instance_
        * [.getTodayArchive()](#SpinalTimeSeriesArchive+getTodayArchive) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
        * [.getOrCreateArchiveAtDate()](#SpinalTimeSeriesArchive+getOrCreateArchiveAtDate) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
        * [.getFromIntervalTimeGen([start], [end])](#SpinalTimeSeriesArchive+getFromIntervalTimeGen) ⇒ <code>AsyncIterableIterator.&lt;SpinalDateValue&gt;</code>
        * [.getFromIntervalTime(start, [end])](#SpinalTimeSeriesArchive+getFromIntervalTime) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>
        * [.getArchiveAtDate(date)](#SpinalTimeSeriesArchive+getArchiveAtDate) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
        * [.getDates()](#SpinalTimeSeriesArchive+getDates) ⇒ <code>spinal.Lst.&lt;spinal.Val&gt;</code>
        * [.dateExist(date)](#SpinalTimeSeriesArchive+dateExist) ⇒ <code>boolean</code>
    * _static_
        * [.SpinalTimeSeriesArchive](#SpinalTimeSeriesArchive.SpinalTimeSeriesArchive)
            * [new SpinalTimeSeriesArchive([initialBlockSize])](#new_SpinalTimeSeriesArchive.SpinalTimeSeriesArchive_new)
        * [.normalizeDate(date)](#SpinalTimeSeriesArchive.normalizeDate) ⇒ <code>number</code>

<a name="SpinalTimeSeriesArchive+getTodayArchive"></a>

### spinalTimeSeriesArchive.getTodayArchive() ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
**Kind**: instance method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  
<a name="SpinalTimeSeriesArchive+getOrCreateArchiveAtDate"></a>

### spinalTimeSeriesArchive.getOrCreateArchiveAtDate() ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
**Kind**: instance method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  
<a name="SpinalTimeSeriesArchive+getFromIntervalTimeGen"></a>

### spinalTimeSeriesArchive.getFromIntervalTimeGen([start], [end]) ⇒ <code>AsyncIterableIterator.&lt;SpinalDateValue&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  

| Param | Type | Default |
| --- | --- | --- |
| [start] | <code>number</code> \| <code>string</code> | <code>0</code> | 
| [end] | <code>number</code> \| <code>string</code> | <code>Date.now()</code> | 

<a name="SpinalTimeSeriesArchive+getFromIntervalTime"></a>

### spinalTimeSeriesArchive.getFromIntervalTime(start, [end]) ⇒ <code>Promise.&lt;Array.&lt;SpinalDateValue&gt;&gt;</code>
<p>getFromIntervalTimeGen is prefered.</p>

**Kind**: instance method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  

| Param | Type | Default |
| --- | --- | --- |
| start | <code>number</code> |  | 
| [end] | <code>number</code> \| <code>string</code> | <code>Date.now()</code> | 

<a name="SpinalTimeSeriesArchive+getArchiveAtDate"></a>

### spinalTimeSeriesArchive.getArchiveAtDate(date) ⇒ [<code>Promise.&lt;SpinalTimeSeriesArchiveDay&gt;</code>](#SpinalTimeSeriesArchiveDay)
**Kind**: instance method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  

| Param | Type |
| --- | --- |
| date | <code>number</code> \| <code>string</code> \| <code>Date</code> | 

<a name="SpinalTimeSeriesArchive+getDates"></a>

### spinalTimeSeriesArchive.getDates() ⇒ <code>spinal.Lst.&lt;spinal.Val&gt;</code>
**Kind**: instance method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  
<a name="SpinalTimeSeriesArchive+dateExist"></a>

### spinalTimeSeriesArchive.dateExist(date) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  

| Param | Type |
| --- | --- |
| date | <code>number</code> \| <code>string</code> \| <code>Date</code> | 

<a name="SpinalTimeSeriesArchive.SpinalTimeSeriesArchive"></a>

### SpinalTimeSeriesArchive.SpinalTimeSeriesArchive
**Kind**: static class of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  
<a name="new_SpinalTimeSeriesArchive.SpinalTimeSeriesArchive_new"></a>

#### new SpinalTimeSeriesArchive([initialBlockSize])
<p>Creates an instance of SpinalTimeSeriesArchive.</p>


| Param | Type | Default |
| --- | --- | --- |
| [initialBlockSize] | <code>number</code> | <code>50</code> | 

<a name="SpinalTimeSeriesArchive.normalizeDate"></a>

### SpinalTimeSeriesArchive.normalizeDate(date) ⇒ <code>number</code>
**Kind**: static method of [<code>SpinalTimeSeriesArchive</code>](#SpinalTimeSeriesArchive)  

| Param | Type |
| --- | --- |
| date | <code>number</code> \| <code>string</code> \| <code>Date</code> | 

<a name="SpinalTimeSeriesArchiveDay"></a>

## SpinalTimeSeriesArchiveDay ⇐ <code>Model</code>
**Kind**: global class  
**Extends**: <code>Model</code>  
**Properties**

| Name | Type |
| --- | --- |
| lstDate | <code>spinal.TypedArray\_Float64</code> | 
| lstValue | <code>spinal.TypedArray\_Float64</code> | 
| length | <code>spinal.Val</code> | 
| dateDay | <code>spinal.Val</code> | 


* [SpinalTimeSeriesArchiveDay](#SpinalTimeSeriesArchiveDay) ⇐ <code>Model</code>
    * [.push(data)](#SpinalTimeSeriesArchiveDay+push)
    * [.insert(data, date)](#SpinalTimeSeriesArchiveDay+insert) ⇒ <code>boolean</code>
    * [.get([index])](#SpinalTimeSeriesArchiveDay+get) ⇒ <code>SpinalDateValue</code> \| <code>SpinalDateValueArray</code>
    * [.at(index)](#SpinalTimeSeriesArchiveDay+at) ⇒ <code>SpinalDateValue</code>
    * [.getActualBufferSize()](#SpinalTimeSeriesArchiveDay+getActualBufferSize)

<a name="SpinalTimeSeriesArchiveDay+push"></a>

### spinalTimeSeriesArchiveDay.push(data)
**Kind**: instance method of [<code>SpinalTimeSeriesArchiveDay</code>](#SpinalTimeSeriesArchiveDay)  

| Param | Type |
| --- | --- |
| data | <code>number</code> | 

<a name="SpinalTimeSeriesArchiveDay+insert"></a>

### spinalTimeSeriesArchiveDay.insert(data, date) ⇒ <code>boolean</code>
**Kind**: instance method of [<code>SpinalTimeSeriesArchiveDay</code>](#SpinalTimeSeriesArchiveDay)  

| Param | Type |
| --- | --- |
| data | <code>number</code> | 
| date | <code>number</code> \| <code>string</code> \| <code>Date</code> | 

<a name="SpinalTimeSeriesArchiveDay+get"></a>

### spinalTimeSeriesArchiveDay.get([index]) ⇒ <code>SpinalDateValue</code> \| <code>SpinalDateValueArray</code>
**Kind**: instance method of [<code>SpinalTimeSeriesArchiveDay</code>](#SpinalTimeSeriesArchiveDay)  

| Param | Type |
| --- | --- |
| [index] | <code>number</code> | 

<a name="SpinalTimeSeriesArchiveDay+at"></a>

### spinalTimeSeriesArchiveDay.at(index) ⇒ <code>SpinalDateValue</code>
<p>alias of 'get' method with index</p>

**Kind**: instance method of [<code>SpinalTimeSeriesArchiveDay</code>](#SpinalTimeSeriesArchiveDay)  

| Param | Type |
| --- | --- |
| index | <code>number</code> | 

<a name="SpinalTimeSeriesArchiveDay+getActualBufferSize"></a>

### spinalTimeSeriesArchiveDay.getActualBufferSize()
<p>For Tests - returns the TypedArrays' size</p>

**Kind**: instance method of [<code>SpinalTimeSeriesArchiveDay</code>](#SpinalTimeSeriesArchiveDay)  
<a name="genUID"></a>

## genUID(constructor) ⇒ <code>string</code>
**Kind**: global function  

| Param | Type |
| --- | --- |
| constructor | <code>string</code> | 

