/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface SetOptions {
	path?: string;
	domain?: string;
	expires?: Date | string | number;
	secure?: boolean;
}

export interface RemoveOptions {
	path?: string;
	domain?: string;
	secure?: boolean;
}
