/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * A dictionary containing the names of hooks that occur before a component is created
 */
export const beforeHooks = Object.createDict({
	beforeRuntime: true,
	beforeCreate: true,
	beforeDataCreate: true
});

/**
 * A dictionary containing the names of hooks that occur before a component is mounted
 */
export const beforeMountHooks = Object.createDict({
	...beforeHooks,
	created: true,
	beforeMount: true
});

/**
 * A dictionary containing the names of hooks that occur before a component is rendered or re-rendered
 */
export const beforeRenderHooks = Object.createDict({
	...beforeMountHooks,
	beforeUpdate: true
});

/**
 * A dictionary containing the names of hooks that occur after a component is destroyed
 */
export const destroyedHooks = Object.createDict({
	beforeDestroy: true,
	destroyed: true
});
