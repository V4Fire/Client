/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, prop, field, system, watch, hook, Statuses } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export type TitleValue = string | ((ctx: iPage) => string);
export interface StageTitles extends Dictionary<TitleValue> {
	'[[DEFAULT]]': TitleValue;
}

@component()
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

	/** @override */
	@field()
	protected componentStatusStore!: Statuses;

	/**
	 * Page title store
	 */
	@system((o) => o.link((v) => Object.isFunction(v) ? v(o) : v))
	protected pageTitleStore!: string;

	/**
	 * Synchronization for the stagePageTitles field
	 */
	@watch({event: 'onStageChange'})
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
	@hook(['created', 'activated'])
	protected initTitle(): void {
		if (!this.syncStageTitles() && this.pageTitleStore) {
			this.pageTitle = this.pageTitleStore;
		}
	}
}
