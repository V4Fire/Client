# components/base/b-virtual-scroll

TBD

## Synopsis

* The component extends [[iData]].

* The component implements [[iItems]] traits.

## Modifiers

See the implemented modifiers or the parent component.

## Events

### События компонента

| EventName                       | Description                                                     | Payload description                           | Payload                     |
| ------------------------------- | --------------------------------------------------------------- | --------------------------------------------- | --------------------------- |
| `dataLoadSuccess`               | Data loading has succeeded.                                     | `data: object[], isInitialLoading: boolean`   | `[data, isInitialLoading]`  |
| `dataLoadStart`                 | Data loading has started.                                       | `isInitialLoading: boolean`                   | `[isInitialLoading]`        |
| `dataLoadError`                 | An error occurred while loading data.                           | `isInitialLoading: boolean`                   | `[isInitialLoading]`        |
| `dataEmpty`                     | Successful load with no data.                                   |                                               | `[]`                        |
| `resetState`                    | Reset component state.                                          |                                               | `[]`                        |
| `lifecycleDone`                 | All component data is rendered and loaded.                      |                                               | `[]`                        |
| `convertDataToDB`               | Trigger data conversion to the `DB`.                            | `data: unknown`                               | `[data]`                    |
| `elementEnter`                  | The element has entered the viewport.                           | `componentItem: MountedChild`                 | `[componentItem]`           |
| `elementOut`                    | The element has exited the viewport.                            | `componentItem: MountedChild`                 | `[componentItem]`           |
| `renderStart`                   | Rendering of items has started.                                 |                                               | `[]`                        |
| `renderDone`                    | Rendering of items has finished.                                |                                               | `[]`                        |
| `renderEngineStart`             | Rendering of items has started with the render engine.          |                                               | `[]`                        |
| `renderEngineDone`              | Rendering of items has finished with the render engine.         |                                               | `[]`                        |
| `domInsertStart`                | DOM node insertion has started.                                 |                                               | `[]`                        |
| `domInsertDone`                 | DOM node insertion has finished.                                |                                               | `[]`                        |

Also, you can see the implemented traits or the parent component.

## Usage

### Rendering Components

In this example:

- The `b-virtual-scroll` component is used to render a virtual scroll with 12 items loaded at a time.
It interacts with the `Provider` data provider component to fetch the data. The `request` prop is set to `{ get: { chunkSize: 12 } }`, specifying that each request should fetch 12 items.
- The `requestQuery` function computes additional request parameters based on the component state, specifically the `loadPage` property. These request parameters are merged with the `request` prop.
- The `b-virtual-scroll` component renders `b-dummy` components using the `item` prop.
Each `b-dummy` component receives the `name` and `type` props, which are derived from the `data` object for each item using the `itemProps` function.
- The component includes a `loader` slot that displays the message "Data loading in progress" while the data is being fetched.
- By default, the component stops loading data when it receives an empty response from the `dataProvider`, indicating that there are no more items to load.

```
< b-virtual-scroll &
  :dataProvider = 'Provider' |
  :request = {get: {chunkSize: 12}} |
  :requestQuery = (state) => ({page: state.loadPage}) |
  :chunkSize = 12 |
  :item = 'b-dummy' |
  :itemProps = (data) => ({name: data.name, type: data.type})
.
  < template #loader
    < .&__loader
      Data loading in progress
```

### Перезагрузка компонента

Для перезагрузки компонента b-virtual-scroll можно использовать несколько вариантов:

1. Вызвав `bVirtualScroll.initLoad` с аргументами `[data: any, {silent: false}]`;
2. Вызвав `bVirtualScroll.reload`;
3. Изменив `request` проп.

Во всех этих случаях жизненный цикл компонент будет сброшен на изначальное состояние и компонент начнет отрисовку
новых данных которые будет получать, очистив все предидущие.


### Should-like функции

### Переопределение `itemsFactory`

### Отрисовка по клику


## Slots

The component supports a bunch of slots to provide.

1. `loader` предоставляют возможность отображать различный контент (обычно скелетоны) пока загружаются данные.

```
< b-virtual-scroll
  < template #loader
    < .&__loader
      Data loading in progress
```

2. `tombstone` предоставляет возможность отображать различный контент который будет повторяться `tombstonesSize` (обычно скелетоны) количество раз пока загружаются данные.

```
< b-virtual-scroll :tombstonesSize = 3
  < template #loader
    < .&__skeleton
      Skeleton
```

3. `retry` предоставляет возможность отображать различный контент (обычно призыв перезагрузить данные) когда произошла ошибка загрузки данных.

```
< b-virtual-scroll
  < template #retry
    < .&__retry @click = initLoad
      Retry last request
```

4. `empty` предоставляет возможность отображать различный контент когда компонента получил порцию пустых данных при первоначальной загрузке.

```
< b-virtual-scroll
  < template #empty
    < .&__empty
      No data
```

5. `done` предоставляет возможность отображать различный контент когда компонента завершил загрузку всех данных и так же все их отрисовал.

```
< b-virtual-scroll
  < template #done
    < .&__done
      Load and render complete
```

6. `renderNext` предоставляет возможность отображать различный контент когда компонента не загружает данные и не перешел в состояние окончания лайфцикла.
Данный слот может быть полезен если необходимо реализовать ленивую отрисовку контента по клику.

```
< b-virtual-scroll
  < template #render-next
    < .&__render-next
      Render next
```

## API

### `shouldPerformDataRender`

- Type: `Function`
- Default: `(state: VirtualScrollState) => state.isInitialRender || state.itemsTillEnd === 0`

This function is called in the `bVirtualScroll.renderGuard` after other checks are completed.
It receives the component state as input and determines whether the component should render the next chunk of components.
The function should return a boolean value: `true` to allow rendering the next chunk, or `false` to prevent it.

Example usage:

```typescript
const shouldPerformDataRender = (state: VirtualScrollState): boolean => {
  return state.isInitialRender || state.itemsTillEnd === 0;
};
```

### `shouldPerformDataRequest`

- Type: `Function`
- Default: `() => state.lastLoadedData.length > 0`

The `shouldPerformDataRequest` property of `bVirtualScroll` allows you to control whether the component should request additional data based on the component state.
Here's an example of how you can use `shouldPerformDataRequest`:

```typescript
const shouldPerformDataRequest = (state: VirtualScrollState): boolean => {
  // Example: Request data if the remaining items till the end is less than or equal to 10
  return state.itemsTillEnd <= 10;
};
```

In this example, the function checks the `itemsTillEnd` property of the component state.
If the remaining number of items till the end is less than or equal to 10, it returns `true` to indicate that the component should perform a data request.
You can adjust the condition based on your specific requirements.

By implementing the `shouldPerformDataRequest` function, you have control over when the component should request additional data.
This allows you to customize the data loading behavior based on the state of the component.

### `shouldStopRequestingData`

- Type: `Function`
- Default: `(state: VirtualScrollState) => state.lastLoadedData.length > 0`

This function is called on each data loading cycle. It determines whether the component should stop requesting new data.
The function should return a boolean value: `true` to stop requesting data, or `false` to continue requesting data.

Here's an example of how you can use `shouldStopRequestingData`:

```typescript
const shouldStopRequestingData = (state: VirtualScrollState): boolean => {
  // Example: Stop requesting data when the total number of items equals the current number of loaded items
  return state.lastLoadedRawData?.total === state.data.length;
};
```

In this example, the function compares the total property of `lastLoadedRawData` with the length of the data array.
If the two values are equal, it returns true to indicate that the component should stop requesting new data.
This condition suggests that all available items have been loaded, and there is no need for further data requests.

You can customize the `shouldStopRequestingData` function to fit your specific scenario.
By implementing this function, you have control over when the component should stop requesting new data, based on the comparison between the total number of items and the current number of loaded items.

### `chunkSize`

- Type: `number | Function`
- Default: `10`

The amount of data required to perform one cycle of item rendering. This prop is used by the `bVirtualScroll` component to determine the number of components to render in each cycle.
It can be either a fixed number or a function that returns the number dynamically based on the component state.

Here are some examples:

```typescript
const chunkSize = (state: VirtualScrollState): number => {
  // Example 1: Incrementing chunk size for each render page
  return (state.renderPage + 1) * 10;

  // Example 2: Dynamic chunk size based on the state
  // Replace the condition and calculation with your custom logic
  if (state.isInitialRender) {
    return 20;
  } else if (state.renderPage < 3) {
    return 15;
  } else {
    return 10;
  }
};
```

In Example 1, the chunk size increases by 10 for each render page. For the initial render, it will be 10, then 20, 30, and so on.
In Example 2, the chunk size is dynamically determined based on the component state. It assigns different chunk sizes based on different conditions.

By using a function for `chunkSize`, you have the flexibility to adjust the rendering behavior based on the state of the component and other factors.

### `requestQuery`

- Type: `Function`
- Default: `undefined`

A function that returns the GET parameters for a request. This function is called for each request and receives the current component state as input.
It should return an object containing the request parameters. These parameters will be merged with the parameters from the `request` prop, giving priority to the `request` prop.

Pagination example:

```typescript
const requestQuery = (state: VirtualScrollState): Dictionary<Dictionary> => {
  return {
    page: state.loadPage,
    limit: 10
    // Other pagination parameters
  };
};
```

### `itemsFactory`

- Type: `Function`
- Default: See description

A factory function used to generate an array of `ComponentItem` objects representing the components to be rendered.
This function is called during the rendering process and receives the component state and context as arguments. It should return an array of `ComponentItem` objects.

The default implementation uses the `chunkSize` and `iItems` trait to slice the data and generate the components.
However, you can override this function to implement a custom rendering strategy.

Here's an example of how you can use the itemsFactory property to generate ComponentItem objects based on the lastLoadedData property:

```typescript
const itemsFactory = (state: VirtualScrollState): ComponentItem[] => {
  const items: ComponentItem[] = state.lastLoadedData.map((itemData, index) => {
    // Construct a ComponentItem object for each item in the lastLoadedData array
    return {
      type: 'item',
      item: 'b-button',
      props: {
        id: `button-${index}`
      },
      key: `item-${index}`,
      children: {
        default: `Item ${index + 1}`
      }
    };
  });

  return items;
};
```

### `tombstonesSize`

- Type: `number`
- Default: `undefined`

Specifies the number of times the `tombstone` component will be rendered. This prop can be useful if you want to render multiple `tombstone` components using a single specified element.
For example, if you set `tombstonesSize` to 3, then three `tombstone` components will be rendered on your page.

Note: The `tombstone` component is used to represent empty or unloaded components in the virtual scroll. It is rendered as a placeholder until the actual component data is loaded and rendered.

### Other Properties

The `bVirtualScroll` class extends `iData` and includes additional properties related to slots, component state, and observers. Please refer to the documentation of `iData` for more details on those properties.

## Миграция с `b-virtual-scroll` версии 3.x.x

## Deep dive into component

### Жизненный цикл

### renderGuard

### Модули компонента

### Переопределение в дочерних слоях

## Возможные улучшения и дальнейшие эксперименты