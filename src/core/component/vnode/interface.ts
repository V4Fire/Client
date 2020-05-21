/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNode, VNodeDirective, NormalizedScopedSlot } from 'core/component/engines';

export interface ComponentVNodeData {
	ref?: string;
	refInFor?: boolean;

	attrs: Dictionary;
	props: Dictionary;
	directives: VNodeDirective[];

	slots: Dictionary<CanArray<VNode>>;
	scopedSlots: Dictionary<NormalizedScopedSlot>;

	on: Dictionary<CanArray<Function>>;
	nativeOn: Dictionary<Function>;

	class: string[];
	staticClass: string;
	style: CanArray<string | Dictionary>;
}

export interface ComponentModelVNodeData {
	value: unknown;
	expression: string;
	callback(value: unknown): unknown;
}
