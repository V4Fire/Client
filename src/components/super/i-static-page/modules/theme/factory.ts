/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';
import ThemeManager from 'components/super/i-static-page/modules/theme/theme-manager';

/**
 * Returns an instance of the class for managing interface themes, if that functionality is available
 * @param component
 */
export default function themeManagerFactory(component: iBlock): ThemeManager | null {
	return Object.isString(THEME) ? new ThemeManager(component) : null;
}
