/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { factory, SyncStorage, StorageEngine } from 'core/kv-storage';
import SyncPromise from 'core/promise/sync';

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
	protected currentStore!: Theme;

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

		if (!Object.isString(THEME)) {
			throw new ReferenceError('A theme to initialize is not specified');
		}

		if (!Object.isString(this.themeAttribute)) {
			throw new ReferenceError('An attribute name to set themes is not specified');
		}

		this.availableThemes = new Set(AVAILABLE_THEMES ?? []);

		this.initPromise = this.async.promise(
			Promise.all([themeStorageEngine, systemThemeExtractor])
				.then(async ([storageEngine, systemThemeExtractor]) => {
					this.themeStorage = factory(storageEngine);
					this.systemThemeExtractor = systemThemeExtractor;

					let theme = {value: THEME, isSystem: false};

					if (POST_PROCESS_THEME) {
						const themeFromStore = this.themeStorage.get<Theme>('colorTheme');

						if (themeFromStore != null) {
							theme = themeFromStore;
						}
					} else if (prefersColorSchemeEnabled) {
						theme.isSystem = true;
					}

					this.initialValue = theme;
					return this.changeTheme(theme);
				})
				.then(() => this),
			{label: $$.themeManagerInit}
		);
	}

	/**
	 * Returns current theme
	 */
	async getTheme(): Promise<Theme> {
		await this.initPromise;
		return this.currentStore;
	}

	/**
	 * Sets a new value to the current theme
	 *
	 * @param value
	 * @param [isSystem]
	 */
	async setTheme(value: string, isSystem?: boolean): Promise<void>;
	async setTheme(value: Theme): Promise<void>;
	async setTheme(value: Theme | string, isSystem: boolean = false): Promise<void> {
		await this.initPromise;

		if (typeof value !== 'string') {
			isSystem = value.isSystem;
			value = value.value;
		}

		return this.changeTheme({value, isSystem});
	}

	/**
	 * Changes current theme value
	 *
	 * @param theme
	 * @emits `theme:change(value: string, oldValue: CanUndef<string>)`
	 */
	protected async changeTheme(theme: Theme): Promise<void> {
		let
			{isSystem, value} = theme;

		if (isSystem) {
			value = await this.systemThemeExtractor.getSystemTheme();

			this.systemThemeExtractor.initThemeChangeListener(
				(value: string) => {
					if (prefersColorSchemeEnabled) {
						value = value === 'dark' ? darkThemeName : lightThemeName;
					}

					void this.changeTheme({value, isSystem: true});
				}
			);

		} else {
			this.systemThemeExtractor.terminateThemeChangeListener();
		}

		if (!this.availableThemes.has(value)) {
			throw new ReferenceError(`A theme with the name "${value}" is not defined`);
		}

		if (SSR || !Object.isString(this.themeAttribute)) {
			return;
		}

		const oldValue = this.field.get('currentStore.value');

		this.currentStore = {value, isSystem};
		this.themeStorage.set('colorTheme', this.currentStore);
		document.documentElement.setAttribute(this.themeAttribute, value);

		void this.component.lfc.execCbAtTheRightTime(() => {
			this.component.emit('theme:change', value, oldValue);
		});
	}
}
