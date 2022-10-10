# super/i-block/modules/debug-mode

This module provides API to work with debug data.

You need to implement the strategies for collecting and rendering debug data so that the module will execute them.

Strategies can be set using the `setDataGatheringStrategies` and `setDataRenderStrategies` methods directly in your component that inherits from iBlock.

```typescript
@hook(['mounted', 'updated'])
protected override initDebugMode(): void {
  this.debugMode.setDataGatheringStrategies([getDataFromDebugField]);
  this.debugMode.setDataRenderStrategies([bottomNextBlockRender]);

  super.initDebugMode();
}
```
