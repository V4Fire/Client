/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { StorageEngine } from 'core/kv-storage';
import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';

export interface Theme {
	/**
	 * Theme value
	 */
	value: string;

	/**
	 * Indicates whether the current theme value is derived from system settings
	 */
	isSystem: boolean;
}

export interface ThemeManagerOptions {
	/**
	 * An engine for persistent theme storage
	 */
	themeStorageEngine: StorageEngine;

	/**
	 * An engine for extracting the system theme
	 */
	systemThemeExtractor: SystemThemeExtractor;
}
