/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-ignore (ss import)
import * as defTpls from '@src/core/block.ss';

import { componentTemplates } from '@src/core/component/const';
import type { ComponentMeta, ComponentMethod } from '@src/core/component/interface';

/**
 * Attaches templates to the specified meta object
 *
 * @param meta - component meta object
 * @param [tpls] - dictionary with templates
 */
export function attachTemplatesToMeta(meta: ComponentMeta, tpls?: Dictionary): void {
	const
		{methods, methods: {render}} = meta;

	// We have a custom render function
	if (render && !render.wrapper) {
		return;
	}

	// In this case, we don't automatically attaches a render function
	if (meta.params.tpl === false) {
		// Loopback render function
		return attachTemplatesToMeta(meta, defTpls.block);
	}

	if (tpls == null || !('index' in tpls) || !Object.isFunction(tpls.index)) {
		return;
	}

	const renderObj = componentTemplates[meta.componentName] ?? tpls.index();
	componentTemplates[meta.componentName] = renderObj;

	meta.component.staticRenderFns =
		renderObj.staticRenderFns ?? [];

	methods.render = <ComponentMethod>{
		wrapper: true,
		watchers: {},
		hooks: {},
		fn: renderObj.render
	};
}
