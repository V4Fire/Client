/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentRenderFactories } from 'core/component/const';
import type { ComponentMeta } from 'core/component/interface';

/**
 * Attaches templates to the specified metaobject
 *
 * @param meta - the component metaobject
 * @param [templates] - a dictionary containing the registered templates
 */
export function attachTemplatesToMeta(meta: ComponentMeta, templates?: Dictionary): void {
	const {methods, methods: {render}} = meta;

	// We have a custom render function
	if (render != null && !render.wrapper) {
		return;
	}

	// In this case, we don't automatically attach a render function
	if (meta.params.tpl === false) {
		// The loopback render function
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		return attachTemplatesToMeta(meta, require('core/block.ss').block);
	}

	if (templates == null || !('index' in templates) || !Object.isFunction(templates.index)) {
		return;
	}

	const renderFactory = componentRenderFactories[meta.componentName] ?? templates.index();
	componentRenderFactories[meta.componentName] = renderFactory;

	methods.render = {
		wrapper: true,
		watchers: {},
		hooks: {},
		fn: renderFactory
	};
}
