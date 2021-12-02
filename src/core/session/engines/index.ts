/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncStorageNamespace } from '@src/core/kv-storage';

// eslint-disable-next-line import/no-mutable-exports
let engine: Promise<AsyncStorageNamespace>;

//#if runtime has core/kv-storage
engine = <any>(import('@src/core/kv-storage').then(({asyncLocal}) => asyncLocal.namespace('[[SESSION]]')));
//#endif

//#unless runtime has core/kv-storage
engine = <any>(import('@src/core/cache').then(({Cache}) => new Cache()));
//#endunless

export default engine;
