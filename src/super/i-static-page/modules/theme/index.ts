/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Class to manage interface themes
 */
export default class Theme {
	/**
	 * Initial interface theme value
	 */
	protected readonly initialValue: CanUndef<string> = THEME;

	/**
	 * Attribute to set theme value on the root element
	 */
	protected readonly themeAttribute?: string = THEME_ATTRIBUTE;

	/**
	 * Current value
	 */
	protected valueStore?: string;

	constructor() {
		if (Object.isString(this.initialValue)) {
			this.current = this.initialValue;

			if (!Object.isString(this.themeAttribute)) {
				throw new ReferenceError('Attribute name for interface theme is not defined. Please specify "themeAttribute" variable in the config');
			}
		}
	}

	/**
	 * List of available values for current runtime
	 */
	get list(): CanUndef<string[]> {
		return INCLUDED_THEMES;
	}

	/**
	 * Sets current value
	 * @param theme
	 */
	set current(theme: CanUndef<string>) {
		if (theme != null && this.list?.includes(theme) === false) {
			throw new ReferenceError(`Theme with name "${theme}" is not defined`);
		}

		this.valueStore = theme;

		if (theme != null) {
			document.documentElement.setAttribute('data-theme', theme);

		} else {
			document.documentElement.removeAttribute('data-theme');
		}
	}

	/** @see [[Theme.valueStore]] */
	get current(): CanUndef<string> {
		return this.valueStore;
	}
}
