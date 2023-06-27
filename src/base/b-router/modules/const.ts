/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * List of URI schemes that the environment should handle, rather than the router
 */
export const urlsToIgnore = [
	/^#/,
	/^javascript:/,
	/^mailto:/,
	/^tel:/
];
