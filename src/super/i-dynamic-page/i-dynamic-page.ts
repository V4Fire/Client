/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, field, watch, hook, Statuses } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export interface OnFilterChange {
	mixin?: Dictionary;
	modifier?(value: any): any;
}

export type StageTitleValue = string | ((this: iDynamicPage) => void);
export interface StageTitles extends Dictionary<StageTitleValue> {
	'[[DEFAULT]]': StageTitleValue;
}

export const
	$$ = symbolGenerator();

@component()
export default class iDynamicPage<T extends Dictionary = Dictionary> extends iData<T> {
	/** @override */
	readonly needReInit: boolean = true;

	/**
	 * Initial page title
	 */
	@prop(String)
	readonly pageTitleProp: string = '';

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
			this.$root.pageTitle = value;
		}
	}

	/** @override */
	@field()
	protected componentStatusStore!: Statuses;

	/**
	 * Synchronization for the stageStore field
	 */
	@watch({event: 'onStageChange'})
	protected syncStageWatcher(): void {
		if (this.stagePageTitles) {
			const
				stageTitles = this.stage != null && this.stagePageTitles;

			if (stageTitles) {
				let
					v = stageTitles[<string>this.stage];

				if (!v) {
					v = stageTitles['[[DEFAULT]]'];
				}

				if (v) {
					this.pageTitle = this.t(Object.isFunction(v) ? v.call(this) : v);
				}
			}
		}
	}

	/**
	 * Initializes a custom page title
	 */
	@hook(['created', 'activated'])
	protected initTitle(): void {
		if (this.pageTitleProp) {
			this.pageTitle = this.pageTitleProp;
		}
	}

	/**
	 * Handler: filter change
	 *
	 * @param args - tuple:
	 *   1) el - event component
	 *   2) value - component value
	 *   3) [defKey] - default state key
	 *
	 * @param [key] - state key
	 * @param [e] - additional event parameters:
	 *   *) [mixin] - filter mixin
	 *   *) [modifier] - value modifier
	 */
	protected async onFilterChange(args: IArguments, key: string = args[2], e: OnFilterChange = {}): Promise<void> {
		let
			hashData = {};

		if (key) {
			const value = args[1];
			hashData = {[key]: e.modifier ? e.modifier(value) : value};
		}

		await this.accumulateTmpObj({...e.mixin, ...hashData}, $$.state, this.saveStateToRouter);
	}

	/** @override */
	protected created(): void {
		super.created();
	}
}
