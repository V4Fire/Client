/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component, field, system, watch } from 'super/i-data/i-data';
import { setLang, lang } from 'core/i18n';
export * from 'super/i-data/i-data';

@component()
export default class iPage<T extends Dictionary = Dictionary> extends iData<T> {
	/**
	 * Link to i18n function
	 */
	@system()
	protected readonly i18n: typeof i18n = i18n;

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
