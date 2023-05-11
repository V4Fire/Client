/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bFriendsStateDummy from 'components/friends/state/test/b-friends-state-dummy/b-friends-state-dummy';

test.describe('friends/state using a storage', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test([
		'should reset state of the component between subsequent renders',
		'when `globalName` is not provided'
	].join(' '), async ({page}) => {
		let target = await renderDummy(page);

		await test.expect(getValues(target)).resolves.toEqual({
			systemField: 'foo',
			regularField: undefined,
			'mods.foo': undefined
		});

		await setValues(target);

		await Component.removeCreatedComponents(page);

		target = await renderDummy(page);

		await test.expect(getValues(target)).resolves.toEqual({
			systemField: 'foo',
			regularField: undefined,
			'mods.foo': undefined
		});
	});

	test([
		'should preserve state of the component between subsequent renders',
		'when `globalName` is provided'
	].join(' '), async ({page}) => {
		const globalName = Math.random();

		let target = await renderDummy(page, {
			globalName
		});

		await test.expect(getValues(target)).resolves.toEqual({
			systemField: 'foo',
			regularField: 0,
			'mods.foo': undefined
		});

		await setValues(target);

		await Component.removeCreatedComponents(page);

		target = await renderDummy(page, {
			globalName
		});

		await test.expect(getValues(target)).resolves.toEqual({
			systemField: 'bar',
			regularField: 10,
			'mods.foo': 'bla'
		});

		await target.evaluate((ctx) => ctx.unsafe.state.resetStorage());

		await test.expect(getValues(target)).resolves.toEqual({
			systemField: 'foo',
			regularField: 0,
			'mods.foo': undefined
		});
	});

	/**
	 * Returns the rendered `b-friends-state-dummy` component
	 *
	 * @param page
	 * @param paramsOrAttrs
	 */
	async function renderDummy(
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
	async function setValues(target: JSHandle<bFriendsStateDummy>): Promise<void> {
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
	async function getValues(target: JSHandle<bFriendsStateDummy>): Promise<Dictionary> {
		return target.evaluate((ctx) => ({
			systemField: ctx.systemField,
			regularField: ctx.regularField,
			'mods.foo': ctx.mods.foo
		}));
	}
});
