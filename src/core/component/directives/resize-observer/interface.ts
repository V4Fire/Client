/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import type { DirectiveBinding } from 'core/component/engines';
import type { ResizeWatcherInitOptions } from 'core/dom/resize-observer';

export * from 'core/dom/resize-observer/interface';

export interface DirectiveOptions extends DirectiveBinding {
	modifiers: {
		[key: string]: boolean;
	};

	value: CanUndef<CanArray<ResizeWatcherInitOptions>>;
	oldValue: CanUndef<CanArray<ResizeWatcherInitOptions>>;
}
