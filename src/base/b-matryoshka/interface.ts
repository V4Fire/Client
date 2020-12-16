/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Element data
 */
export interface MatryoshkaItem extends Dictionary {
	id: string;
	parentId?: string;
	children?: MatryoshkaItem[];
}
