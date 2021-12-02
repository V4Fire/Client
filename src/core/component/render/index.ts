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

import type { VNode } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';
import type { RenderObject } from 'core/component/render/interface';

export * from 'core/component/render/interface';

/**
 * Executes the specified render object
 *
 * @param renderObject
 * @param ctx - component context
 */
export function execRenderObject(renderObject: RenderObject, ctx: object): VNode {
	const
		fns = renderObject.staticRenderFns;

	if (fns) {
		const staticTrees: VNode[] = Object.cast(ctx['_staticTrees'] ?? []);
		ctx['_staticTrees'] = staticTrees;

		for (let i = 0; i < fns.length; i++) {
			staticTrees.push(fns[i].call(ctx));
		}
	}

	return renderObject.render.call(ctx);
}

/**
 * Implements the base component force update API to a component instance
 *
 * @param component
 * @param forceUpdate - native function to update a component
 */
export function implementComponentForceUpdateAPI(component: ComponentInterface, forceUpdate: Function): void {
	component.$forceUpdate = () => {
		if (!('renderCounter' in component)) {
			return;
		}

		forceUpdate.call(component);
	};
}
