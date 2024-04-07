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

import { DARK, LIGHT } from 'core/theme-manager/const';
import { defaultTheme } from 'core/theme-manager/helpers';

import type { Theme, ThemeManagerOptions } from 'core/theme-manager/interface';
import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';

const
	$$ = symbolGenerator();

export class ThemeManager {
	/**
	 * A set of available app themes
	 */
	readonly availableThemes: Set<string> = new Set(AVAILABLE_THEMES ?? []);

	/**
	 * An event emitter for broadcasting theme manager events
	 */
	readonly emitter: EventEmitter = new EventEmitter({
		maxListeners: 1e3,
		newListener: false,
		wildcard: true
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
	 * @param opts - options for initializing the theme manager
	 */
	constructor(opts: ThemeManagerOptions) {
		this.themeStorage = factory(opts.themeStorageEngine);
		this.systemThemeExtractor = opts.systemThemeExtractor;

		const theme = this.themeStorage.get<Theme>('colorTheme');

		if (theme == null || theme.isSystem) {
			void this.useSystem();

		} else {
			this.changeTheme(theme);
		}
	}

	/**
	 * True, if the dark theme is enabled
	 */
	get isDark(): boolean {
		return this.current.value === DARK;
	}

	/**
	 * True, if the light theme enabled
	 */
	get isLight(): boolean {
		return this.current.value === LIGHT;
	}

	/**
	 * Returns the current theme value
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
		const changeTheme = (value: string) => this.changeTheme({value, isSystem: true});

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
	 * @emits `theme:change(value: Theme, oldValue: CanUndef<Theme>)`
	 * @emits `theme.change(value: Theme, oldValue: CanUndef<Theme>)`
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

		if (Object.fastCompare(this.current, {isSystem, value})) {
			return;
		}

		const oldValue = this.current;

		this.current = newTheme;
		this.themeStorage.set('colorTheme', this.current);
		this.setThemeAttribute(value);

		// @deprecated
		this.emitter.emit('theme:change', this.current, oldValue);

		this.emitter.emit('theme.change', this.current, oldValue);
	}

	/**
	 * Sets the current theme value to the DOM theme attribute
	 *
	 * @param value
	 * @throws ReferenceError
	 */
	protected setThemeAttribute(value: string): void {
		if (SSR) {
			return;
		}

		if (!Object.isString(THEME_ATTRIBUTE)) {
			throw new ReferenceError('The attribute name for setting themes is not specified');
		}

		document.documentElement.setAttribute(THEME_ATTRIBUTE, value);
	}
}
