/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import { factory, SyncStorage, StorageEngine } from 'core/kv-storage';

import type iBlock from 'components/super/i-block/i-block';
import type { Theme } from 'components/super/i-block/i-block';
import type iStaticPage from 'components/super/i-static-page/i-static-page';

import Friend from 'components/friends/friend';
import type { SystemThemeExtractor } from 'components/super/i-static-page/modules/theme/system-theme-extractor';

import {

	prefersColorSchemeEnabled,

	lightThemeName,
	darkThemeName

} from 'components/super/i-static-page/modules/theme/const';

export * from 'components/super/i-static-page/modules/theme/const';

const
	$$ = symbolGenerator();

export default class ThemeManager extends Friend {
	override readonly C!: iStaticPage;

	/**
	 * A set of available app themes
	 */
	readonly availableThemes!: Set<string>;

	/**
	 * The current theme value
	 */
	protected current!: Theme;

	/**
	 * An API for obtaining and observing system appearance
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

	/**
	 * @param component
	 * @param engines
	 * @param engines.themeStorageEngine - an engine for persistent theme storage
	 * @param engines.systemThemeExtractor - an engine for extracting the system theme
	 */
	constructor(
		component: iBlock,
		{themeStorageEngine, systemThemeExtractor}: {
			themeStorageEngine: StorageEngine;
			systemThemeExtractor: SystemThemeExtractor;
		}
	) {
		super(component);

		if (!Object.isString(this.themeAttribute)) {
			throw new ReferenceError('An attribute name to set themes is not specified');
		}

		if (POST_PROCESS_THEME && prefersColorSchemeEnabled) {
			throw new Error('"postProcessor" param cant be enabled with "detectUserPreferences"');
		}

		this.availableThemes = new Set(AVAILABLE_THEMES ?? []);

		this.themeStorage = factory(themeStorageEngine);
		this.systemThemeExtractor = systemThemeExtractor;

		let
			theme: Theme = {value: this.defaultTheme, isSystem: false};

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
	 * Default theme from config
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
			value = this.getThemeAlias(value);
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
		if (
			SSR ||
			!Object.isString(this.themeAttribute) ||
			Object.fastCompare(this.current, newTheme)
		) {
			return;
		}

		let
			{value, isSystem} = newTheme;

		if (!this.availableThemes.has(value)) {
			if (!isSystem) {
				throw new ReferenceError(`A theme with the name "${value}" is not defined`);
			}

			value = this.defaultTheme;
		}

		if (!isSystem) {
			this.ctx.async.clearAll({label: $$.onThemeChange});
		}

		const oldValue = this.current;

		this.current = newTheme;
		this.themeStorage.set('colorTheme', this.current);
		document.documentElement.setAttribute(this.themeAttribute, value);

		void this.component.lfc.execCbAtTheRightTime(() => {
			this.component.emit('theme:change', this.current, oldValue);
		});
	}

	/**
	 * Returns the actual theme name for the provided value
	 * @param value
	 */
	protected getThemeAlias(value: string): string {
		if (prefersColorSchemeEnabled) {
			return value === 'dark' ? darkThemeName : lightThemeName;
		}

		return value;
	}
}
