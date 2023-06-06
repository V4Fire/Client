/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component } from 'components/dummies/b-dummy/b-dummy';
import bBottomSlide from 'components/base/b-bottom-slide/b-bottom-slide';

import VDOM from 'components/friends/vdom/class';
import * as VDOMAPI from 'components/friends/vdom/api';

export * from 'components/dummies/b-dummy/b-dummy';

VDOM.addToPrototype(VDOMAPI);

@component()
export default class bFriendsVDOMDummy extends bDummy {
	get componentConstructors(): Dictionary {
		return {
			bFriendsVDOMDummy,
			bBottomSlide
		};
	}
}
