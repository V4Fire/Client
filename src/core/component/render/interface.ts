/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { FunctionalCtx } from '/core/component/interface';
import type { CreateElement, VNode, RenderContext as SuperRenderContext } from '/core/component/engines';

export interface RenderContext extends SuperRenderContext {
	$root?: FunctionalCtx;
	$options?: Dictionary;
}

export interface RenderObject {
	staticRenderFns?: Function[];
	render(el: CreateElement, ctx?: RenderContext): VNode;
}
