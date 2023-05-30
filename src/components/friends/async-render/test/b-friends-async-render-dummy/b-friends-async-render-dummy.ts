/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iData, { component } from 'components/super/i-data/i-data';

import AsyncRender from 'components/friends/async-render';
import * as AsyncRenderAPI from 'components/friends/async-render/api';

export * from 'components/super/i-data/i-data';

AsyncRender.addToPrototype(AsyncRenderAPI);

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bFriendsAsyncRenderDummy extends iData {

}
