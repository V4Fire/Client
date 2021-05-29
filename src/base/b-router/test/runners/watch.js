/*!
* V4Fire Client Core
* https://github.com/V4Fire/Client
*
* Released under the MIT license
* https://github.com/V4Fire/Client/blob/master/LICENSE
*/

// @ts-check

/**
 * @typedef {import('playwright').Page} Page
 */

const
	{initRouter} = include('src/base/b-router/test/helpers');

/** @param {Page} page */
module.exports = (page) => {
	let
		root;

	beforeAll(async () => {
		root = await initRouter(page);
	});

	describe('b-router using watchers', () => {
		it('watching for `route` changes', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					result = {routeChanges: [], queryChanges: []};

				await router.push('/second');
				await router.push('/');

				result.initialQuery = location.search;
				result.initialContent = ctx.route.meta.content;

				const
					group = {group: Math.random().toString()};

				ctx.watch('route', group, (val, old) => {
					result.routeChanges.push([
						Object.fastClone(val.query),
						Object.fastClone(old?.query)
					]);
				}, group);

				ctx.watch('route.query', {deep: true, withProto: true, collapse: false, ...group}, (val, old) => {
					result.queryChanges.push([Object.fastClone(val), Object.fastClone(old)]);
				}, group);

				await router.push('second', {query: {foo: 1}});
				await router.push('second', {query: {foo: 2}});
				ctx.async.terminateWorker(group);

				await router.push('second', {query: {foo: 3}});
				return result;

			})).toEqual({
				initialContent: 'Main page',
				initialQuery: '',
				routeChanges: [[{foo: 1}, undefined]],
				queryChanges: [[{foo: 1}, undefined], [{foo: 2}, {foo: 1}]]
			});
		});

		it('linking for the `route` property', async () => {
			expect(await root.evaluate(async (ctx) => {
				const
					{router} = ctx;

				const
					result = {};

				await router.push('/second');
				await router.push('/');

				result.initialQuery = location.search;
				result.initialContent = ctx.route.meta.content;

				const
					group = {group: Math.random().toString()},
					watchOpts = {deep: true, withProto: true, collapse: false, ...group};

				result.initialRouteLink =
					ctx.sync.link(['routeLink', 'route.query'], watchOpts, (query) => Object.fastClone(query));

				await router.push('second', {query: {foo: 1}});
				result.routeLink = ctx.routeLink;
				ctx.async.terminateWorker(group);

				await router.push('second', {query: {foo: 3}});
				result.routeLink = ctx.routeLink;

				return result;

			})).toEqual({
				initialContent: 'Main page',
				initialQuery: '',
				initialRouteLink: {},
				routeLink: {foo: 1}
			});
		});
	});
};
