/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component, field } from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bSafeOnDummy extends bDummy {
	/**
	 * True, if the element with the dynamic event is visible
	 */
	@field()
	isElementVisible: boolean = true;

	/**
	 * The name of the dynamic event
	 */
	@field()
	dynamicEventName: string = 'click';

	/**
	 * The event handler
	 */
	onEvent(): void {
		this.emit('event');
	}
}
