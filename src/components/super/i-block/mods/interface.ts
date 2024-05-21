/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Represents a visual theme with its associated properties
 */
export interface Theme {
	/**
	 * The value representing the visual theme
	 */
	value: string;

	/**
	 * Indicates whether the current theme value is derived from system settings
	 */
	isSystem: boolean;
}
