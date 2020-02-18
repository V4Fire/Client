/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/render/README.md]]
 * @packageDocumentation
 */

import { VNode } from 'core/component/engines';
import { RenderObject } from 'core/component/render/interface';
export * from 'core/component/render/interface';

/**
 * Executes the specified render object
 *
 * @param renderObject
 * @param ctx - component context
 */
export function execRenderObject(
	renderObject: RenderObject,
	ctx: Dictionary<any>
): VNode {
	const
		fns = renderObject.staticRenderFns;

	if (fns) {
		if (!Object.isArray(ctx._staticTrees)) {
			ctx._staticTrees = [];
		}

		for (let i = 0; i < fns.length; i++) {
			ctx._staticTrees.push(fns[i].call(ctx));
		}
	}

	return renderObject.render.call(ctx);
}
