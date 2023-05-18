/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component } from 'components/dummies/b-dummy/b-dummy';

import Field from 'components/friends/field';
import { deleteField } from 'components/friends/field/api';

export * from 'components/dummies/b-dummy/b-dummy';

Field.addToPrototype({delete: deleteField});

@component()
class bFriendsFieldDummy extends bDummy {

}

export default bFriendsFieldDummy;
