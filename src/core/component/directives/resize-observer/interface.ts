/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import type { ResizeWatcherInitOptions } from 'core/dom/resize-observer';

import type { DirectiveBinding } from 'core/component/engines';

export * from 'core/dom/resize-observer/interface';

export interface DirectiveOptions extends DirectiveBinding<CanUndef<CanArray<ResizeWatcherInitOptions>>> {
	modifiers: Record<string, boolean>;
}
