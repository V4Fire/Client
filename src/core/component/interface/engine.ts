/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode, RenderContext } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface/component';

export interface RenderEngineFeatures {
	regular: boolean;
	functional: boolean;
	composite: boolean;
	ssr: boolean;
}

export type ProxyGetterType =
	'prop' |
	'field' |
	'system' |
	'attr' |
	'mounted';

export type ProxyGetter = (ctx: object) => {
	key: string;
	value: object;
	watch?(path: string, handler: Function): Function;
};

export interface RenderEngine {
	minimalCtx: object;

	supports: RenderEngineFeatures;
	proxyGetters: Record<ProxyGetterType, ProxyGetter>;

	cloneVNode(vnode: VNode): VNode;
	patchVNode(vnode: VNode, component: ComponentInterface, renderCtx: RenderContext): VNode;

	renderVNode(vnode: VNode, parent: ComponentInterface): Node;
	renderVNode(vnodes: VNode[], parent: ComponentInterface): Node[];
}
