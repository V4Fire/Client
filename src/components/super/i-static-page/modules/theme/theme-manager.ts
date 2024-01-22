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
import type iStaticPage from 'components/super/i-static-page/i-static-page';

import Friend from 'components/friends/friend';
import type { Theme } from 'components/super/i-static-page/modules/theme/interface';
import type { SystemThemeExtractor } from 'core/system-theme-extractor';

import { prefersColorSchemeEnabled, darkThemeName, lightThemeName } from 'components/super/i-static-page/modules/theme/const';

const
	$$ = symbolGenerator();

export * from 'components/super/i-static-page/modules/theme/interface';
export * from 'components/super/i-static-page/modules/theme/const';

export default class ThemeManager extends Friend {
	override readonly C!: iStaticPage;

	/**
	 * A set of available app themes
	 */
	availableThemes!: Set<string>;

	/**
	 * Current theme value
	 */
	protected current!: Theme;

	/**
	 * A promise that resolves when the ThemeManager is initialized.
	 */
	protected readonly initPromise!: Promise<ThemeManager>;

	/**
	 * An API for obtaining and observing system appearance.
	 */
	protected systemThemeExtractor!: SystemThemeExtractor;

	/**
	 * Initial theme value
	 */
	protected initialValue!: Theme;

	/**
	 * An API for persistent theme storage
	 */
	protected themeStorage!: SyncStorage;

	/**
	 * An attribute to set the theme value to the root element
	 */
	protected readonly themeAttribute: CanUndef<string> = THEME_ATTRIBUTE;

	/**
	 * Default theme from config
	 */
	protected readonly defaultTheme: string;

	/**
	 * @param component
	 * @param themeStorageEngine - engine for persistent theme storage
	 * @param systemThemeExtractor
	 */
	constructor(
		component: iBlock,
		themeStorageEngine: CanPromise<StorageEngine>,
		systemThemeExtractor: CanPromise<SystemThemeExtractor>
	) {
		super(component);

		if (!Object.isString(this.themeAttribute)) {
			throw new ReferenceError('An attribute name to set themes is not specified');
		}

		if (!Object.isString(THEME)) {
			throw new ReferenceError('A theme to initialize is not specified');
		}

		this.defaultTheme = THEME;
		this.availableThemes = new Set(AVAILABLE_THEMES ?? []);

		this.initPromise = this.async.promise(
			Promise.all([themeStorageEngine, systemThemeExtractor])
				.then(async ([storageEngine, systemThemeExtractor]) => {
					this.themeStorage = factory(storageEngine);
					this.systemThemeExtractor = systemThemeExtractor;

					let
						theme: Theme = {value: this.defaultTheme, isSystem: false};

					if (POST_PROCESS_THEME) {
						const themeFromStore = this.themeStorage.get<Theme>('colorTheme');

						if (themeFromStore != null) {
							theme = themeFromStore;
						}
					} else if (prefersColorSchemeEnabled) {
						return this.initSystemTheme();
					}

					if (theme.isSystem) {
						return this.initSystemTheme();
					}

					return this.changeTheme(theme);
				})
				.then(() => {
					this.initialValue = {...this.current};
					return this;
				}),
			{label: $$.themeManagerInit}
		);
	}

	/**
	 * Returns current theme
	 */
	async get(): Promise<Theme> {
		await this.initPromise;
		return this.current;
	}

	/**
	 * Sets a new value to the current theme
	 * @param value
	 */
	async set(value: string): Promise<void> {
		await this.initPromise;
		return this.changeTheme({value, isSystem: false});
	}

	/**
	 * Sets actual system theme and activates system theme change listener
	 */
	async useSystem(): Promise<void> {
		await this.initPromise;
		return this.initSystemTheme();
	}

	/**
	 * Initializes system theme and theme change listener
	 */
	protected async initSystemTheme(): Promise<void> {
		let
			value = await this.systemThemeExtractor.getSystemTheme();

		this.systemThemeExtractor.unsubscribe();
		this.systemThemeExtractor.subscribe(
			(value: string) => {
				value = this.getThemeAlias(value);
				void this.changeTheme({value, isSystem: true});
			}
		);

		value = this.getThemeAlias(value);
		return this.changeTheme({value, isSystem: true});
	}

	/**
	 * Changes current theme value
	 *
	 * @param theme
	 * @param theme.value
	 * @param theme.isSystem
	 * @throws ReferenceError
	 * @emits `theme:change(value: string, oldValue: CanUndef<string>)`
	 */
	protected changeTheme({value, isSystem}: Theme): void {
		if (
			SSR ||
			!Object.isString(this.themeAttribute) ||
			Object.fastCompare(this.current, {value, isSystem})
		) {
			return;
		}

		if (!this.availableThemes.has(value)) {
			if (!isSystem) {
				throw new ReferenceError(`A theme with the name "${value}" is not defined`);
			}

			value = this.defaultTheme;
		}

		if (!isSystem) {
			this.systemThemeExtractor.unsubscribe();
		}

		const oldValue = this.current;

		this.current = {value, isSystem};
		this.themeStorage.set('colorTheme', this.current);
		document.documentElement.setAttribute(this.themeAttribute, value);

		void this.component.lfc.execCbAtTheRightTime(() => {
			this.component.emit('theme:change', this.current, oldValue);
		});
	}

	/**
	 * Returns actual theme name for provided value
	 * @param value
	 */
	protected getThemeAlias(value: string): string {
		if (prefersColorSchemeEnabled) {
			return value === 'dark' ? darkThemeName : lightThemeName;
		}

		return value;
	}
}
