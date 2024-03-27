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

test.describe('<i-static-page> page meta data', () => {
	let root: JSHandle<iStaticPage>;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		root = await Component.waitForRoot(page);
	});

	test('should set and reset the page\'s title', async ({page}) => {
		const newTitle = 'Cool title';

		await root.evaluate((ctx, newTitle) => ctx.pageMetaData.title = newTitle, newTitle);

		await test.expect(root.evaluate((ctx) => ctx.pageMetaData.title)).toBeResolvedTo(newTitle);
		await test.expect(page).toHaveTitle(newTitle);

		await root.evaluate((ctx) => ctx.pageMetaData.title = '');

		await test.expect(root.evaluate((ctx) => ctx.pageMetaData.title)).toBeResolvedTo('');
		await test.expect(page).toHaveTitle('');
	});

	test('should set and reset the page\'s description', async ({page}) => {
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

	test('`addLink` should add link to the head of the page', async ({page}) => {
		const href = 'https://example.com/';
		await root.evaluate((ctx, href) => ctx.pageMetaData.setCanonicalLink(href), href);

		const linkHref = await root.evaluate((ctx) => {
			return ctx.pageMetaData.getCanonicalLink()?.href;
		});

		test.expect(linkHref).toEqual(href);
		await test.expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', href);
	});

	test('`addMeta` should add meta tag to the head of the page', async ({page}) => {
		const content = 'noindex';
		await root.evaluate((ctx, content) => ctx.pageMetaData.addMeta({name: 'robots', content}), content);

		const metaInfo = await root.evaluate((ctx) => {
			const metas = ctx.pageMetaData.findMetas({name: 'robots'});
			return {content: metas[0].content, length: metas.length};
		});

		test.expect(metaInfo.content).toEqual(content);
		test.expect(metaInfo.length).toEqual(1);
		await test.expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', content);
	});

	test('Sets/gets/removes canonical link to the head of the page', async ({page}) => {
		const
			href = 'https://example.com/',
			locator = page.locator('link[rel="canonical"]');

		await root.evaluate((ctx, href) => ctx.pageMetaData.setCanonicalLink(href), href);

		let canonical = await root.evaluate((ctx) => ctx.pageMetaData.getCanonicalLink());

		const element = await root.evaluate((ctx, href) => {
			const el = document.createElement('link');
			return Object.assign(el, {rel: 'canonical', href});
		}, href);

		test.expect(canonical).toEqual(element);
		await test.expect(locator).toHaveAttribute('href', href);

		await root.evaluate((ctx) => ctx.pageMetaData.removeCanonicalLink());

		canonical = await root.evaluate((ctx) => ctx.pageMetaData.getCanonicalLink());

		test.expect(canonical).toBeUndefined();
		await test.expect(locator).toBeHidden();
	});
});
