/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import type bSelect from 'components/form/b-select/b-select';
import { Component, DOM } from 'tests/helpers';

/**
 * Returns the rendered `b-select` component
 *
 * @param page
 * @param paramsOrAttrs
 */
export function renderSelect(
	page: Page,
	paramsOrAttrs: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bSelect>> {
	return Component.createComponent(page, 'b-select', paramsOrAttrs);
}

/**
 * Returns a selector for the element
 * @param elName
 */
export const createSelector = DOM.elNameSelectorGenerator('b-select');

/**
 * Checks if the component `value` is equal to the specified
 *
 * @param target
 * @param value
 */
export async function assertValueIs(target: JSHandle<bSelect>, value: unknown): Promise<void> {
	await test.expect(
		target.evaluate((ctx) => Object.isSet(ctx.value) ? [...ctx.value] : ctx.value)
	).resolves.toEqual(value);
}

/**
 * Checks if the component `fromValue` is equal to the specified
 *
 * @param target
 * @param value
 */
export async function assertFormValueIs(target: JSHandle<bSelect>, value: unknown): Promise<void> {
	await test.expect(target.evaluate((ctx) => ctx.formValue)).resolves.toEqual(value);
}

/**
 * Sets the component value
 *
 * @param target
 * @param value
 */
export async function setValue(target: JSHandle<bSelect>, value: string | number | undefined): Promise<void> {
	await target.evaluate((ctx, value) => {
		ctx.value = value;
	}, value);
}
