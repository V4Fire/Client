/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Tree element data
 */
export interface TreeItem extends Dictionary {
	id: string;

	/**
	 * Parent element identifier
	 * (for nested items)
	 */
	parentId?: string;

	/**
	 * Nested items
	 */
	children?: TreeItem[];
}
