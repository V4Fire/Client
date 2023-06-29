/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A call to v-bind-with`s `.then()` or `.catch()`
 */
export interface BindWithTestCallInfo {
	args: any[];
}

/**
 * A history of calls to v-bind-with`s `.then()`/`.catch()`
 */
export interface BindWithTestInfo {
	calls: BindWithTestCallInfo[];
	errorCalls: BindWithTestCallInfo[];
}
