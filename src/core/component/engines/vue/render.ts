/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue, { VNode } from 'vue';
import { ComponentInterface } from 'core/component/interface';

/**
 * Renders the specified data
 *
 * @param data
 * @param parent - parent component
 */
export function renderData(data: VNode, parent: ComponentInterface): Node;
export function renderData(data: VNode[], parent: ComponentInterface): Node[];
export function renderData(data: CanArray<VNode>, parent: ComponentInterface): CanArray<Node> {
	const
		isArr = Object.isArray(data);

	const vue = new Vue({
		render: (c) => isArr ? c('div', <VNode[]>data) : <VNode>data
	});

	Object.set(vue, '$root', Object.create(parent.$root));
	Object.set(vue, '$root.$remoteParent', parent);
	Object.set(vue, '$root.unsafe', vue.$root);

	const el = document.createElement('div');
	vue.$mount(el);

	return isArr ? Array.from(vue.$el.children) : vue.$el;
}
