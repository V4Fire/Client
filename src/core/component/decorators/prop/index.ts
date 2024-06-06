/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/decorators/prop/README.md]]
 * @packageDocumentation
 */

import { paramsFactory } from 'core/component/decorators/factory';
import type { DecoratorProp } from 'core/component/decorators/interface';

/**
 * Marks a class property as a component prop
 *
 * @decorator
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @prop(Number)
 *   bla: number = 0;
 *
 *   @prop({type: Number, required: false})
 *   baz?: number;
 *
 *   @prop({type: Number, default: () => Math.random()})
 *   bar!: number;
 * }
 * ```
 */
export const prop = paramsFactory<
	CanArray<Function | FunctionConstructor> |
	ObjectConstructor |
	DecoratorProp
>('props', (p) => {
	if (Object.isFunction(p) || Object.isArray(p)) {
		return {type: p, forceUpdate: true};
	}

	return {forceUpdate: true, ...p};
});
