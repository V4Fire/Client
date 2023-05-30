/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component } from 'components/dummies/b-dummy/b-dummy';

import Block from 'components/friends/block/class';
import * as BlockAPI from 'components/friends/block/api';

export * from 'components/dummies/b-dummy/b-dummy';

Block.addToPrototype(BlockAPI);

@component()
class bFriendsBlockDummy extends bDummy {

}

export default bFriendsBlockDummy;
