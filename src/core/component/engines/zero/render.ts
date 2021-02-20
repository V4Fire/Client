/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNode } from 'vue';
import { ComponentInterface } from 'core/component/interface';

/**
 * Renders the specified data
 *
 * @param data
 * @param parent - parent component
 */
export function renderData(data: VNode, parent: ComponentInterface): Node;
export function renderData(data: VNode[], parent: ComponentInterface): Node[];

// eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
export function renderData(data: CanArray<VNode>, parent: ComponentInterface): CanArray<Node> {
	return <any>data;
}
