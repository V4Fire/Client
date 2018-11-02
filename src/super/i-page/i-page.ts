/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, prop, field, system, watch, hook, Statuses } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export type TitleValue<T = unknown> = string | ((ctx: T) => string);
export interface StageTitles<T = unknown> extends Dictionary<TitleValue<T>> {
	'[[DEFAULT]]': TitleValue<T>;
}

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
			this.$root.setPageTitle(value, this);
		}
	}

	/** @override */
	@field()
	protected componentStatusStore!: Statuses;

	/**
	 * Page title store
	 */
	@system((o) => o.link((v) => Object.isFunction(v) ? v(o) : v))
	protected pageTitleStore!: string;

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
