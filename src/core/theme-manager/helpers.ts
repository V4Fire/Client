/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

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
