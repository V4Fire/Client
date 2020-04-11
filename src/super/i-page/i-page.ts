/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-page/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import iVisible from 'traits/i-visible/i-visible';

import iData, { component, prop, system, watch, hook, ModsDecl } from 'super/i-data/i-data';
import { TitleValue, StageTitles, ScrollOptions } from 'super/i-page/interface';

export * from 'super/i-data/i-data';
export * from 'super/i-page/interface';

export const
	$$ = symbolGenerator();

/**
 * Superclass for all page components
 */
@component({inheritMods: false})
export default abstract class iPage extends iData implements iVisible {
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
	 * Map of page titles that associated with component state values
	 */
	@prop({type: Object, required: false})
	readonly stagePageTitles?: StageTitles<this>;

	/**
	 * Page title
	 */
	get pageTitle(): string {
		return this.r.pageTitle;
	}

	/**
	 * Sets a new page title
	 */
	set pageTitle(value: string) {
		if (this.isActivated) {
			this.r.setPageTitle(value, this);
		}
	}

	/**
	 * Wrapped version of .scrollTo method
	 * @see [[iPage.scrollTo]]
	 */
	get scrollToProxy(): this['scrollTo'] {
		return this.async.proxy(this.scrollTo, {
			single: false,
			label: $$.scrollTo
		});
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
	 * Scrolls a page by the specified options
	 * @param opts
	 */
	scrollTo(opts: ScrollOptions): void;

	/**
	 * Scrolls a page to specified coordinates
	 *
	 * @param x
	 * @param y
	 */
	scrollTo(x?: number, y?: number): void;

	scrollTo(p?: ScrollOptions | number, y?: number): void {
		this.async.cancelProxy({label: $$.scrollTo});

		const scroll = (opts: ScrollToOptions) => {
			try {
				scrollTo(opts);

			} catch {
				scrollTo(opts.left == null ? pageXOffset : opts.left, opts.top == null ? pageYOffset : opts.top);
			}
		};

		if (Object.isPlainObject(p)) {
			scroll({left: p.x, top: p.y, ...Object.reject(p, ['x', 'y'])});

		} else {
			scroll({left: p, top: y});
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
	 * Synchronization for .stagePageTitles field
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
