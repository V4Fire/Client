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

import type { KeyGetter, ValueGetter } from 'components/friends/field/interface';

interface Field {
	get<T = unknown>(path: string, getter: ValueGetter): CanUndef<T>;
	get<T = unknown>(path: string, obj?: Nullable<object>, getter?: ValueGetter): CanUndef<T>;

	set<T = unknown>(path: string, value: T, keyGetter: KeyGetter): T;
	set<T = unknown>(path: string, value: T, obj?: Nullable<object>, keyGetter?: KeyGetter): T;

	delete(path: string, keyGetter?: KeyGetter): boolean;
	delete(path: string, obj?: Nullable<object>, keyGetter?: KeyGetter): boolean;
}

@fakeMethods('delete')
class Field extends Friend {
	/**
	 * Returns a reference to the storage object for the fields of the passed component
	 * @param [component]
	 */
	getFieldsStore<T extends this['C'] | this['CTX']>(component: T = Object.cast(this.component)): T {
		const unsafe = Object.cast<this['CTX']>(component);
		return Object.cast(unsafe.isFunctionalWatchers || this.lfc.isBeforeCreate() ? unsafe.$fields : unsafe);
	}
}

Field.addToPrototype({
	get: getField,
	set: setField
});

export default Field;
