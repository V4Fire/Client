/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { StorageEngine } from 'core/kv-storage';

import type iBlock from 'components/super/i-block/i-block';
import ThemeManager from 'components/super/i-static-page/modules/theme/theme-manager';

import type { SystemThemeExtractor } from 'components/super/i-static-page/modules/theme/system-theme-extractor';

/**
 * Returns an instance of the class for managing interface themes if that functionality is available
 *
 * @param component
 * @param engines
 */
export default function themeManagerFactory(
	component: iBlock,
	engines: {themeStorageEngine: StorageEngine; systemThemeExtractor: SystemThemeExtractor}
): CanNull<ThemeManager> {
	return Object.isString(THEME) ? new ThemeManager(component, engines) : null;
}
