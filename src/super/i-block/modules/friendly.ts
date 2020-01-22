/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Async from 'core/async';
import iBlock from 'super/i-block/i-block';

export default class iFriendly {
	/**
	 * Async instance
	 */
	protected get async(): Async<iBlock> {
		return this.component.async;
	}

	/**
	 * Component instance
	 */
	protected readonly component: iBlock['unsafe'];

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component.unsafe;
	}
}
