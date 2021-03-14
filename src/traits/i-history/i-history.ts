/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:traits/i-history/README.md]]
 * @packageDocumentation
 */

import iBlock from 'super/i-block/i-block';
import type History from 'traits/i-history/history';

export default abstract class iHistory extends iBlock {
	/**
	 * Component history
	 */
	abstract history: History;

	/**
	 * Handler: was changed the visibility state of the top of a content
	 * @param state - if true, the top is visible
	 */
	abstract onPageTopVisibilityChange(state: boolean): void;
}
