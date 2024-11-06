/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	propRgxp = /Prop$|^\$props/,
	propGetterRgxp = /^(?:@|on):/,
	privateFieldRgxp = /^\[\[(.*)]]$/,
	storeRgxp = /Store$/,
	attrRgxp = /^\$attrs/,
	bindingRgxp = /(?:Prop|Store)$/,
	hasSeparator = /\./;

export const dsComponentsMods = (() => {
	try {
		return DS_COMPONENTS_MODS;

	} catch {
		return {};
	}
})();

export const isPropGetter = {
	test(name: string): boolean {
		return name.startsWith('@:') || name.startsWith('on:');
	},

	replace(name: string): string {
		if (isPropGetter.test(name)) {
			return name.startsWith('@') ? name.slice('@:'.length) : name.slice('on:'.length);
		}

		return name;
	}
};