/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';

export type { RenderFactory, RenderFn } from 'core/component';

export interface VNodeDescriptor extends VNodeOptions {
	/**
	 * A simple tag name or component name
	 */
	type: string;
}

export interface VNodeOptions {
	/**
	 * A dictionary with properties or attributes to pass to the created VNode
	 */
	attrs?: Dictionary;

	/**
	 * An array of children VNode descriptors or a dictionary with slot functions
	 */
	children?: VNodeChildren;
}

export type VNodeChild = string | VNode | VNodeDescriptor;

export type VNodeChildren =
	VNodeChild[] |
	Dictionary<CanArray<VNodeChild> | ((...args: any[]) => CanArray<VNodeChild>)>;
