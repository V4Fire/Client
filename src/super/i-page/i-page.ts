/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { WrappedFunction } from 'core/async';

import iVisible from 'traits/i-visible/i-visible';

import iData, { component, prop, system, watch, hook, p, ModsDecl } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export type TitleValue<T = unknown> = string | ((ctx: T) => string);
export interface StageTitles<T = unknown> extends Dictionary<TitleValue<T>> {
	'[[DEFAULT]]': TitleValue<T>;
}

export interface ScrollToFn<T = number, N = ScrollOptions> extends WrappedFunction {
	(x?: T | N, y?: T): void
}

export interface ScrollOptions {
	x?: number;
	y?: number;
	behavior?: ScrollBehavior;
}

export const
	$$ = symbolGenerator();

@component({inheritMods: false})
export default abstract class iPage<T extends object = Dictionary> extends iData<T> implements iVisible {
	/** @override */
	readonly reloadOnActivation: boolean = true;

	/** @override */
	readonly syncRouterStoreOnInit: boolean = true;

	/**
	 * Initial page title
	 */
	@prop({type: [String, Function]})
	readonly pageTitleProp: TitleValue = '';

	/**
	 * Map of page titles ({stage: title})
	 */
	@prop({type: Object, required: false})
	readonly stagePageTitles?: StageTitles;

	/**
	 * Page title
	 */
	get pageTitle(): string {
		return this.$root.pageTitle;
	}

	/**
	 * Sets a new page title
	 */
	set pageTitle(value: string) {
		if (this.isActivated) {
			this.$root.setPageTitle(value, this);
		}
	}

	/**
	 * Proxy wrapper for the scrollTo method
	 */
	@p({cache: false})
	get scrollToProxy(): ScrollToFn {
		return this.scrollToProxyFn();
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods
	};

	/**
	 * Page title store
	 */
	@system((o) => o.sync.link((v) => Object.isFunction(v) ? v(o) : v))
	protected pageTitleStore!: string;

	/**
	 * Scrolls a page to specified coordinates
	 * @param p
	 */
	scrollTo(p: ScrollOptions): void;

	/**
	 * @param x
	 * @param y
	 */
	scrollTo(x?: number, y?: number): void;

	// tslint:disable-next-line
	scrollTo(p?: ScrollOptions | number, y?: number): void {
		this.async.cancelProxy({label: $$.scrollTo});

		const scroll = (p: ScrollToOptions) => {
			try {
				scrollTo(p);

			} catch {
				scrollTo(p.left == null ? pageXOffset : p.left, p.top == null ? pageYOffset : p.top);
			}
		};

		if (p && Object.isObject(p)) {
			const
				{x, y} = <ScrollOptions>p,
				opts = <ScrollOptions>Object.reject(p, ['x', 'y']);

			scroll({left: x, top: y, ...opts});

		} else {
			scroll({left: <CanUndef<number>>p, top: y});
		}

	}

	/** @override */
	activate(force?: boolean): void {
		this.setRootMod('active', true);
		super.activate(force);
	}

	/** @override */
	deactivate(): void {
		this.setRootMod('active', false);
		super.deactivate();
	}

	/**
	 * Returns proxy wrapper for the scrollTo method
	 */
	protected scrollToProxyFn(): ScrollToFn {
		return this.async.proxy((x?: number | ScrollOptions, y?: number) => {
			if (x && Object.isObject(x)) {
				this.scrollTo(<ScrollOptions>x);

			} else {
				this.scrollTo(<CanUndef<number>>x, y);
			}
		}, {
			single: false,
			label: $$.scrollTo
		});
	}

	/**
	 * Synchronization for the stagePageTitles field
	 */
	@watch('!:onStageChange')
	protected syncStageTitles(): CanUndef<string> {
		if (!this.stagePageTitles) {
			return;
		}

		const
			stageTitles = this.stage != null && this.stagePageTitles;

		if (stageTitles) {
			let
				v = stageTitles[<string>this.stage];

			if (!v) {
				v = stageTitles['[[DEFAULT]]'];
			}

			if (v) {
				return this.pageTitle = this.t(Object.isFunction(v) ? v(this) : v);
			}
		}
	}

	/**
	 * Initializes a custom page title
	 */
	@hook('created')
	protected initTitle(): void {
		if (!this.syncStageTitles() && this.pageTitleStore) {
			this.pageTitle = this.pageTitleStore;
		}
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/** @override */
	protected activated(force?: boolean): void {
		super.activated(force);
		this.initTitle();
	}

	/** @override */
	protected beforeDestroy(): void {
		this.removeRootMod('active');
		super.beforeDestroy();
	}
}
