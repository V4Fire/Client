/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/state/README.md]]
 * @packageDocumentation
 */

import watch from 'core/object/watch';

export default watch({
	isAuth: undefined,
	isOnline: undefined,
	lastOnlineDate: undefined,
	experiments: undefined
}).proxy;
