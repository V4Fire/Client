/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { inViewFactory } from 'core/dom/in-view';
import { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import { ResizeWatcher } from 'core/dom/resize-observer';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';

import iData, { component, wait, hook } from 'super/i-data/i-data';
import { Directives, Modules } from 'base/b-dummy/interface';
import iObserveDOM from 'traits/i-observe-dom/i-observe-dom';

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

export default class bDummy extends iData implements iLockPageScroll, iObserveDOM {
	/** @see [[iLockPageScroll.lock]] */
	lock(): Promise<void> {
		return iLockPageScroll.lock(this);
	}

	/** @see [[iLockPageScroll.unlock]] */
	unlock(): Promise<void> {
		return iLockPageScroll.unlock(this);
	}

	/** @see [[iObserveDOM.prototype.initDOMObservers]] */
	@hook('mounted')
	@wait('ready')
	initDOMObservers(): void {
		iObserveDOM.observe(this, {
			node: this.$el!,
			childList: true,
			subtree: true
		});
	}

	/** @see [[iObserveDOM.prototype.emitDOMChange]] */
	onDOMChange(): void {
		iObserveDOM.emitDOMChange(this);
	}

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
			resizeWatcher: ResizeWatcher,
			iObserveDOM
		};
	}
}
