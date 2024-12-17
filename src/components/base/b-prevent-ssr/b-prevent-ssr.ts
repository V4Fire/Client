/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-prevent-ssr/README.md]]
 * @packageDocumentation
 */

import iBlock, { component } from 'components/super/i-block/i-block';

export * from 'components/super/i-block/i-block';

@component()
export default class bPreventSSR extends iBlock {
	override readonly ssrRenderingProp: boolean = false;
}
