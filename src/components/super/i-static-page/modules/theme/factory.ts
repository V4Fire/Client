/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';
import ThemeManager from 'components/super/i-static-page/modules/theme/theme-manager';
import type { StorageEngine } from 'core/kv-storage';
import type { SystemThemeExtractor } from 'core/system-theme-extractor';

/**
 * Returns an instance of the class for managing interface themes, if that functionality is available
 *
 * @param component
 * @param store
 * @param systemTheme
 */
export default function themeManagerFactory(
	component: iBlock,
	store: CanPromise<StorageEngine>,
	systemTheme: CanPromise<SystemThemeExtractor>
): CanNull<ThemeManager> {
	return Object.isString(THEME) ? new ThemeManager(component, store, systemTheme) : null;
}
