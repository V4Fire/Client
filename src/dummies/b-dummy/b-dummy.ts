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

import '@src/models/demo/pagination';

import { derive } from '@src/core/functools/trait';

import * as cookie from '@src/core/cookies';
import * as htmlHelpers from '@src/core/html';
import * as browserHelpers from '@src/core/browser';
import * as session from '@src/core/session';

import { inViewFactory } from '@src/core/dom/in-view';
import { ImageLoader, imageLoaderFactory } from '@src/core/dom/image';
import { ResizeWatcher } from '@src/core/dom/resize-observer';

import updateOn from '@src/core/component/directives/update-on/engines';

import iLockPageScroll from '@src/traits/i-lock-page-scroll/i-lock-page-scroll';
import iObserveDOM from '@src/traits/i-observe-dom/i-observe-dom';

import inMemoryRouterEngine from '@src/core/router/engines/in-memory';
import historyApiRouterEngine from '@src/core/router/engines/browser-history';

import iData, {

	component,
	field,
	hook,
	wait,
	ModsNTable

} from '@src/super/i-data/i-data';

import bBottomSlide from '@src/base/b-bottom-slide/b-bottom-slide';

import daemons from '@src/dummies/b-dummy/daemons';
import type { Directives, Modules, Engines } from '@src/dummies/b-dummy/interface';

const
	inViewMutation = inViewFactory('mutation'),
	inViewObserver = inViewFactory('observer');

export * from '@src/super/i-data/i-data';
export * from '@src/dummies/b-dummy/interface';

interface bDummy extends Trait<typeof iLockPageScroll>, Trait<typeof iObserveDOM> {}

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

@derive(iLockPageScroll, iObserveDOM)
class bDummy extends iData implements iLockPageScroll, iObserveDOM {
	@field()
	testField: any = undefined;

	get directives(): Directives {
		return {
			imageFactory: imageLoaderFactory,
			image: ImageLoader,
			inViewMutation,
			inViewObserver,
			updateOn
		};
	}

	get engines(): Engines {
		return {
			router: {
				historyApiRouterEngine,
				inMemoryRouterEngine
			}
		};
	}

	get modules(): Modules {
		return {
			resizeWatcher: ResizeWatcher,
			iObserveDOM,
			htmlHelpers,
			session,
			browserHelpers,
			cookie
		};
	}

	get componentInstances(): Dictionary {
		return {
			bDummy,
			bBottomSlide
		};
	}

	override get baseMods(): CanUndef<Readonly<ModsNTable>> {
		return {foo: 'bar'};
	}

	static override readonly daemons: typeof daemons = daemons;

	setStage(value: string): void {
		this.stage = value;
	}

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
