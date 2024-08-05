/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A list of supported lifecycle component's hooks
 */
export type Hook =
	'beforeRuntime' |
	'beforeCreate' |
	'beforeDataCreate' |
	'after:beforeDataCreate' |
	'before:created' |
	'created' |
	'beforeMount' |
	'before:mounted' |
	'mounted' |
	'beforeUpdate' |
	'before:updated' |
	'updated' |
	'activated' |
	'deactivated' |
	'beforeDestroy' |
	'destroyed' |
	'renderTriggered' |
	'errorCaptured';
