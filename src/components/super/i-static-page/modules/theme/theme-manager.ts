/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type iBlock from 'components/super/i-block/i-block';
import type iStaticPage from 'components/super/i-static-page/i-static-page';

import Friend from 'components/friends/friend';

const
	$$ = symbolGenerator();

export default class ThemeManager extends Friend {
	override readonly C!: iStaticPage;

	/**
	 * A set of available app themes
	 */
	availableThemes!: Set<string>;

	/**
	 * Current theme value
	 */
	protected currentStore!: string;

	/**
	 * Initial theme value
	 */
	protected readonly initialValue!: string;

	/**
	 * An attribute to set the theme value to the root element
	 */
	protected readonly themeAttribute: CanUndef<string> = THEME_ATTRIBUTE;

	constructor(component: iBlock) {
		super(component);

		if (!Object.isString(THEME)) {
			throw new ReferenceError('A theme to initialize is not specified');
		}

		this.availableThemes = new Set(AVAILABLE_THEMES ?? []);

		let theme = THEME;

		if (USE_SYSTEM_THEME && Object.isString(DARK_THEME_NAME) && Object.isString(LIGHT_THEME_NAME)) {
			const
				darkThemeMq = globalThis.matchMedia('(prefers-color-scheme: dark)');

			theme = darkThemeMq.matches ? DARK_THEME_NAME : LIGHT_THEME_NAME;

			this.initThemeListener(darkThemeMq, DARK_THEME_NAME, LIGHT_THEME_NAME);
		}

		this.current = theme;
		this.initialValue = theme;

		if (!Object.isString(this.themeAttribute)) {
			throw new ReferenceError('An attribute name to set themes is not specified');
		}
	}

	/**
	 * Current theme value
	 */
	get current(): string {
		return this.currentStore;
	}

	/**
	 * Sets a new value to the current theme
	 *
	 * @param value
	 * @emits `theme:change(value: string, oldValue: CanUndef<string>)`
	 */
	set current(value: string) {
		if (!this.availableThemes.has(value)) {
			throw new ReferenceError(`A theme with the name "${value}" is not defined`);
		}

		if (!Object.isString(this.themeAttribute)) {
			return;
		}

		const oldValue = this.currentStore;

		this.currentStore = value;
		document.documentElement.setAttribute(this.themeAttribute, value);

		void this.component.lfc.execCbAtTheRightTime(() => {
			this.component.emit('theme:change', value, oldValue);
		});
	}

	/**
	 * Initialises event listener on change system appearance
	 *
	 * @param mq
	 * @param darkTheme
	 * @param lightTheme
	 */
	protected initThemeListener(mq: MediaQueryList, darkTheme: string, lightTheme: string): void {
		if (!USE_SYSTEM_THEME) {
			return;
		}

		// TODO: understand why cant we use `this.async.on(mq, 'change', ...)`; https://github.com/V4Fire/Core/issues/369
		mq.onchange = this.async.proxy((event: MediaQueryListEvent) => (
			event.matches ?
				this.current = darkTheme :
				this.current = lightTheme
		), {single: false, label: $$.themeChange});
	}
}
