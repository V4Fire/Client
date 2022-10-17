# super/i-block/modules/render-info

This module provides API for rendering custom data.

## Why is this module needed?


## Usage

You need to implement the strategies for collecting and rendering custom data so that the module will execute them.

Strategies can be set using the `setDataGatheringStrategies` and `setDataRenderStrategies` methods directly in your component that inherits from iBlock.

```typescript
@hook(['mounted', 'updated'])
protected override initRenderInfo(): void {
  this.renderInfo.setDataGatheringStrategies([getDataFromDebugField]);
  this.renderInfo.setDataRenderStrategies([bottomNextBlockRender]);

  super.initRenderInfo();
}
```
