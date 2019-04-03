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

interface Sprite {
	id: string;
	content: string;
	viewBox: string;
	node: SVGSymbolElement;
}

function icons(id?: string): Sprite {
	if (id) {
		for (let i = 0; i < iconsList.length; i++) {
			try {
				return iconsList[i](id).default;

			} catch {}
		}
	}

	throw new Error(`Cannot find module "${id}"`);
}

// @context: ['@sprite', 'sprite' in flags ? flags.sprite : '@super']

let
	ctx;

if (IS_PROD) {
	// @ts-ignore
	ctx = (<any>require).context(
		'!!svg-sprite!svg-fill?fill=currentColor!svgo!@sprite',
		true,
		/\.svg$/
	);

} else {
	// @ts-ignore
	ctx = (<any>require).context(
		'!!svg-sprite!svg-fill?fill=currentColor!@sprite',
		true,
		/\.svg$/
	);
}

Object.forEach(ctx.keys(), (el: string) => {
	iconsMap[normalize(el)] = el;
});

iconsList.push(ctx);
// @endcontext

function normalize(key: string): string {
	return key.replace(/\.\//, '').replace(/\.svg$/, '');
}

export { icons, iconsMap };
