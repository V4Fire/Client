/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable require-atomic-updates */

import type { JSHandle, Page } from 'playwright';

import test from 'tests/config/unit/test';

import { Component } from 'tests/helpers';

import type bDummy from 'components/dummies/b-dummy/b-dummy';
import type iStaticPage from 'components/super/i-static-page/i-static-page';

test.describe('<i-static-page>', () => {
	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		root = await Component.waitForRoot(page);
	});

	test.describe('root modifiers', () => {
		test('should support CRUD operations', async () => {
			const scan = await root.evaluate((ctx) => {
				ctx.removeRootMod('foo');

				const res: any[] = [ctx.setRootMod('foo', 'bar')];

				res.push(ctx.getRootMod('foo'));
				res.push(ctx.removeRootMod('foo', 'bla'));
				res.push(ctx.getRootMod('foo'));

				res.push(ctx.removeRootMod('foo', 'bar'));
				res.push(ctx.getRootMod('foo'));

				ctx.setRootMod('foo', 'baz');

				res.push(ctx.getRootMod('foo'));
				res.push(ctx.removeRootMod('foo'));
				res.push(ctx.getRootMod('foo'));

				return res;
			});

			test.expect(scan).toEqual([
				true,
				'bar',

				false,
				'bar',

				true,
				undefined,

				'baz',
				true,
				undefined
			]);
		});

		test('should set modifier classes for the html root element', async ({page}) => {
			await root.evaluate((ctx) => {
				ctx.removeRootMod('foo');
				ctx.setRootMod('foo', 'bar');
			});

			await test.expect(page.locator(':root')).toHaveClass(/foo-bar/);

			await root.evaluate((ctx) => {
				ctx.removeRootMod('foo');
			});

			await test.expect(page.locator(':root')).not.toHaveClass(/foo-bar/);
		});

		test('should set modifier classes for the html root element prefixed with the provided `globalName`', async ({page}) => {
			const target = await renderDummy(page, {
				globalName: 'target'
			});

			await target.evaluate((ctx) => {
				ctx.removeRootMod('foo');
				ctx.setRootMod('foo', 'bar');
			});

			await test.expect(page.locator(':root')).toHaveClass(/target-foo-bar/);

			await target.evaluate((ctx) => {
				ctx.removeRootMod('foo');
			});

			await test.expect(page.locator(':root')).not.toHaveClass(/target-foo-bar/);
		});

		test('should set modifier classes for the html root element prefixed with the component name', async ({page}) => {
			const target = await renderDummy(page);

			await target.evaluate((ctx) => {
				ctx.removeRootMod('foo');
				ctx.setRootMod('foo', 'bar');
			});

			await test.expect(page.locator(':root')).toHaveClass(/b-dummy-foo-bar/);

			await target.evaluate((ctx) => {
				ctx.removeRootMod('foo');
			});

			await test.expect(page.locator(':root')).not.toHaveClass(/b-dummy-foo-bar/);
		});
	});

	test.describe('`locale`', () => {
		test('should set a locale of the root component and read it\'s value', async () => {
			await test.expect(root.evaluate((ctx) => Boolean(ctx.locale))).resolves.toBeTruthy();

			const locale = await root.evaluate((ctx) => {
				ctx.locale = 'ru';
				return ctx.locale;
			});

			test.expect(locale).toBe('ru');
		});

		test('should set the `lang` attribute of the html root element', async ({page}) => {
			await test.expect(page.locator(':root')).toHaveAttribute('lang', 'en');

			await root.evaluate((ctx) => {
				ctx.locale = 'ru';
			});

			await test.expect(page.locator(':root')).toHaveAttribute('lang', 'ru');
		});

		test('should be watchable', async () => {
			const scan = await root.evaluate(async (ctx) => {
				const res: any[] = [];

				ctx.locale = 'ru';
				ctx.watch('locale', (val, oldVal) => {
					res.push([val, oldVal]);
				});

				ctx.locale = 'en';
				await ctx.nextTick();

				ctx.locale = 'ru';
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toEqual([
				['en', undefined],
				['ru', 'en']
			]);
		});
	});

	test.describe('`reset`', () => {
		test('should emit the `reset` event on the globalEmitter when the `reset` method is invoked', async () => {
			const scan = await root.evaluate(async (ctx) => {
				let res = false;

				ctx.unsafe.globalEmitter.once('reset', () => {
					res = true;
				});

				ctx.reset();
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toBeTruthy();
		});

		test('should emit the `reset.silence` event on the globalEmitter when the `silence` method is invoked', async () => {
			const scan = await root.evaluate(async (ctx) => {
				let res = false;

				ctx.unsafe.globalEmitter.once('reset.silence', () => {
					res = true;
				});

				ctx.reset('silence');
				await ctx.nextTick();

				return res;
			});

			test.expect(scan).toBeTruthy();
		});
	});

	function renderDummy(
		page: Page,
		attrs: RenderComponentsVnodeParams['attrs'] = {}
	): Promise<JSHandle<bDummy>> {
		return Component.createComponent(page, 'b-dummy', attrs);
	}
});
