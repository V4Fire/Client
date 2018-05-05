/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, field, system, watch } from 'super/i-data/i-data';
import { setLang, lang } from 'core/i18n';
import { TransitionPageInfo } from 'base/b-router/b-router';
export * from 'super/i-data/i-data';

@component()
export default class iPage<
	T extends Dictionary = Dictionary,
	M extends Dictionary = Dictionary,
	D extends Dictionary = Dictionary
> extends iData<D> {
	/**
	 * Link to i18n function
	 */
	@system()
	readonly i18n: typeof i18n = i18n;

	/**
	 * Page information object
	 */
	@field()
	pageInfo?: TransitionPageInfo<T, M>;

	/**
	 * System language
	 */
	get lang(): string {
		return this.langStore;
	}

	/**
	 * Sets a new system language
	 */
	set lang(value: string) {
		setLang(this.langStore = value);
	}

	/**
	 * System language store
	 */
	@field()
	protected langStore: string = lang;

	/**
	 * Synchronization for the langStore field
	 */
	@watch('langStore')
	protected syncLangWatcher(): void {
		this.$forceUpdate();
	}
}
