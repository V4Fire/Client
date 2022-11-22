/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-page/README.md]]
 * @packageDocumentation
 */

import symbolGenerator from 'core/symbol';
import iVisible from 'components/traits/i-visible/i-visible';

import iData, { component, prop, system, computed, watch, hook, ModsDecl } from 'components/super/i-data/i-data';
import type { TitleValue, StageTitles, ScrollOptions } from 'components/super/i-page/interface';

export * from 'components/super/i-data/i-data';
export * from 'components/super/i-page/interface';

const
	$$ = symbolGenerator();

@component({inheritMods: false})
export default abstract class iPage extends iData implements iVisible {
	override readonly reloadOnActivation: boolean = true;
	override readonly syncRouterStoreOnInit: boolean = true;

	/** @see [[iVisible.hideIfOffline]] */
	@prop(Boolean)
	readonly hideIfOffline: boolean = false;

	/**
	 * The current page title.
	 * Basically this title is set via `document.title`.
	 */
	@prop({type: [String, Function]})
	readonly pageTitleProp: TitleValue = '';

	/**
	 * A dictionary of page titles (basically these titles are set via `document.title`).
	 * The dictionary values are bound to the `stage` values.
	 *
	 * The key named `[[DEFAULT]]` is used by default. If the key value is defined as a function,
	 * it will be called (the result will be used as the title).
	 */
	@prop({type: Object, required: false})
	readonly stagePageTitles?: StageTitles<this>;

	/**
	 * The current page title
	 *
	 * @see [[iPage.pageTitleProp]]
	 * @see [[iPage.stagePageTitles]]
	 */
	@computed({cache: true, dependencies: ['r.pageTitle']})
	get pageTitle(): string {
		return this.r.pageTitle;
	}

	/**
	 * Sets a new page title.
	 * Basically this title is set via `document.title`.
	 */
	set pageTitle(value: string) {
		if (this.isActivated) {
			void this.r.setPageTitle(value, this);
		}
	}

	/**
	 * A wrapped version of the `scrollTo` method.
	 * The calling cancels all previous tasks.
	 *
	 * @see [[iPage.scrollTo]]
	 */
	@computed({cache: true})
	get scrollToProxy(): this['scrollTo'] {
		return (...args) => {
			this.async.setImmediate(() => this.scrollTo(...args), {
				label: $$.scrollTo
			});
		};
	}

	static override readonly mods: ModsDecl = {
		...iVisible.mods
	};

	/**
	 * The page title store
	 */
	@system((o) => o.sync.link((v) => Object.isFunction(v) ? v(o) : v))
	protected pageTitleStore!: string;

	/**
	 * Scrolls the page by the specified options
	 * @param opts
	 */
	scrollTo(opts: ScrollOptions): void;

	/**
	 * Scrolls the page to the specified coordinates
	 *
	 * @param x
	 * @param y
	 */
	scrollTo(x?: number, y?: number): void;

	scrollTo(p?: ScrollOptions | number, y?: number): void {
		this.async.cancelProxy({label: $$.scrollTo});

		const scroll = (opts: ScrollToOptions) => {
			try {
				globalThis.scrollTo(opts);

			} catch {
				globalThis.scrollTo(opts.left == null ? scrollX : opts.left, opts.top == null ? scrollY : opts.top);
			}
		};

		if (Object.isPlainObject(p)) {
			scroll({left: p.x, top: p.y, ...Object.reject(p, ['x', 'y'])});

		} else {
			scroll({left: p, top: y});
		}
	}

	override activate(force?: boolean): void {
		this.setRootMod('active', true);
		super.activate(force);
	}

	override deactivate(): void {
		this.setRootMod('active', false);
		super.deactivate();
	}

	/**
	 * Synchronization for the `stagePageTitles` field
	 */
	@watch('!:onStageChange')
	protected syncStageTitles(): CanUndef<string> {
		const
			stageTitles = this.stagePageTitles;

		if (stageTitles == null) {
			return;
		}

		if (this.stage != null) {
			let
				v = stageTitles[this.stage];

			if (v == null) {
				v = stageTitles['[[DEFAULT]]'];
			}

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			if (v != null) {
				return this.pageTitle = this.t(Object.isFunction(v) ? v(this) : v);
			}
		}
	}

	/**
	 * Initializes the custom page title
	 */
	@hook(['created', 'activated'])
	protected initTitle(): void {
		if (this.syncStageTitles() == null && Object.isTruly(this.pageTitleStore)) {
			this.pageTitle = this.pageTitleStore;
		}
	}

	protected override initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	protected override beforeDestroy(): void {
		this.removeRootMod('active');
		super.beforeDestroy();
	}
}
