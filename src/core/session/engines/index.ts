/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncStorageNamespace } from 'core/kv-storage';

// eslint-disable-next-line import/no-mutable-exports
let engine: Promise<AsyncStorageNamespace>;

//#if runtime has ssr
engine = Object.cast(import('core/cache').then(({NeverCache}) => new NeverCache()));
//#endif

//#unless runtime has ssr
//#if runtime has core/kv-storage
engine = Object.cast(import('core/kv-storage').then(({asyncLocal}) => asyncLocal.namespace('[[SESSION]]')));
//#endif

//#unless runtime has core/kv-storage
engine = Object.cast(import('core/cache').then(({Cache}) => new Cache()));
//#endunless
//#endunless

export default engine;
