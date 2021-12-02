/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import ThemeManager from '@src/super/i-static-page/modules/theme/theme-manager';

/**
 * Returns a class instance to manage interface themes if that functionality is available
 * @param component
 */
export default function themeManagerFactory(component: any): CanUndef<ThemeManager> {
	return Object.isString(THEME) ? new ThemeManager(component) : undefined;
}
