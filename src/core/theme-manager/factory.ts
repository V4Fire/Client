/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { StorageEngine } from 'core/kv-storage';

import ThemeManager from 'core/theme-manager/class';

import type { SystemThemeExtractor } from 'core/theme-manager/system-theme-extractor';

/**
 * Returns an instance of the class for managing interface themes if that functionality is available
 *
 * @param engines
 */
export default function themeManagerFactory(
	engines: {themeStorageEngine: StorageEngine; systemThemeExtractor: SystemThemeExtractor}
): CanNull<ThemeManager> {
	return Object.isString(THEME) ? new ThemeManager(engines) : null;
}
