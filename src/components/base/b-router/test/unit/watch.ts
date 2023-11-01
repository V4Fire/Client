/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import { createInitRouter } from 'components/base/b-router/test/helpers';
import type { EngineName, RouterTestResult } from 'components/base/b-router/test/interface';

test.describe('<b-router> watch', () => {
	test.beforeEach(async ({demoPage}) => {
		await demoPage.goto();
	});

	test.describe('with `history` engine', () => {
		generateSpecs('history');
	});

	test.describe('with `in-memory` engine', () => {
		generateSpecs('in-memory');
	});
});

/**
 * Generates common specs for all router engines of "watch" runners
 * @param engineName
 */
function generateSpecs(engineName: EngineName) {
	/* eslint-disable playwright/require-top-level-describe */
	const initRouter = createInitRouter(engineName, {
		main: {
			path: '/',
			content: 'Main page'
		},

		second: {
			path: '/second',
			content: 'Second page'
		}
	});

	test(
		'should watch for the `route` property changes',

		async ({page}) => {
			const root = await initRouter(page);

			const scan = root.evaluate(async (ctx, engineName) => {
				const {router} = ctx;

				const result: RouterTestResult = {routeChanges: [], queryChanges: []};

				await router!.push('/second');
				await router!.push('/');

				result.initialQuery = engineName === 'history' ? location.search : '';
				result.initialContent = ctx.route?.meta.content;

				const group = {group: Math.random().toString()};

				ctx.watch('route', group, (val, old) => {
					result.routeChanges!.push([
						Object.fastClone(val.query),
						Object.fastClone(old?.query)
					]);
				});

				ctx.watch('route.query', {deep: true, withProto: true, collapse: false, ...group}, (val, old) => {
					result.queryChanges!.push([Object.fastClone(val), Object.fastClone(old)]);
				});

				await router!.push('second', {query: {foo: 1}});
				await router!.push(null, {query: {foo: 2}});

				ctx.unsafe.async.terminateWorker(group);

				await router!.push(null, {query: {foo: 3}});
				return result;

			}, engineName);

			await test.expect(scan).resolves.toEqual({
				initialContent: 'Main page',
				initialQuery: '',
				routeChanges: [[{foo: 1}, undefined]],
				queryChanges: [[{foo: 1}, undefined], [{foo: 2}, {foo: 1}]]
			});
		}
	);

	test(
		'should create a link to the `route` property',

		async ({page}) => {
			const root = await initRouter(page);

			const scan = root.evaluate(async (ctx, engineName) => {
				const
					{router} = ctx;

				const
					result: RouterTestResult = {};

				await router!.push('/second');
				await router!.push('/');

				result.initialQuery = engineName === 'history' ? location.search : '';
				result.initialContent = ctx.route?.meta.content;

				const
					group = {group: Math.random().toString()},
					watchOpts = {deep: true, withProto: true, collapse: false, ...group};

				result.initialRouteLink =
					ctx.sync.link(['routeLink', 'route.query'], watchOpts, (query) => Object.fastClone(query));

				await router!.push('second', {query: {foo: 1}});
				result.routeLink = (<any>ctx).routeLink;
				ctx.unsafe.async.terminateWorker(group);

				await router!.push('second', {query: {foo: 3}});
				result.routeLink = (<any>ctx).routeLink;

				return result;

			}, engineName);

			await test.expect(scan).resolves.toEqual({
				initialContent: 'Main page',
				initialQuery: '',
				initialRouteLink: {},
				routeLink: {foo: 1}
			});
		}
	);
}
