/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, prop, field, system, watch, hook, p, Statuses } from 'super/i-data/i-data';
import symbolGenerator from 'core/symbol';
export * from 'super/i-data/i-data';

export type TitleValue<T = any> = string | ((ctx: T) => string);
export interface StageTitles<T = any> extends Dictionary<TitleValue<T>> {
	'[[DEFAULT]]': TitleValue<T>;
}

export interface ScrollOpts extends ScrollToOptions {
	x?: number;
	y?: number;
}

const
	$$ = symbolGenerator();

@component({inheritMods: false})
export default class iPage<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly needReInit: boolean = true;

	/**
	 * Initial page title
	 */
	@prop({type: [String, Function]})
	readonly pageTitleProp: TitleValue = '';

	/**
	 * Map of page titles ({stage: title})
	 */
	@prop(Object)
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
			this.$root.setPageTitle(value, <any>this);
		}
	}

	/**
	 * Proxy wrapper for the scrollTo method
	 */
	@p({cache: false})
	get scrollToProxy(): Function {
		return this.scrollToProxyFn();
	}

	/** @override */
	@field()
	protected componentStatusStore!: Statuses;

	/**
	 * Page title store
	 */
	@system((o) => o.link((v) => Object.isFunction(v) ? v(o) : v))
	protected pageTitleStore!: string;

	/**
	 * Scrolls page to specified coordinates
	 *
	 * @param p
	 */
	scrollTo(p: ScrollOpts): void;

	/**
	 * @param x
	 * @param y
	 */
	scrollTo(x?: number, y?: number): void;

	// tslint:disable-next-line
	scrollTo(p?: ScrollOpts | number, y?: number): void {
		this.async.cancelProxy({label: $$.scrollTo});

		if (p && Object.isObject(p)) {
			const
				{x, y} = <ScrollOpts>p,
				opts = <ScrollToOptions>Object.reject(p, ['x', 'y']);

			scrollTo({left: x, top: y, ...opts});

		} else {
			scrollTo({left: <number | undefined>p, top: y});
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
	protected scrollToProxyFn(): Function {
		return this.async.proxy((x?: number | ScrollOpts, y?: number) => {
			if (x && Object.isObject(x)) {
				this.scrollTo(<ScrollOpts>x);

			} else {
				this.scrollTo(<number | undefined>x, y);
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
	protected syncStageTitles(): string | undefined {
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
				return this.pageTitle = this.t(Object.isFunction(v) ? v(<any>this) : v);
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
	protected activated(): void {
		super.activated();
		this.initTitle();
	}

	/** @override */
	protected beforeDestroy(): void {
		this.removeRootMod('active');
		super.beforeDestroy();
	}
}
