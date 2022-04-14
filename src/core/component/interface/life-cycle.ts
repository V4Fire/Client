/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * List of supported life-cycle hooks of a component
 */
export type Hook =
	'beforeRuntime' |
	'beforeCreate' |
	'beforeDataCreate' |
	'created' |
	'beforeMount' |
	'mounted' |
	'beforeUpdate' |
	'beforeUpdated' |
	'updated' |
	'beforeActivated' |
	'activated' |
	'deactivated' |
	'beforeDestroy' |
	'destroyed' |
	'renderTracked' |
	'renderTriggered' |
	'errorCaptured';
