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
