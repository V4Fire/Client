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

import type * as api from 'components/friends/field/api';

interface Field {
	get: typeof api.getField;
	set: typeof api.setField;
	delete: typeof api.deleteField;
}

@fakeMethods('delete')
class Field extends Friend {

}

Field.addToPrototype({
	get: getField,
	set: setField
});

export default Field;
