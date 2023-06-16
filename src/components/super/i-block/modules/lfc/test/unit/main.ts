/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bSuperIBlockLfcDummy from 'components/super/i-block/test/b-super-i-block-lfc-dummy/b-super-i-block-lfc-dummy';

test.describe('<i-block> modules - lfc', () => {
	let target: JSHandle<bSuperIBlockLfcDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		target = await Component.createComponent(page, 'b-super-i-block-lfc-dummy');
	});

	test('`beforeCreate` state should be correct', async () => {
		await test.expect(
			target.evaluate((ctx) => ({
				beforeCreateHook: ctx.unsafe.tmp.beforeCreateHook,
				beforeCreateIsBefore: ctx.unsafe.tmp.beforeCreateIsBefore
			}))

		).resolves.toEqual({
			beforeCreateHook: 'beforeCreate',
			beforeCreateIsBefore: true
		});
	});

	test('`beforeDataCreate` state should be correct', async () => {
		await test.expect(
			target.evaluate((ctx) => ({
				fooBar: ctx.unsafe.tmp.fooBar,
				rightTimeHookFromBeforeCreate: ctx.unsafe.tmp.rightTimeHookFromBeforeCreate,
				rightTimeHookFromBeforeCreate2: ctx.unsafe.tmp.rightTimeHookFromBeforeCreate2,
				beforeDataCreateHook: ctx.unsafe.tmp.beforeDataCreateHook,
				beforeDataCreateIsBefore: ctx.unsafe.tmp.beforeDataCreateIsBefore,
				beforeDataCreateIsBeforeWithSkipping: ctx.unsafe.tmp.beforeDataCreateIsBeforeWithSkipping
			}))

		).resolves.toEqual({
			fooBar: 3,
			rightTimeHookFromBeforeCreate: 'beforeDataCreate',
			rightTimeHookFromBeforeCreate2: 'beforeDataCreate',
			beforeDataCreateHook: 'beforeDataCreate',
			beforeDataCreateIsBefore: true,
			beforeDataCreateIsBeforeWithSkipping: false
		});
	});

	test('`execCbAfterBlockReady` should be executed after the `block` became ready', async () => {
		await test.expect(
			target.evaluate((ctx) => ({
				blockReady: ctx.unsafe.tmp.blockReady,
				blockReadyIsBefore: ctx.unsafe.tmp.blockReadyIsBefore
			}))

		).resolves.toEqual({
			blockReady: true,
			blockReadyIsBefore: false
		});
	});

	test('`execCbAfterComponentCreated` should be executed after the component is created', async () => {
		await test.expect(
			target.evaluate((ctx) => ({
				componentCreatedHook: ctx.unsafe.tmp.componentCreatedHook,
				componentCreatedHook2: ctx.unsafe.tmp.componentCreatedHook2
			}))

		).resolves.toEqual({
			componentCreatedHook: 'created',
			componentCreatedHook2: 'created'
		});
	});
});
