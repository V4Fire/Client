# components/friends/data-provider

This module provides a class for working with external data providers and uses the `core/data` module.
To better understand the concept of data providers, please refer to the documentation for this module.

```js
this.dataProvider.get({id: 10});
this.dataProvider.update({newData: 10}, {query: {id: 10}});
```

## How to Include This Module in Your Component?

By default, any component that inherited from [[iData]] has the `dataProvider` property.
However, to use the module methods, attach them explicitly to enable tree-shake code optimizations.
Place the required import declaration within your component file.

```typescript
import iData, { component } from 'components/super/i-data/i-data';
import DataProvider, { get, deleteData } from 'components/friends/data-provider';

// Import `get` and `delete` methods
DataProvider.addToPrototype({get, delete: deleteData});

@component()
export default class bExample extends iData {}
```

## Why Not to Use `core/data`?

There are two reasons to use the `Data` class instead of the pure `core/data` module.

1. `Data` wraps the `core/data` module with `Async` to prevent race conditions and memory leaks.

2. `Data` is integrated with its component. For example, data for requests can be taken from the component parameters.
   Also, when executing requests, the `progress` modifier will be automatically set.

## constructor

The class constructor takes a reference to the component itself,
as well as a data provider and additional parameters for it.
A provider can be specified in several ways: by its name, by its constructor,
or simply by passing in an instance of the provider.

```typescript
import DataProvider from 'components/friends/data-provider';
import MyProvider from 'providers/my-provider';

import iBlock, { component, system } from 'components/super/i-block/i-block';

@component()
class bExample extends iBlock {
  @system((o) => new DataProvider(o, new MyProvider()))
  data!: Data;

  created() {
    this.data.get().then(console.log);
  }
}
```

## Methods

### url

Gets the full URL of any provider's request or sets an optional URL part for any provider request,
which is concatenated with the base part of the URL.

```js
this.url('list').get();
```

### base

Gets or sets the base part of the URL for any provider request.

```js
this.base('list').get();
```

### get

Requests data from the provider using a query.

### peek

Checks the provider availability using a query.

### post

Sends data to the provider without any semantic effects.
This operation typically involves transmitting data to the provider for purposes such as logging,
caching, or simple storage, where the data sent does not trigger any processing or change
in state within the provider's system.

### add

Adds new data to the provider.

### update

Updates the provider's data based on a query.

### delete

Deletes the provider's data based on a query.

### dropCache

Drops the data provider's cache.

### getDefaultRequestParams

Returns the default query options for the specified method of the data provider.
