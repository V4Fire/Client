/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import daemons from 'base/b-dummy/daemons';

import { inViewFactory } from 'core/dom/in-view';
import { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import { ResizeWatcher } from 'core/dom/resize-observer';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

import iData, { component, field } from 'super/i-data/i-data';
import type { Directives, Modules } from 'base/b-dummy/interface';

const
	inViewMutation = inViewFactory('mutation'),
	inViewObserver = inViewFactory('observer');

export * from 'super/i-data/i-data';
export * from 'base/b-dummy/interface';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummy extends iData implements iLockPageScroll {

	/**
	 * Test field
	 */
	@field()
	testField: any = undefined;

	/**
	 * Links to directives
	 */
	get directives(): Directives {
		return {
			imageFactory: imageLoaderFactory,
			image: ImageLoader,
			inViewMutation,
			inViewObserver
		};
	}

	/**
	 * Link to the modules
	 */
	get modules(): Modules {
		return {
			resizeWatcher: ResizeWatcher
		};
	}

	/** @override */
	static readonly daemons: typeof daemons = daemons;

	/** @see [[iLockPageScroll.lock]] */
	lock(): Promise<void> {
		return iLockPageScroll.lock(this);
	}

	/** @see [[iLockPageScroll.unlock]] */
	unlock(): Promise<void> {
		return iLockPageScroll.unlock(this);
	}
}
