/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/analytics/README.md]]
 * @packageDocumentation
 */

import { send as sendAnalytics } from 'core/analytics';

import Friend, { fakeMethods } from 'components/friends/friend';

interface Analytics {
	send(...args: unknown[]): void;
}

@fakeMethods('send')
class Analytics extends Friend {

}

export default Analytics;

/**
 * Sends a new analytic event with the specified details
 * @param args
 */
export function send(...args: unknown[]): void {
	sendAnalytics(...args);
}
