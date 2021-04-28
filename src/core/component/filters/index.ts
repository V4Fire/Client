/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/filters/README.md]]
 * @packageDocumentation
 */

import * as strings from 'core/helpers/string';
import { ComponentEngine } from 'core/component/engines';

for (let keys = Object.keys(strings), i = 0; i < keys.length; i++) {
	const
		key = keys[i],
		val = strings[key];

	if (Object.isFunction(val)) {
		ComponentEngine.filter(key, val);
	}
}
