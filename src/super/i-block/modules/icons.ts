/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

let
	icons;

if (IS_PROD) {
	icons = (<any>require).context(
		'!!svg-sprite!svg-fill?fill=currentColor!svgo!sprite',
		true,
		/\.svg$/
	);

} else {
	icons = (<any>require).context(
		'!!svg-sprite!svg-fill?fill=currentColor!sprite',
		true,
		/\.svg$/
	);
}

/**
 * Table with svg icons
 */
const iconsMap = $C(icons.keys()).to(Object.createDict()).reduce((map, el) => {
	map[normalize(el)] = el;
	return map;
});

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}

export { icons, iconsMap };
