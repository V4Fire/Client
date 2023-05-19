/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component } from 'components/dummies/b-dummy/b-dummy';

import DOM from 'components/friends/dom';
import * as DOMAPI from 'components/friends/dom/api';

export * from 'components/dummies/b-dummy/b-dummy';

DOM.addToPrototype(DOMAPI);

@component()
class bFriendsDomDummy extends bDummy {

}

export default bFriendsDomDummy;
