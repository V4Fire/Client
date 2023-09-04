/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import RequireContext = __WebpackModuleApi.RequireContext;

import { iconsStore } from 'components/directives/icon/const';
import type { Icon } from 'components/directives/icon/interface';

/**
 * Returns the SVG icon object for the given icon name.
 * If the loading process is asynchronous, the function returns a Promise.
 *
 * @param id
 * @throws {Error} if the icon with the given name is not found in the sprite folder.
 */
export function getIcon(id?: string): CanPromise<Icon> {
	const path = id != null && iconsStore[id] != null ?
		iconsStore[id]?.path :
		id;

	if (id != null) {
		const
			icon = iconsStore[id]?.ctx(path);

		if (!SSR && MODULE === 'ES2020') {
			return (async () => (await icon).default)();
		}

		return icon.default;
	}

	throw new Error(`Cannot find the icon with the name "${id}"`);
}

//#if runtime has svgSprite
// @context: ['@sprite', 'sprite' in flags ? flags.sprite : '@super']

const
	ctx: RequireContext[] = [];

if (!SSR && MODULE === 'ES2020') {
	if (IS_PROD) {
		ctx.push(require.context('!!svg-sprite-loader!svgo-loader!@sprite', true, /\.svg$/, 'lazy'));
		ctx.push(require.context('!!svg-sprite-loader!svgo-loader!ds/icons', true, /\.svg$/, 'lazy'));

	} else {
		ctx.push(require.context('!!svg-sprite-loader!@sprite', true, /\.svg$/, 'lazy'));
		ctx.push(require.context('!!svg-sprite-loader!ds/icons', true, /\.svg$/, 'lazy'));
	}

} else if (IS_PROD) {
	ctx.push(require.context('!!svg-sprite-loader!svgo-loader!@sprite', true, /\.svg$/));
	ctx.push(require.context('!!svg-sprite-loader!svgo-loader!ds/icons', true, /\.svg$/));

} else {
	ctx.push(require.context('!!svg-sprite-loader!@sprite', true, /\.svg$/));
	ctx.push(require.context('!!svg-sprite-loader!ds/icons', true, /\.svg$/));
}

ctx.forEach((el) => {
	Object.forEach(el.keys(), (path: string) => {
		const
			id = normalize(path);

		if (iconsStore[id] == null) {
			iconsStore[id] = {ctx: el, path};
		}
	});
});

// @endcontext
//#endif

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}
