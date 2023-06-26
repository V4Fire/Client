/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * URI schemes that will be handled by the environment, rather than the router
 */
export const urlsToIgnore = [
	/^#/,
	/^javascript:/,
	/^mailto:/,
	/^tel:/
];
