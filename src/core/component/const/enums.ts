/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const mountedHooks = Object.createDict({
	mounted: true,
	updated: true,
	activated: true
});

export const beforeHooks = Object.createDict({
	beforeRuntime: true,
	beforeCreate: true,
	beforeDataCreate: true
});

export const beforeMountHooks = Object.createDict({
	...beforeHooks,
	created: true,
	beforeMount: true
});

export const beforeRenderHooks = Object.createDict({
	...beforeMountHooks,
	beforeUpdate: true
});
