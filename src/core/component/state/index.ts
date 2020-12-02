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
import { State } from 'core/component/state/interface';

export * from 'core/component/state/interface';

export default watch(<State>{
	isAuth: undefined,
	isOnline: undefined,
	lastOnlineDate: undefined,
	experiments: undefined
}).proxy;
