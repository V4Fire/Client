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
import type { Theme, ThemeSetterArg } from 'components/super/i-static-page/modules/theme/interface';
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
	 * @param value
	 */
	async setTheme(value: ThemeSetterArg): Promise<void> {
		await this.initPromise;
		return this.changeTheme(value);
	}

	/**
	 * Changes current theme value
	 * @param theme
	 */
	protected async changeTheme(theme: ThemeSetterArg): Promise<void> {
		if (SSR || !Object.isString(this.themeAttribute)) {
			return;
		}

		const
			updateTheme = ({value, isSystem}: Theme) => {
				if (!this.availableThemes.has(value)) {
					throw new ReferenceError(`A theme with the name "${value}" is not defined`);
				}

				if (
					!Object.isString(this.themeAttribute) ||
					Object.fastCompare(this.currentStore, {value, isSystem})
				) {
					return;
				}

				const oldValue = this.currentStore;

				this.currentStore = {value, isSystem};
				this.themeStorage.set('colorTheme', this.currentStore);
				document.documentElement.setAttribute(this.themeAttribute, value);

				void this.component.lfc.execCbAtTheRightTime(() => {
					this.component.emit('theme:change', this.currentStore, oldValue);
				});
			};

		const
			{isSystem} = theme;

		let value: string;

		if (isSystem) {
			value = await this.systemThemeExtractor.getSystemTheme();

			this.systemThemeExtractor.terminateThemeChangeListener();
			this.systemThemeExtractor.initThemeChangeListener(
				(value: string) => {
					if (prefersColorSchemeEnabled) {
						value = value === 'dark' ? darkThemeName : lightThemeName;
					}

					updateTheme({value, isSystem: true});
				}
			);

		} else {
			value = theme.value;
			this.systemThemeExtractor.terminateThemeChangeListener();
		}

		return updateTheme({value, isSystem});
	}
}
