/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Friend, { fakeMethods } from 'components/friends/friend';

import { getField } from 'components/friends/field/get';
import { setField } from 'components/friends/field/set';
import type { deleteField } from 'components/friends/field/delete';

interface Field {
	get: typeof getField;
	set: typeof setField;
	delete: typeof deleteField;
}

@fakeMethods('delete')
class Field extends Friend {

}

Field.addToPrototype({
	get: getField,
	set: setField
});

export default Field;
