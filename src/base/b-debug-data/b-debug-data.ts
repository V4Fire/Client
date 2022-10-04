/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:base/b-debug-data/README.md]]
 * @packageDocumentation
 */

import iBlock, { component, prop } from 'super/i-block/i-block';

import type { RenderData } from 'super/i-block/modules/debug-mode/interface';

export * from 'super/i-block/i-block';

/**
 * Component for rendering debug data in the form of a table
 */
@component({functional: true})
export default class bDebugData extends iBlock {
	@prop(Object)
	readonly data!: RenderData;
}
