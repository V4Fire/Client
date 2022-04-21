/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode as SuperVNode } from 'vue';
import type { RendererElement, RendererNode } from 'core/component/engines';
import type { ComponentInterface } from 'core/component/interface';

//#if @ignore
export * from '@vue/runtime-dom';
//#endif

export interface VNode<
	HostNode = RendererNode,
	HostElement = RendererElement,
	ExtraProps = {[key: string]: any}
> extends SuperVNode<HostNode, HostElement, ExtraProps> {
	fakeContext?: ComponentInterface;
}
