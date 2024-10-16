/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { regProp } from 'core/component/decorators/prop';
import { regField } from 'core/component/decorators/system';

import { createComponentDecorator } from 'core/component/decorators/helpers';

import type { PartDecorator } from 'core/component/decorators/interface';

/**
 * Sets a default value for the specified prop or component field.
 * The value is set using a getter function.
 *
 * Typically, this decorator does not need to be used explicitly,
 * as it will be automatically added in the appropriate places during the build process.
 *
 * @decorator
 * @param [getter] - a function that returns the default value for a prop or field.
 *
 * @example
 * ```typescript
 * import iBlock, { component, prop, defaultValue } from 'components/super/i-block/i-block';
 *
 * @component()
 * class bExample extends iBlock {
 *   @defaultValue(() => 0)
 *   @prop(Number)
 *   bla!: number;
 * }
 * ```
 */
export function defaultValue(getter: () => unknown): PartDecorator {
	return createComponentDecorator(({meta}, key) => {
		if (key in meta.props) {
			regProp(key, {default: getter}, meta);

		} else if (key in meta.fields) {
			regField(key, 'fields', {init: getter}, meta);

		} else {
			regField(key, 'systemFields', {init: getter}, meta);
		}
	});
}
