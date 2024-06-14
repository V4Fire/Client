# components/friends/info-render

This module serves as an API for collecting and displaying various types of component information,
such as debugging or profiling details.

## Why is this module useful?

In practice, there are often instances where it becomes necessary to display specific debugging information
about a component, such as the time taken to load data, the request made, the number of redrawing, and so on.
Additionally, it may not always be feasible to access the browser's debug panel,
especially if working within a mobile application without a wired connection to the device.

This module addresses this issue by providing a single entry point for gathering different types of information and
rendering it in various ways.
It is worth noting that the data collection and rendering methods are configurable through separate strategies,
allowing for flexible customization.

## How to Include This Module in Your Component?

By default, any component that inherits from [[iBlock]] will have the `infoRender` property.
Additionally, it will have the `initInfoRender` method that is automatically triggered when
the component enters the mounted and updated states.
This method is intended to be used for configuring strategies for data collection and rendering purposes.
The strategies can be set by utilizing the `setDataGatheringStrategies` and `setDataRenderStrategies` methods
available within the `infoRender` instance.

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
