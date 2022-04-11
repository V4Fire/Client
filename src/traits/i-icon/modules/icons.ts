/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Icon } from 'traits/i-icon/modules/interface';

export const
	iconsStore = Object.createDict<{ctx: Function; path: string}>();

/**
 * Returns an icon by the specified identifier
 * @param id
 */
export function getIcon(id?: string): CanPromise<Icon> {
	const path = id != null && iconsStore[id] != null ?
		iconsStore[id]?.path :
		id;

	if (id != null) {
		const
			icon = iconsStore[id]?.ctx(path);

		if (MODULE === 'ES2020') {
			return (async () => (await icon).default)();
		}

		return icon.default;
	}

	throw new Error(`Cannot find a module "${id}"`);
}

//#if runtime has svgSprite
// @context: ['@sprite', 'sprite' in flags ? flags.sprite : '@super']

let
	ctx;

if (MODULE === 'ES2020') {
	if (IS_PROD) {
		// @ts-ignore (require)
		ctx = require.context('!!svg-sprite-loader!svgo-loader!@sprite', true, /\.svg$/, 'lazy');

	} else {
		// @ts-ignore (require)
		ctx = require.context('!!svg-sprite-loader!@sprite', true, /\.svg$/, 'lazy');
	}

} else if (IS_PROD) {
	// @ts-ignore (require)
	ctx = require.context('!!svg-sprite-loader!svgo-loader!@sprite', true, /\.svg$/);

} else {
	// @ts-ignore (require)
	ctx = require.context('!!svg-sprite-loader!@sprite', true, /\.svg$/);
}

Object.forEach(ctx.keys(), (path: string) => {
	const
		id = normalize(path);

	if (iconsStore[id] == null) {
		iconsStore[id] = {ctx, path};
	}
});

// @endcontext
//#endif

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}
