/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { inViewFactory } from 'core/dom/in-view';
import { ImageLoader } from 'core/dom/image';

import iData, { component } from 'super/i-data/i-data';
import { Directives } from 'base/b-dummy/interface';

const
	inViewMutation = inViewFactory('mutation'),
	inViewObserver = inViewFactory('observer');

export * from 'super/i-data/i-data';
export * from 'base/b-dummy/interface';

@component()
export default class bDummy extends iData {
	/**
	 * Links to directives
	 */
	get directives(): Directives {
		return {
			image: ImageLoader,
			inViewMutation,
			inViewObserver
		};
	}
}
