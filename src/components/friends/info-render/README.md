# components/friends/info-render

This module provides an API for collecting and rendering various component information.
For example, information for debugging or profiling.

## Why is this module needed?

In practice, it is often necessary to display one or another debugging information of a component: how long it took to load data;
what was the request; how many redraws were there, etc. Moreover, often we do not have the opportunity to open the browser debug panel,
for example, when we are working inside a mobile application and are not connected by wire to the device.

This module implements a single entry point for collecting various information, as well as rendering it in any of the possible ways.
It should be noted that exactly how to collect data and how to render it is configured using separate strategies that can be flexibly configured.

## How to include this module to your component?

By default, any component that inherits from [[iBlock]] has an `infoRender` property, as well as an `initInfoRender` method that
is automatically called when the component enters the `mounted` and `updated` states. This method must be used to set strategies
for collecting and rendering information. Strategies can be set using the `setDataGatheringStrategies` and `setDataRenderStrategies` methods
of the `infoRender` instance.

```typescript
import iBlock, { component } from 'components/super/i-block/i-block';

@component()
export default class bExample extends iBlock {
  protected override initInfoRender(): void {
    this.infoRender.setDataGatheringStrategies(myDataCollector1, myDataCollector2);
    this.infoRender.setDataRenderStrategies(myDOMRender, myConsoleRender);
    super.initInfoRender();
  }
}
```
