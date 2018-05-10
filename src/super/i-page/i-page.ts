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
	 * Sets a modifier to the root element
	 *
	 * @param name
	 * @param value
	 */
	setRootMod(name: string, value: any): boolean {
		if (value === undefined) {
			return false;
		}

		const
			root = document.documentElement,
			cl = root.classList;

		name = name.camelize(false);
		value = String(value).camelize(false);

		const
			mod = `${name}_${value}`;

		if (cl.contains(mod)) {
			return false;
		}

		root.className = root.className.replace(new RegExp(`(?:^|\\s+)${name}_[^\\s]+`), '');
		cl.add(mod);
		return true;
	}

	/**
	 * Removes a modifier from the root element
	 *
	 * @param name
	 * @param value
	 */
	removeRootMod(name: string, value?: any): boolean {
		const
			root = document.documentElement;

		name = name.camelize(false);
		value = value !== undefined ? String(value).camelize(false) : undefined;

		let
			res = false;

		root.className = root.className.replace(new RegExp(`(?:^|\\s+)${name}_([^\\s]+)`), (str, v) => {
			res = value === undefined || v === value;
			return res ? '' : str;
		});

		return res;
	}

	/**
	 * Synchronization for the langStore field
	 */
	@watch('langStore')
	protected syncLangWatcher(): void {
		this.$forceUpdate();
	}
}
