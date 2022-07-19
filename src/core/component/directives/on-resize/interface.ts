/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import type { WatchOptions, WatchHandler } from 'core/dom/resize-watcher';
import type { DirectiveBinding } from 'core/component/engines';

export * from 'core/dom/resize-watcher/interface';

export interface DirectiveParams extends DirectiveBinding<CanUndef<DirectiveValue>> {}

export type DirectiveValue = CanArray<WatchOptions & {handler: WatchHandler} | WatchHandler>;
