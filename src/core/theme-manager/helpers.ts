/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { LIGHT } from 'core/theme-manager/const';

/**
 * Returns the default theme from the app config
 * @throws ReferenceError
 */
export function defaultTheme(): string {
	return THEME ?? LIGHT;
}
