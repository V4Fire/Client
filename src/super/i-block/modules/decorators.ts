/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import {

	field as fieldDecorator,
	system as systemDecorator,
	ComponentField as BaseComponentField

} from 'core/component/decorators/base';

export interface InitFieldFn {
	(ctx: iBlock): any;
}

export interface ComponentField extends BaseComponentField {
	init?: InitFieldFn;
}

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const field = fieldDecorator as (params?: InitFieldFn | ComponentField) => Function;

/**
 * @see core/component/decorators/base.ts
 * @override
 */
export const system = systemDecorator as (params?: InitFieldFn | ComponentField) => Function;
