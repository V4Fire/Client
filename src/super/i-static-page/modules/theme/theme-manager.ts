/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iStaticPage from 'super/i-static-page/i-static-page';
import { Friend } from 'super/i-block/i-block';

/**
 * Class to manage interface themes
 */
export default class ThemeManager extends Friend {
	/** @override */
	readonly C!: iStaticPage;

	/**
	 * Initial interface theme value
	 */
	protected readonly initialValue!: string;

	/**
	 * Attribute to set theme value on the root element
	 */
	protected readonly themeAttribute: CanUndef<string> = THEME_ATTRIBUTE;

	/**
	 * Current value
	 */
	protected valueStore!: string;

	/** @override */
	constructor(component: any) {
		super(component);

		if (!Object.isString(THEME)) {
			throw new ReferenceError('Initial theme value is not specified');
		}

		this.current = THEME;
		this.initialValue = THEME;

		if (!Object.isString(this.themeAttribute)) {
			throw new ReferenceError('Attribute name for interface theme is not defined');
		}
	}

	/**
	 * List of available values for current runtime
	 */
	get list(): Nullable<string[]> {
		return INCLUDED_THEMES;
	}

	/**
	 * Sets current value
	 *
	 * @emits theme:change(value: string, oldValue: CanUndef<string>)
	 * @param value
	 */
	set current(value: string) {
		if (this.list?.includes(value) === false) {
			throw new ReferenceError(`Theme with name "${value}" is not defined`);
		}

		if (!Object.isString(this.themeAttribute)) {
			return;
		}

		const
			oldValue = this.valueStore;

		this.valueStore = value;

		document.documentElement.setAttribute(this.themeAttribute, value);

		void this.component.lfc.execCbAtTheRightTime(() => {
			this.component.emit('theme:change', value, oldValue);
		});
	}

	/** @see [[Theme.valueStore]] */
	get current(): string {
		return this.valueStore;
	}
}
