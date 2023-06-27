/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A list of URL patterns that will not be intercepted by the router upon clicking. 
 * For instance, navigating to an external resource or using anchor-based navigation within a page.
 */
export const urlsToIgnore = [
	/^#/,
	/^javascript:/,
	/^mailto:/,
	/^tel:/
];
