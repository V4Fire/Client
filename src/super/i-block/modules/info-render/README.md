# super/i-block/modules/info-render

This module provides API for rendering custom data.

## What is the purpose of this module?

This module allows you to collect any data about a component and render it on the page.

The method and source of data collection is defined in the data gathering strategies.
The rendering location and the component used for this is specified in the data rendering strategies.

## Usage

You need to implement the strategies for collecting and rendering data so that the module will execute them.

Strategies can be set using the `setDataGatheringStrategies` and `setDataRenderStrategies` methods directly in your component that inherits from iBlock.

```typescript
@hook(['mounted', 'updated'])
protected override initInfoRender(): void {
  this.infoRender.setDataGatheringStrategies([getDataFromDebugField]);
  this.infoRender.setDataRenderStrategies([bottomNextBlockRender]);

  super.initInfoRender();
}
```
