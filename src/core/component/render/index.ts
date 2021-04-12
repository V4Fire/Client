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

import { componentTemplates } from 'core/component/const';

import type { VNode } from 'core/component/engines';
import type { ComponentInterface, ComponentMeta, ComponentMethod } from 'core/component/interface';
import type { RenderObject } from 'core/component/render/interface';

export * from 'core/component/render/interface';

/**
 * Attaches templates to the specified component
 *
 * @param tpls - dictionary with templates
 * @param meta - component meta object
 */
export function attachTemplates(tpls: Dictionary, meta: ComponentMeta): void {
	if (('index' in tpls) || !Object.isFunction(tpls.index)) {
		return;
	}

	const renderObj = componentTemplates[meta.name] ?? tpls.index();
	componentTemplates[meta.name] = renderObj;

	meta.component.staticRenderFns =
		renderObj.staticRenderFns ?? [];

	meta.methods.render = <ComponentMethod>{
		wrapper: true,
		watchers: {},
		hooks: {},
		fn: renderObj.render
	};
}

/**
 * Executes the specified render object
 *
 * @param renderObject
 * @param ctx - component context
 */
export function execRenderObject(renderObject: RenderObject, ctx: Dictionary<any>): VNode {
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
