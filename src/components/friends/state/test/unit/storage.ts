/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import { renderDummy, setValues, getValues } from 'components/friends/state/test/helpers';

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
});
