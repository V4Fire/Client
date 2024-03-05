/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { EventEmitter2 as EventEmitter } from 'eventemitter2';

import { factory, SyncStorage } from 'core/kv-storage';
import { prefersColorSchemeEnabled, lightThemeName, darkThemeName } from 'core/theme-manager/const';

import type { Theme, ThemeManagerOptions } from 'core/theme-manager/interface';
import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';

export * from 'core/theme-manager/const';
export * from 'core/theme-manager/interface';

const
	$$ = symbolGenerator();

export default class ThemeManager {
	/**
	 * A set of available app themes
	 */
	readonly availableThemes: Set<string> = new Set(AVAILABLE_THEMES ?? []);

	/**
	 * An event emitter for broadcasting theme manager events
	 */
	readonly emitter: EventEmitter = new EventEmitter({
		maxListeners: 1e3,
		newListener: false
	});

	/**
	 * The current theme value
	 */
	protected current!: Theme;

	/**
	 * An API for obtaining and observing system theme
	 */
	protected readonly systemThemeExtractor!: SystemThemeExtractor;

	/**
	 * An API for persistent theme storage
	 */
	protected readonly themeStorage!: SyncStorage;

	/**
	 * An attribute to set the theme value to the root element
	 */
	protected readonly themeAttribute: CanUndef<string> = THEME_ATTRIBUTE;

	constructor(opts: ThemeManagerOptions) {
		if (!SSR && !Object.isString(this.themeAttribute)) {
			throw new ReferenceError('The attribute name for setting themes is not specified');
		}

		if (POST_PROCESS_THEME && prefersColorSchemeEnabled) {
			throw new Error('The "postProcessor" parameter cannot be enabled with "detectUserPreferences"');
		}

		this.themeStorage = factory(opts.themeStorageEngine);
		this.systemThemeExtractor = opts.systemThemeExtractor;

		let theme: Theme = {
			value: this.defaultTheme,
			isSystem: false
		};

		if (POST_PROCESS_THEME) {
			const themeFromStore = this.themeStorage.get<Theme>('colorTheme');

			if (themeFromStore != null) {
				theme = themeFromStore;
			}
		}

		if (theme.isSystem || prefersColorSchemeEnabled) {
			void this.useSystem();

		} else {
			this.changeTheme(theme);
		}
	}

	/**
	 * Default theme from the app config
	 */
	protected get defaultTheme(): string {
		if (!Object.isString(THEME)) {
			throw new ReferenceError('A theme to initialize is not specified');
		}

		return THEME;
	}

	/**
	 * Returns the current theme
	 */
	get(): Theme {
		return this.current;
	}

	/**
	 * Sets a new value for the current theme
	 * @param value
	 */
	set(value: string): void {
		return this.changeTheme({value, isSystem: false});
	}

	/**
	 * Sets the actual system theme and activates the system theme change listener
	 */
	useSystem(): Promise<void> {
		const changeTheme = (value: string) => {
			value = this.resolveThemeAlias(value);
			void this.changeTheme({value, isSystem: true});
		};

		return this.systemThemeExtractor.getSystemTheme().then((value) => {
			this.systemThemeExtractor.onThemeChange(
				changeTheme,
				{label: $$.onThemeChange}
			);

			changeTheme(value);
		});
	}

	/**
	 * Changes the current theme value
	 *
	 * @param newTheme
	 * @throws ReferenceError
	 * @emits `theme:change(value: string, oldValue: CanUndef<string>)`
	 */
	protected changeTheme(newTheme: Theme): void {
		if (SSR || !Object.isString(this.themeAttribute) || Object.fastCompare(this.current, newTheme)) {
			return;
		}

		let {
			value,
			isSystem
		} = newTheme;

		if (!this.availableThemes.has(value)) {
			if (!isSystem) {
				throw new ReferenceError(`A theme with the name "${value}" is not defined`);
			}

			value = this.defaultTheme;
		}

		if (!isSystem) {
			this.systemThemeExtractor.unsubscribe({label: $$.onThemeChange});
		}

		const oldValue = this.current;

		this.current = newTheme;
		this.themeStorage.set('colorTheme', this.current);
		document.documentElement.setAttribute(this.themeAttribute, value);

		this.emitter.emit('theme:change', this.current, oldValue);
	}

	/**
	 * Returns the actual theme name for the provided alias
	 * @param alias
	 */
	protected resolveThemeAlias(alias: string): string {
		if (prefersColorSchemeEnabled) {
			return alias === 'dark' ? darkThemeName : lightThemeName;
		}

		return alias;
	}
}
