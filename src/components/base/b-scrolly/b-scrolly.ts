/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/base/b-scrolly/README.md]]
 * @packageDocumentation
 */

import iData, { component, prop } from 'components/super/i-data/i-data';
import VDOM, { create, render } from 'components/friends/vdom';
import { RenderStrategy } from 'components/base/b-scrolly/const';
import type { RenderStrategyKeys } from 'components/base/b-scrolly/interface';

export * from 'components/base/b-scrolly/interface';
export * from 'components/base/b-scrolly/const';

VDOM.addToPrototype(create);
VDOM.addToPrototype(render);

@component()
export default class bScrolly extends iData {
	/**
	 * {@link RenderStrategy}
	 */
	@prop({type: String, validator: (v) => Object.isString(v) && RenderStrategy.hasOwnProperty(v)})
	readonly renderStrategy: RenderStrategyKeys = RenderStrategy.default;
}
