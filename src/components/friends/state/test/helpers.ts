/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import { Component } from 'tests/helpers';

import { componentData } from 'components/friends/state/test/const';
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
 *
 * @param target
 * @param waitNextTick
 */
export async function setValues(target: JSHandle<bFriendsStateDummy>, waitNextTick: boolean = true): Promise<void> {
	await target.evaluate(async (ctx, {componentData, wait}) => {
		ctx.systemField = componentData.systemField;
		if (wait) {
			await ctx.nextTick();
		}

		// eslint-disable-next-line require-atomic-updates
		ctx.regularField = componentData.regularField;
		if (wait) {
			await ctx.nextTick();
		}

		void ctx.setMod('foo', componentData['mods.foo']);
		await ctx.nextTick();

	}, {componentData, wait: waitNextTick});
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
