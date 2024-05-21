/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AsyncOptions } from 'core/async/modules/base/interface';

/**
 * An API for retrieving and monitoring the system's visual appearance
 */
export interface SystemThemeExtractor {
	/**
	 * Retrieves the current system visual appearance theme
	 */
	getSystemTheme(): Promise<string>;

	/**
	 * Initializes an event listener for changes in the system's visual appearance theme
	 *
	 * @param cb - a callback function to be invoked when the theme changes.
	 *             It receives the color scheme identifier as a string parameter,
	 *             by which the project's theme can be selected.
	 *
	 * @param [asyncOptions]
	 */
	onThemeChange(cb: (value: string) => void, asyncOptions?: AsyncOptions): void;
}
