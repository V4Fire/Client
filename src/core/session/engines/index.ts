/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AsyncNamespace } from 'core/kv-storage';

let
	engine: Promise<AsyncNamespace>;

//#if runtime has core/kv-storage
engine = Any(import('core/kv-storage').then(({asyncLocal}) => asyncLocal.namespace('[[SESSION]]')));
//#endif

//#unless runtime has core/kv-storage
engine = Any(import('core/cache').then(({Cache}) => new Cache()));
//#endunless

export default engine;
