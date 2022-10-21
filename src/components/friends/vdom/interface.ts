/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';

export type { RenderFactory, RenderFn } from 'core/component';

export interface VNodeOptions {
	/**
	 * A dictionary with attributes to pass to the created VNode
	 */
	attrs?: Dictionary;

	/**
	 * An array of children VNode descriptors or dictionary with slot functions
	 */
	children?: Array<string | VNodeDescriptor> | Dictionary<string | ((...args: any[]) => CanArray<VNode>)>;
}

export interface VNodeDescriptor extends VNodeOptions {
	/**
	 * A simple tag name or component name
	 */
	type: string;
}
