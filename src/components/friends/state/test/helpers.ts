/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import { Component } from 'tests/helpers';

import type bFriendsStateDummy from 'components/friends/state/test/b-friends-state-dummy/b-friends-state-dummy';

/**
 * Returns the rendered `b-friends-state-dummy` component
 *
 * @param page
 * @param paramsOrAttrs
 */
export async function renderDummy(
	page: Page,
	paramsOrAttrs: RenderComponentsVnodeParams | RenderComponentsVnodeParams['attrs'] = {}
): Promise<JSHandle<bFriendsStateDummy>> {
	await Component.waitForComponentTemplate(page, 'b-friends-state-dummy');
	return Component.createComponent(page, 'b-friends-state-dummy', paramsOrAttrs);
}

/**
 * Sets dummy component's system, field, mod values
 * @param target
 */
export async function setValues(target: JSHandle<bFriendsStateDummy>): Promise<void> {
	await target.evaluate(async (ctx) => {
		ctx.systemField = 'bar';
		await ctx.nextTick();

		// eslint-disable-next-line require-atomic-updates
		ctx.regularField = 10;
		await ctx.nextTick();

		void ctx.setMod('foo', 'bla');
		await ctx.nextTick();
	});
}

/**
 * Returns dummy component's system, field, mod values
 * @param target
 */
export async function getValues(target: JSHandle<bFriendsStateDummy>): Promise<Dictionary> {
	return target.evaluate((ctx) => ({
		systemField: ctx.systemField,
		regularField: ctx.regularField,
		'mods.foo': ctx.mods.foo
	}));
}
