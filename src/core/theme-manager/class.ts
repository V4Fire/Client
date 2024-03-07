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

import { prefersColorSchemeEnabled, themeMapping, DARK, LIGHT } from 'core/theme-manager/const';

import type { Theme, ThemeManagerOptions } from 'core/theme-manager/interface';
import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';
import { defaultTheme } from 'core/theme-manager/helpers';

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

		this.themeStorage = factory(opts.themeStorageEngine);
		this.systemThemeExtractor = opts.systemThemeExtractor;

		let theme: Theme = {
			value: defaultTheme(),
			isSystem: false
		};

		const themeFromStore = this.themeStorage.get<Theme>('colorTheme');

		if (themeFromStore != null) {
			theme = themeFromStore;
		}

		if (theme.isSystem || prefersColorSchemeEnabled) {
			void this.useSystem();

		} else {
			this.changeTheme(theme);
		}
	}

	/**
	 * True, if dark theme enabled
	 */
	get isDark(): boolean {
		return this.current.value === this.resolveThemeAlias(DARK);
	}

	/**
	 * True, if light theme enabled
	 */
	get isLight(): boolean {
		return this.current.value === this.resolveThemeAlias(LIGHT);
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
			this.changeTheme({value, isSystem: true});
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
		if (Object.fastCompare(this.current, newTheme)) {
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

			value = defaultTheme();
		}

		if (!isSystem) {
			this.systemThemeExtractor.unsubscribe({label: $$.onThemeChange});
		}

		const oldValue = this.current;

		this.current = newTheme;
		this.themeStorage.set('colorTheme', this.current);
		this.setThemeAttribute(value);

		this.emitter.emit('theme:change', this.current, oldValue);
	}

	/**
	 * Sets the current theme value to the DOM theme attribute
	 *
	 * @param value
	 */
	protected setThemeAttribute(value: string): void {
		if (SSR || !Object.isString(this.themeAttribute) || this.current.value === value) {
			return;
		}

		document.documentElement.setAttribute(this.themeAttribute, value);
	}

	/**
	 * Returns the actual theme name for the provided alias
	 *
	 * @throws TypeError
	 * @param alias
	 */
	protected resolveThemeAlias(alias: string): string {
		if (!prefersColorSchemeEnabled) {
			return alias;
		}

		if (themeMapping[alias] == null) {
			throw TypeError(`Invalid theme alias: "${alias}"`);
		}

		return themeMapping[alias];
	}
}
