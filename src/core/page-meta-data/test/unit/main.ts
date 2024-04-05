/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle } from 'playwright';

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';

import type iStaticPage from 'components/super/i-static-page/i-static-page';

test.describe('core/page-meta-data', () => {
	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		root = await Component.waitForRoot(page);
	});

	test("should set and reset the page's title", async ({page}) => {
		const newTitle = 'Cool title';

		await root.evaluate((ctx, newTitle) => ctx.pageMetaData.title = newTitle, newTitle);

		await test.expect(root.evaluate((ctx) => ctx.pageMetaData.title)).toBeResolvedTo(newTitle);
		await test.expect(page).toHaveTitle(newTitle);

		await root.evaluate((ctx) => ctx.pageMetaData.title = '');

		await test.expect(root.evaluate((ctx) => ctx.pageMetaData.title)).toBeResolvedTo('');
		await test.expect(page).toHaveTitle('');
	});

	test("should set and reset the page's description", async ({page}) => {
		const
			newDescription = 'Cool description',
			metaDescriptionLocator = page.locator('meta[name="description"]');

		await root.evaluate(
			(ctx, newDescription) => ctx.pageMetaData.description = newDescription,
			newDescription
		);

		await test.expect(root.evaluate((ctx) => ctx.pageMetaData.description)).toBeResolvedTo(newDescription);
		await test.expect(metaDescriptionLocator).toHaveAttribute('content', newDescription);

		await root.evaluate((ctx) => ctx.pageMetaData.description = '');

		await test.expect(root.evaluate((ctx) => ctx.pageMetaData.description)).toBeResolvedTo('');
		await test.expect(metaDescriptionLocator).toHaveAttribute('content', '');
	});

	test.describe('managing `link` elements on the page', () => {
		test('`addLink` should add a new link tag to the head of the page', async () => {
			const attrs = {
				rel: 'prefetch',
				href: 'main.js'
			};

			const linkIsExists = await root.evaluate((ctx, attrs) => {
				ctx.pageMetaData.addLink(attrs);
				return document.head.querySelector(`link[rel="${attrs.rel}"][href="${attrs.href}"]`) != null;
			}, attrs);

			test.expect(linkIsExists).toBe(true);
		});

		test('`removeLinks` should removed link tags with the specified attributes from the page', async () => {
			const attrs: Dictionary<string> = {
				rel: 'prefetch',
				href: 'main.js'
			};

			const linkIsExists = await root.evaluate((ctx, attrs) => {
				ctx.pageMetaData.addLink(attrs);
				ctx.pageMetaData.removeLinks(attrs);
				return document.head.querySelector(`link[rel="${attrs.rel}"][href="${attrs.href}"]`) != null;
			}, attrs);

			test.expect(linkIsExists).toBe(false);
		});

		test('`findLinks` should return all added link elements with the specified attributes', async () => {
			await root.evaluate((ctx) => {
				ctx.pageMetaData.addLink({rel: 'prefetch', href: 'a.js'});
				ctx.pageMetaData.addLink({rel: 'prefetch', href: 'b.js'});
				ctx.pageMetaData.addLink({rel: 'prefetch', href: 'c.js'});
			});

			const addedLinks = await root.evaluate((ctx) =>
				ctx.pageMetaData.findLinks({rel: 'prefetch'}).map(({rel, href}) => ({rel, href})));

			test.expect(addedLinks).toEqual([
				{rel: 'prefetch', href: 'a.js'},
				{rel: 'prefetch', href: 'b.js'},
				{rel: 'prefetch', href: 'c.js'}
			]);
		});

		test("should set and remove the page's canonical link", async () => {
			const
				href = 'https://example.com/';

			let canonical = await root.evaluate((ctx, href) => {
				ctx.pageMetaData.setCanonicalLink(href);
				return ctx.pageMetaData.getCanonicalLink()?.href;
			}, href);

			await test.expect(linkIsExists()).resolves.toBe(true);
			test.expect(canonical).toEqual(href);

			await root.evaluate((ctx) => ctx.pageMetaData.removeCanonicalLink());
			canonical = await root.evaluate((ctx) => ctx.pageMetaData.getCanonicalLink()?.href);

			test.expect(canonical).toBeUndefined();
			await test.expect(linkIsExists()).resolves.toBe(false);

			function linkIsExists() {
				return root.evaluate((_, href) =>
					document.head.querySelector(`link[rel="canonical"][href="${href}"]`) != null, href);
			}
		});
	});

	test.describe('managing `meta` elements on the page', () => {
		test('`addMeta` should add a new meta-tag to the head of the page', async () => {
			const attrs = {
				name: 'keywords',
				content: 'example'
			};

			const metaIsExists = await root.evaluate((ctx, attrs) => {
				ctx.pageMetaData.addMeta(attrs);
				return document.head.querySelector(`meta[name="${attrs.name}"][content="${attrs.content}"]`) != null;
			}, attrs);

			test.expect(metaIsExists).toBe(true);
		});

		test('`removeMetas` should removed meta-tags with the specified attributes from the page', async () => {
			const attrs: Dictionary<string> = {
				name: 'keywords',
				content: 'example'
			};

			const metaIsExists = await root.evaluate((ctx, attrs) => {
				ctx.pageMetaData.addMeta(attrs);
				ctx.pageMetaData.removeMetas(attrs);
				return document.head.querySelector(`meta[name="${attrs.name}"][content="${attrs.content}"]`) != null;
			}, attrs);

			test.expect(metaIsExists).toBe(false);
		});

		test('`findMetas` should return all added meta-elements with the specified attributes', async () => {
			await root.evaluate((ctx) => {
				ctx.pageMetaData.addMeta({name: 'keywords', content: '1'});
				ctx.pageMetaData.addMeta({name: 'keywords', content: '2'});
				ctx.pageMetaData.addMeta({name: 'keywords', content: '3'});
			});

			const addedMetas = await root.evaluate((ctx) =>
				ctx.pageMetaData.findMetas({name: 'keywords'}).map(({name, content}) => ({name, content})));

			test.expect(addedMetas).toEqual([
				{name: 'keywords', content: '1'},
				{name: 'keywords', content: '2'},
				{name: 'keywords', content: '3'}
			]);
		});
	});
});
