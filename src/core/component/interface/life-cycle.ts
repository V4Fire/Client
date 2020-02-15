/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type Hook =
	'beforeRuntime' |
	'beforeCreate' |
	'beforeDataCreate' |
	'created' |
	'beforeMount' |
	'beforeMounted' |
	'mounted' |
	'beforeUpdate' |
	'beforeUpdated' |
	'updated' |
	'beforeActivated' |
	'activated' |
	'deactivated' |
	'beforeDestroy' |
	'destroyed' |
	'errorCaptured';
