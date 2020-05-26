/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/analytics/README.md]]
 * @packageDocumentation
 */

//#if runtime has core/analytics
import * as analytics from 'core/analytics';
//#endif

import Friend from 'super/i-block/modules/friend';

/**
 * Class provides some methods to work with analytic engines
 */
export default class Analytics extends Friend {
	/**
	 * Sends an analytic event with the specified details
	 *
	 * @param event - event name
	 * @param [details] - event details
	 */
	sendEvent(event: string, details: Dictionary = {}): void {
		//#if runtime has core/analytics
		analytics.send(event, details);
		//#endif
	}
}
