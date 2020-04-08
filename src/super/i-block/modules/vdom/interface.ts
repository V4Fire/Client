/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNode, RenderObject, RenderContext as ComponentRenderContext } from 'core/component';

export type RenderFn = (params?: Dictionary) => VNode;

export type RenderContext =
	ComponentRenderContext |
	[Dictionary] |
	[Dictionary, ComponentRenderContext];

export type RenderPath = CanUndef<RenderObject> | string;
