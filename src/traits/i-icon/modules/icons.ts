/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	iconsMap = Object.createDict<CanUndef<string>>(),
	iconsList = <Function[]>[];

interface SpriteEl {
	id: string;
	content: string;
	viewBox: string;
	stringify(): string;
	destroy(): undefined;
}

function icons(id?: string): CanPromise<SpriteEl> {
	if (id != null) {
		for (let i = 0; i < iconsList.length; i++) {
			try {
				const
					icon = iconsList[i](id);

				if (MODULE === 'ES2020') {
					return (async () => (await icon).default)();
				}

				return icon.default;

			} catch {}
		}
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

Object.forEach(ctx.keys(), (el: string) => {
	iconsMap[normalize(el)] = el;
});

iconsList.push(ctx);
// @endcontext
//#endif

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}

export { icons, iconsMap };
