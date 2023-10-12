/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import type iBlock from 'super/i-block/i-block';
import type iStaticPage from 'super/i-static-page/i-static-page';

import Friend from 'super/i-block/modules/friend';

const
	$$ = symbolGenerator();

/**
 * Class to manage interface themes
 */
export default class ThemeManager extends Friend {
	override readonly C!: iStaticPage;

	/**
	 * Set of available themes of the app
	 */
	availableThemes!: Set<string>;

	/**
	 * Initial theme value
	 */
	protected readonly initialValue!: string;

	/**
	 * Attribute to set a theme value to the root element
	 */
	protected readonly themeAttribute: CanUndef<string> = THEME_ATTRIBUTE;

	/**
	 * Current theme value
	 */
	protected currentStore!: string;

	constructor(component: iBlock) {
		super(component);

		if (!Object.isString(THEME)) {
			throw new ReferenceError('A theme to initialize is not specified');
		}

		this.availableThemes = new Set(AVAILABLE_THEMES ?? []);

		let theme = THEME;

		if (Object.isDictionary(DETECT_USER_PREFERENCES)) {
			const
				prefersColorSchemeEnabled = Object.get<boolean>(DETECT_USER_PREFERENCES, 'prefersColorScheme.enabled') ?? false,
				darkTheme = Object.get<string>(DETECT_USER_PREFERENCES, 'prefersColorScheme.aliases.dark') ?? 'dark',
				lightTheme = Object.get<string>(DETECT_USER_PREFERENCES, 'prefersColorScheme.aliases.light') ?? 'light';

			if (prefersColorSchemeEnabled) {
				const darkThemeMq = globalThis.matchMedia('(prefers-color-scheme: dark)');
				theme = darkThemeMq.matches ? darkTheme : lightTheme;

				this.initThemeListener(darkThemeMq, prefersColorSchemeEnabled, darkTheme, lightTheme);
			}
		}

		this.current = theme;
		this.initialValue = theme;

		if (!Object.isString(this.themeAttribute)) {
			throw new ReferenceError('An attribute name to set themes is not specified');
		}
	}

	/** @see [[ThemeManager.currentStore]] */
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

		const
			oldValue = this.currentStore;

		this.currentStore = value;
		document.documentElement.setAttribute(this.themeAttribute, value);

		void this.component.lfc.execCbAtTheRightTime(() => {
			this.component.emit('theme:change', value, oldValue);
		});
	}

	/**
	 * Initializes an event listener for changes in system appearance
	 *
	 * @param mq
	 * @param enabled
	 * @param darkTheme
	 * @param lightTheme
	 */
	protected initThemeListener(mq: MediaQueryList, enabled: boolean, darkTheme: string, lightTheme: string): void {
		if (!enabled) {
			return;
		}

		// TODO: understand why cant we use `this.async.on(mq, 'change', ...)`; https://github.com/V4Fire/Core/issues/369
		mq.onchange = this.async.proxy((event: MediaQueryListEvent) => (
			this.current = event.matches ? darkTheme : lightTheme
		), {single: false, label: $$.themeChange});
	}
}
