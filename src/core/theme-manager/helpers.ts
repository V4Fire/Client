/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ThemeManager } from 'core/theme-manager/class';
import type { ThemeManagerOptions } from 'core/theme-manager/interface';

/**
 * Returns an instance of the class for managing interface themes if that functionality is available
 * @param opts
 */
export function themeManagerFactory(opts: ThemeManagerOptions): CanNull<ThemeManager> {
	return Object.isString(THEME) ? new ThemeManager(opts) : null;
}

/**
 * Default theme from the app config
 * @throws ReferenceError
 */
export function defaultTheme(): string {
	if (!Object.isString(THEME)) {
		throw new ReferenceError('A theme to initialize is not specified');
	}

	return THEME;
}
