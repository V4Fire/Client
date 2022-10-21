/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/dummies/b-dummy/README.md]]
 * @packageDocumentation
 */

import 'models/demo/pagination';

import { derive } from 'core/functools/trait';

import * as htmlHelpers from 'core/html';
import * as browserHelpers from 'core/browser';
import * as session from 'core/session';

import { inViewFactory } from 'core/dom/in-view';
import { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import { ResizeObserverHandle } from 'core/dom/resize-observer';

import updateOn from 'core/component/directives/bind-with/engines';

import iLockPageScroll from 'components/traits/i-lock-page-scroll/i-lock-page-scroll';
import iObserveDOM from 'components/traits/i-observe-dom/i-observe-dom';

import inMemoryRouterEngine from 'core/router/engines/in-memory';
import historyApiRouterEngine from 'core/router/engines/browser-history';

import iData, {

	component,
	field,
	hook,
	wait,
	ModsNTable

} from 'components/super/i-data/i-data';

import bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';

import daemons from 'components/dummies/b-dummy/daemons';
import type { Directives, Modules, Engines } from 'components/dummies/b-dummy/interface';

const
	inViewMutation = inViewFactory('mutation'),
	inViewObserver = inViewFactory('observer');

export * from 'components/super/i-data/i-data';
export * from 'components/dummies/b-dummy/interface';

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
	testField: unknown = undefined;

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
			resizeWatcher: ResizeObserverHandle,
			iObserveDOM,
			htmlHelpers,
			session,
			browserHelpers
		};
	}

	get componentInstances(): Dictionary {
		return {
			bDummy,
			bBottomSlide
		};
	}

	override get sharedMods(): CanUndef<Readonly<ModsNTable>> {
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
