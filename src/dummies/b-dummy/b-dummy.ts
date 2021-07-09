/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy/README.md]]
 * @packageDocumentation
 */

import 'models/demo/pagination';

import { derive } from 'core/functools/trait';
import * as htmlHelpers from 'core/html';
import * as session from 'core/session';

import { inViewFactory } from 'core/dom/in-view';
import { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import { ResizeWatcher } from 'core/dom/resize-observer';

import updateOn from 'core/component/directives/update-on/engines';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iObserveDOM from 'traits/i-observe-dom/i-observe-dom';

import iData, { component, field, computed, hook, wait, ModsNTable } from 'super/i-data/i-data';

import daemons from 'dummies/b-dummy/daemons';
import type { Directives, Modules } from 'dummies/b-dummy/interface';

const
	inViewMutation = inViewFactory('mutation'),
	inViewObserver = inViewFactory('observer');

export * from 'super/i-data/i-data';
export * from 'dummies/b-dummy/interface';

interface bDummy extends Trait<typeof iLockPageScroll>, Trait<typeof iObserveDOM> {}

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

@derive(iLockPageScroll, iObserveDOM)
class bDummy extends iData implements iLockPageScroll, iObserveDOM {
	/**
	 * Test field
	 */
	@field()
	testField: any = undefined;

	/**
	 * Getter that depends on a value from the another component
	 */
	@computed({dependencies: ['r.isAuth']})
	get remoteWatchableGetter(): boolean {
		return this.r.isAuth;
	}

	/**
	 * Links to directives
	 */
	get directives(): Directives {
		return {
			imageFactory: imageLoaderFactory,
			image: ImageLoader,
			inViewMutation,
			inViewObserver,
			updateOn
		};
	}

	/**
	 * Link to the modules
	 */
	get modules(): Modules {
		return {
			resizeWatcher: ResizeWatcher,
			iObserveDOM,
			htmlHelpers,
			session
		};
	}

	/** @override */
	get baseMods(): CanUndef<Readonly<ModsNTable>> {
		return {foo: 'bar'};
	}

	/** @override */
	static readonly daemons: typeof daemons = daemons;

	/** @see [[iObserveDOM.initDOMObservers]] */
	@hook('mounted')
	@wait('ready')
	initDOMObservers(): void {
		iObserveDOM.observe(this, {
			node: this.$el!,
			childList: true,
			subtree: true
		});
	}
}

export default bDummy;
