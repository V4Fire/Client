/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeDirective } from 'core/component/engines';

export interface DirectiveOptions extends VNodeDirective {
	modifiers: {
		[key: string]: boolean;
	};

	value?: DirectiveValue;
}

export interface ImageOptions {
	src?: string;
	srcset?: Dictionary<string> | string;
	load?(): unknown;
	error?(): unknown;
}

export type DirectiveValue = string | ImageOptions;
