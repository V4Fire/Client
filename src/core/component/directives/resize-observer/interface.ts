/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

import { VNodeDirective } from 'core/component/engines';
import { ResizeWatcherInitOptions } from 'core/dom/resize-observer';

export * from 'core/dom/resize-observer/interface';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: CanArray<ResizeWatcherInitOptions>;
}
