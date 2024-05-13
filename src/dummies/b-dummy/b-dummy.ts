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
import * as browserHelpers from 'core/browser';
import * as session from 'core/session';

import { inViewFactory } from 'core/dom/in-view';
import { ImageLoader, imageLoaderFactory } from 'core/dom/image';
import { ResizeWatcher } from 'core/dom/resize-observer';

import updateOn from 'core/component/directives/update-on/engines';

import iLockPageScroll from 'traits/i-lock-page-scroll/i-lock-page-scroll';
import iObserveDOM from 'traits/i-observe-dom/i-observe-dom';

import inMemoryRouterEngine from 'core/router/engines/in-memory';
import historyApiRouterEngine from 'core/router/engines/browser-history';

import iData, {

	prop,
	system,
	component,
	field,
	hook,
	wait,
	ModsNTable,
	VNode

} from 'super/i-data/i-data';

import bBottomSlide from 'base/b-bottom-slide/b-bottom-slide';

import daemons from 'dummies/b-dummy/daemons';
import type { Directives, Modules, Engines } from 'dummies/b-dummy/interface';
import type iBlock from 'super/i-block/i-block';

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
	@prop()
	pageProp?: string;

	@system((o) => o.sync.link())
	page?: string;

	@field()
	testField: unknown = undefined;

	/**
	 * Name of the test component
	 */
	@field()
	testComponent?: string;

	/**
	 * Attributes for the test component
	 */
	@field()
	testComponentAttrs: Dictionary = {};

	/**
	 * Slots for the test component
	 */
	@field()
	testComponentSlots?: CanArray<VNode>;

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
			browserHelpers
		};
	}

	get componentInstances(): Dictionary {
		return {
			bDummy,
			bBottomSlide
		};
	}

	override get baseMods(): CanUndef<Readonly<ModsNTable>> {
		return Object.freeze({
			...super['baseModsGetter'](),
			foo: 'bar'
		});
	}

	static override readonly daemons: typeof daemons = daemons;

	protected override readonly $refs!: iData['$refs'] & {
		testComponent?: iBlock;
	};

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
