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
	boundCreateElement: boolean;
}

export type ProxyGetterType =
	'prop' |
	'field' |
	'system' |
	'attr' |
	'mounted';

export type ProxyGetter<T extends object = object> = (ctx: T) => {
	key: string | null;
	value: object;
	watch?(path: string, handler: Function): Function;
};

export type ProxyGetters<T extends object = object> = Record<ProxyGetterType, ProxyGetter<T>>;

export interface RenderEngine<T extends object = object> {
	minimalCtx: object;

	supports: RenderEngineFeatures;
	proxyGetters: ProxyGetters<T>;

	cloneVNode(vnode: VNode): VNode;
	patchVNode(vnode: VNode, component: ComponentInterface, renderCtx: RenderContext): VNode;

	renderVNode(vnode: VNode, parent: ComponentInterface): Node;
	renderVNode(vnodes: VNode[], parent: ComponentInterface): Node[];
}
