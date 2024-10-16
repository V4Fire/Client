/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component, field } from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bSafeOnDynamicEventDummy extends bDummy {
	/**
	 * The name of the dynamic event
	 */
	@field()
	dynamicEventName: string = 'click';

	/**
	 * The event handler
	 */
	onDynamicEvent(): void {
		this.emit('dynamicEvent', this.dynamicEventName);
	}
}
