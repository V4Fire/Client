/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { regProp } from 'core/component/decorators/prop';
import { regField } from 'core/component/decorators/system';

import { createComponentDecorator3 } from 'core/component/decorators/helpers';

import type { PartDecorator } from 'core/component/decorators/interface';

/**
 * Sets a default value for the specified prop or component field.
 *
 * Typically, this decorator does not need to be used explicitly,
 * as it will be automatically added in the appropriate places during the build process.
 *
 * @decorator
 * @param [getter] - a function that returns the default value for a prop or field
 *
 * @example
 * ```typescript
 * import { defaultValue } from 'core/component/decorators/default-value';
 * import iBlock, { component, prop, system } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @defaultValue(0)
 *   @prop(Number)
 *   id!: number;
 *
 *   @defaultValue(() => ({}))
 *   @system()
 *   opts: Dictionary;
 * }
 * ```
 */
export function defaultValue(getter: unknown): PartDecorator {
	return createComponentDecorator3(({meta}, key) => {
		const isFunction = Object.isFunction(getter);

		if (meta.props[key] != null) {
			regProp(key, {default: isFunction ? getter() : getter}, meta);

		} else {
			const
				isField = key in meta.fields,
				isSystemField = !isField && key in meta.systemFields;

			if (isField || isSystemField) {
				const cluster = isField ? 'fields' : 'systemFields';

				const params = isFunction ?
					{init: getter, default: undefined} :
					{init: undefined, default: getter};

				regField(key, cluster, params, meta);

			} else if (isFunction) {
				// Registration of methods that are described as properties, such as:
				// ```
				// on: typeof this['selfEmitter']['on'] =
				//   function on(this: iBlockEvent, event: string, handler: Function, opts?: AsyncOptions): object {
				//    return this.selfEmitter.on(event, <any>handler, opts);
				//   };
				// ```
				Object.defineProperty(meta.constructor.prototype, key, {
					configurable: true,
					enumerable: false,
					writable: true,
					value: getter()
				});
			}
		}
	});
}
