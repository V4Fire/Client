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

import type { AsyncWatchOptions } from 'components/friends/sync';
import type { KeyGetter } from 'components/friends/field/interface';

import type bFriendsFieldDummy from 'components/friends/field/test/b-friends-field-dummy/b-friends-field-dummy';

test.describe('friends/field', () => {
	let target: JSHandle<bFriendsFieldDummy>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();

		// Render dummy component
		await Component.waitForComponentTemplate(page, 'b-friends-field-dummy');
		target = await Component.createComponent(page, 'b-friends-field-dummy', {p: {fooBar: 1}});
	});

	test.describe('`get`', () => {
		test('should get a prop value', async () => {
			await test.expect(target.evaluate((ctx) => ctx.field.get('p.fooBar'))).toBeResolvedTo(1);
		});
	});

	test('should get a prop value using custom getter', async () => {
		const value = await target.evaluate((ctx) => {
			const valueGetter = (prop, obj) => Object.get(obj, prop.camelize(false));
			return ctx.field.get('p.foo_bar', valueGetter);
		});

		test.expect(value).toBe(1);
	});

	test.describe('CRUD operations should work', () => {
		const watchOptions: AsyncWatchOptions = {
			deep: true,
			flush: 'sync',
			immediate: true,
			collapse: false
		};

		const testResults = [undefined, undefined, 1, 1, undefined, undefined];

		// Set watch options as a global variable so it can be used inside evaluate functions
		test.beforeEach(async ({page}) => {
			await page.evaluate((watchOptions) => {
				globalThis.watchOptions = watchOptions;
			}, watchOptions);
		});

		test.describe('on the system fields', () => {
			test('of the current component', async () => {
				await test.expect(performCRUD('tmp.foo.bar'))
					.resolves.toEqual(testResults);
			});

			test('of the third-party object', async () => {
				await test.expect(perform3rdPartyCRUD('tmp.foo.bar', 'r.tmp.foo.bar'))
					.resolves.toEqual(testResults);
			});

			test('of the component using custom getter', async () => {
				await test.expect(performCRUDusingCustomGetter('tmp.foo_bla.bar', 'tmp.fooBla.bar'))
					.resolves.toEqual(testResults);
			});

			test('of the third-party object using custom getter', async () => {
				await test.expect(perform3rdPartyCRUDusingCustomGetter('tmp.foo_bla.bar', 'r.tmp.fooBla.bar'))
					.resolves.toEqual(testResults);
			});
		});

		test.describe('on the regular fields', () => {
			test('of the current component', async () => {
				await test.expect(performCRUD('reactiveTmp.foo.bar'))
					.resolves.toEqual(testResults);
			});

			test('of the third-party object', async () => {
				await test.expect(perform3rdPartyCRUD('reactiveTmp.foo.bar', 'r.reactiveTmp.foo.bar'))
					.resolves.toEqual(testResults);
			});

			test('of the component using custom getter', async () => {
				await test.expect(performCRUDusingCustomGetter('reactiveTmp.foo_bla.bar', 'reactiveTmp.fooBla.bar'))
					.resolves.toEqual(testResults);
			});

			test('of the third-party object using custom getter', async () => {
				await test.expect(perform3rdPartyCRUDusingCustomGetter('reactiveTmp.foo_bla.bar', 'r.reactiveTmp.fooBla.bar'))
					.resolves.toEqual(testResults);
			});
		});

		/**
		 * Performs CRUD operations on the component and returns array of changes
		 * @param path
		 */
		function performCRUD(path: string): Promise<any[]> {
			return target.evaluate((ctx, {path}) => {
				const res: any[] = [ctx.field.get(path)];

				ctx.watch(path, watchOptions, (val) => {
					res.push(val);
				});

				ctx.field.set(path, 1);
				res.push(ctx.field.get(path));

				ctx.field.delete(path);
				res.push(ctx.field.get(path));

				return res;
			}, {path});

		}

		/**
		 * Performs CRUD operations on the 3rd-party object and returns array of changes
		 *
		 * @param path
		 * @param watchPath
		 */
		function perform3rdPartyCRUD(path: string, watchPath: string): Promise<any[]> {
			return target.evaluate((ctx, {path, watchPath}) => {
				const res: any[] = [ctx.field.get(path, ctx.r)];

				ctx.watch(watchPath, watchOptions, (val) => {
					res.push(val);
				});

				ctx.field.set(path, 1, ctx.r);
				res.push(ctx.field.get(path, ctx.r));

				ctx.field.delete(path, ctx.r);
				res.push(ctx.field.get(path, ctx.r));

				return res;
			}, {path, watchPath});
		}

		/**
		 * Performs CRUD operations on the component using custom getter and returns array of changes
		 *
		 * @param path
		 * @param watchPath
		 */
		function performCRUDusingCustomGetter(path: string, watchPath: string): Promise<any[]> {
			return target.evaluate((ctx, {path, watchPath}) => {
				const
					valueGetter = (prop, obj) => Object.get(obj, prop.camelize(false)),
					keyGetter = String.camelize(false);

				const res: any[] = [ctx.field.get(path, valueGetter)];

				ctx.watch(watchPath, watchOptions, (val) => {
					res.push(val);
				});

				ctx.field.set(path, 1, keyGetter);
				res.push(ctx.field.get(path, valueGetter));

				ctx.field.delete(path, keyGetter);
				res.push(ctx.field.get(path, valueGetter));

				return res;
			}, {path, watchPath});
		}

		/**
		 * Performs CRUD operations on the 3rd-party object using custom getter and returns array of changes
		 *
		 * @param path
		 * @param watchPath
		 */
		function perform3rdPartyCRUDusingCustomGetter(path: string, watchPath: string): Promise<any[]> {
			return target.evaluate((ctx, {path, watchPath}) => {
				const
					valueGetter = (prop, obj) => Object.get(obj, prop.camelize(false)),
					keyGetter = <KeyGetter<string>>String.camelize(false);

				const res: any[] = [ctx.field.get(path, ctx.r, valueGetter)];

				ctx.watch(watchPath, watchOptions, (val) => {
					res.push(val);
				});

				ctx.field.set(path, 1, ctx.r, keyGetter);
				res.push(ctx.field.get(path, ctx.r, valueGetter));

				ctx.field.delete(path, ctx.r, keyGetter);
				res.push(ctx.field.get(path, ctx.r, valueGetter));

				return res;
			}, {path, watchPath});
		}
	});
});
