/* eslint-disable @typescript-eslint/consistent-type-assertions */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import {

	prop as propDecorator,
	field as fieldDecorator,
	system as systemDecorator,
	watch as watchDecorator

} from 'core/component/decorators';

import type iBlock from 'super/i-block/i-block';

import type {

	InitFieldFn,
	DecoratorProp,
	DecoratorField,

	DecoratorFieldWatcher,
	DecoratorMethodWatcher

} from 'super/i-block/decorators/interface';

/**
 * @see core/component/decorators/prop
 * @inheritDoc
 */
export const prop = propDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: CanArray<FunctionConstructor | Function> | ObjectConstructor | DecoratorProp<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/field
 * @inheritDoc
 */
export const field = fieldDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: InitFieldFn<CTX> | DecoratorField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/system
 * @inheritDoc
 */
export const system = systemDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: InitFieldFn<CTX> | DecoratorField<CTX, A, B>
) => Function;

/**
 * @see core/component/decorators/watch
 * @inheritDoc
 */
export const watch = watchDecorator as <CTX = iBlock, A = unknown, B = A>(
	// @ts-ignore (unsafe cast)
	params?: DecoratorFieldWatcher<CTX, A, B> | DecoratorMethodWatcher<CTX, A, B>
) => Function;
