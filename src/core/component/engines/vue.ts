/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';

export { Vue as ComponentDriver };
export * from 'vue';

//#if VueInterfaces
export { InjectOptions } from 'vue/types/options';
export { VNode, ScopedSlot } from 'vue/types/vnode';
//#endif

export const supports = {
	functional: false
};

export const
	minimalCtx = {};

{
	const
		obj = Vue.prototype;

	for (const key in obj) {
		if (key.length === 2) {
			minimalCtx[key] = obj[key];
		}
	}
}
