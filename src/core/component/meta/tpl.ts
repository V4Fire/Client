/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-ignore (ss import)
import * as defTpls from 'core/block.ss';

import { componentRenderFactories } from 'core/component/const';
import type { ComponentMeta } from 'core/component/interface';

/**
 * Attaches templates to the specified meta object
 *
 * @param meta - the component meta object
 * @param [tpls] - a dictionary with the registered templates
 */
export function attachTemplatesToMeta(meta: ComponentMeta, tpls?: Dictionary): void {
	const
		{methods, methods: {render}} = meta;

	// We have a custom render function
	if (render != null && !render.wrapper) {
		return;
	}

	// In this case, we don't automatically attach a render function
	if (meta.params.tpl === false) {
		// The loopback render function
		return attachTemplatesToMeta(meta, defTpls.block);
	}

	if (tpls == null || !('index' in tpls) || !Object.isFunction(tpls.index)) {
		return;
	}

	const renderFactory = componentRenderFactories[meta.componentName] ?? tpls.index();
	componentRenderFactories[meta.componentName] = renderFactory;

	methods.render = {
		wrapper: true,
		watchers: {},
		hooks: {},
		fn: renderFactory
	};
}
