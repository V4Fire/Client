/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';
import Utils from 'tests/helpers/utils';

import type * as DependenciesAPI from 'core/init';

test.describe('core/init/dependencies', () => {
	let
		dependenciesAPI: JSHandle<typeof DependenciesAPI>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		dependenciesAPI = await Utils.import(page, 'core/init/dependencies');
	});

	test.describe('`createDependencyIterator`', () => {
		test('all dependencies should be executed in topological order', async () => {
			const res = await dependenciesAPI.evaluate(async ({createDependencyIterator, dependency}) => {
				const scan: string[] = [];

				const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

				const tasks = createDependencyIterator({
					a: async () => {
						await sleep(50);
						scan.push('a');
					},

					b: dependency(async () => {
						await sleep(20);
						scan.push('b');
					}, 'a'),

					// eslint-disable-next-line @typescript-eslint/require-await
					c: dependency(async () => {
						scan.push('c');
					}, 'a', 'b'),

					// eslint-disable-next-line @typescript-eslint/require-await
					d: dependency(async () => {
						scan.push('d');
					}, 'c'),

					// eslint-disable-next-line @typescript-eslint/require-await
					e: dependency(async () => {
						scan.push('e');
					}, '*'),

					// eslint-disable-next-line @typescript-eslint/require-await
					f: dependency(async () => {
						scan.push('f');
					}, '*')
				});

				await Promise.all([...tasks].map(([_, dep]) => dep.fn(Object.cast({}))));
				return scan;
			});

			test.expect(res).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
		});

		test('circular references should lead to exception #1', async () => {
			const res = await dependenciesAPI.evaluate(({createDependencyIterator, dependency}) => {
				const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

				const tasks = createDependencyIterator({
					a: dependency(async () => {
						await sleep(50);
					}, 'c'),

					b: dependency(async () => {
						await sleep(20);
					}, 'a'),

					c: dependency(async () => {
						await sleep(10);
					}, 'a', 'b')
				});

				try {
					Array.from(tasks);

				} catch (err) {
					return err.message;
				}
			});

			test.expect(res).toBe('A circular reference was found between "c" and "a" dependencies');
		});

		test('circular references should lead to exception #2', async () => {
			const res = await dependenciesAPI.evaluate(({createDependencyIterator, dependency}) => {
				const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

				const tasks = createDependencyIterator({
					a: dependency(async () => {
						await sleep(50);
					}, '*'),

					b: dependency(async () => {
						await sleep(20);
					}, 'a'),

					c: dependency(async () => {
						await sleep(10);
					}, 'a', 'b')
				});

				try {
					Array.from(tasks);

				} catch (err) {
					return err.message;
				}
			});

			test.expect(res).toBe('A circular reference was found between "b" and "a" dependencies');
		});
	});
});
