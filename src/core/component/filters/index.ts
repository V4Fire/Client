/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentDriver } from 'core/component/engines';
import * as strings from 'core/helpers/string';

for (let keys = Object.keys(strings), i = 0; i < keys.length; i++) {
	const
		key = keys[i],
		val = strings[key];

	if (Object.isFunction(val)) {
		ComponentDriver.filter(key, val);
	}
}
