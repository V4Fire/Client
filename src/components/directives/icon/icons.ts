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

const
	ctx: RequireContext[] = [];

// @context: ['@sprite', 'sprite' in flags ? flags.sprite : '@super', 'ds/icons']

if (!SSR && MODULE === 'ES2020') {
	if (IS_PROD) {
		ctx.push(require.context('!!svg-sprite-loader!svgo-loader!@sprite', true, /\.svg$/, 'lazy'));

	} else {
		ctx.push(require.context('!!svg-sprite-loader!@sprite', true, /\.svg$/, 'lazy'));
	}

} else if (IS_PROD) {
	ctx.push(require.context('!!svg-sprite-loader!svgo-loader!@sprite', true, /\.svg$/));

} else {
	ctx.push(require.context('!!svg-sprite-loader!@sprite', true, /\.svg$/));
}

// @endcontext

ctx.forEach((el) => {
	Object.forEach(el.keys(), (path: string) => {
		const
			id = normalize(path);

		if (iconsStore[id] == null) {
			iconsStore[id] = {ctx: el, path};
		}
	});
});
console.trace()

//#endif

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}
