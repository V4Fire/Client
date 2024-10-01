/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This API can be used to determine whether a component is a "smart" component based on its name
 */
export const isSmartComponent = {
	replace(component: string): string {
		return component.slice(0, component.length - '-functional'.length);
	},

	test(component: string): boolean {
		return component.endsWith('-functional');
	}
};

/**
 * This API allows you to determine if a component is abstract based on its name
 */
export const isAbstractComponent = {
	test(component: string): boolean {
		return component.startsWith('i-') || component.startsWith('v-');
	}
};
