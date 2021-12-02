/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import type { VNodeDirective } from '@src/core/component/engines';
import type { ResizeWatcherInitOptions } from '@src/core/dom/resize-observer';

export * from '@src/core/dom/resize-observer/interface';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: CanArray<ResizeWatcherInitOptions>;
}
