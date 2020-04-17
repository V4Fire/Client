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
import { ComponentInterface, RenderReason } from 'core/component/interface';
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

/**
 * Implements the base component force update API to a component instance
 *
 * @param component
 * @param forceUpdate - native function to update the component
 */
export function implementComponentForceUpdateAPI(component: ComponentInterface, forceUpdate: Function): void {
	component.$forceUpdate = (reason?: RenderReason) => {
		if (!('renderCounter' in component)) {
			return;
		}

		// @ts-ignore (access)
		component.renderCounter++;

		// @ts-ignore (access)
		component.lastSelfReasonToRender = reason !== null ? reason : null;

		if (!IS_PROD) {
			const
				now = performance.now(),

				// @ts-ignore (access)
				prev = component.lastTimeOfRender;

			if (prev && now - prev < 100) {
				console.warn('There is too frequent redrawing of a component template', component.componentName, {
					...reason,
					path: reason?.path.join('.')
				});
			}
		}

		forceUpdate.call(component);
	};
}
