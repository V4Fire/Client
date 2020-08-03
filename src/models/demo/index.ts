/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Session, { provider } from 'models/modules/session';

export * from 'models/modules/session';

@provider
export default class Demo extends Session {
	/** @override */
	static request: typeof Session.request = Session.request({
		responseType: 'json',
		cacheStrategy: 'never'
	});
}
