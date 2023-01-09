/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import test from 'tests/config/unit/test';

import Component from 'tests/helpers/component';

test.describe('PageMetaData', () => {
	let root;

	test.beforeEach(async ({demoPage, page}) => {
		await demoPage.goto();
		root = await Component.waitForRoot(page);
	});

	test('should set and reset title of page', async () => {
		const
			newTitle = 'Cool title';

		await root.evaluate(
			(rootCtx, newTitle) => rootCtx.PageMetaData.title = newTitle,
			newTitle
		);

		test.expect(await root.evaluate((rootCtx) => rootCtx.PageMetaData.title)).toBe(newTitle);
		test.expect(await root.evaluate(() => document.title)).toBe(newTitle);

		await root.evaluate((rootCtx) => rootCtx.PageMetaData.title = '');
		test.expect(await root.evaluate((rootCtx) => rootCtx.PageMetaData.title)).toBe('');
	});

	test('should set and reset meta tag descripation on page', async () => {
		const
			newDescription = 'Cool description';

		await root.evaluate(
			(rootCtx, newDescription) => rootCtx.PageMetaData.description = newDescription,
			newDescription
		);

		test.expect(await root.evaluate((rootCtx) => rootCtx.PageMetaData.description)).toBe(newDescription);
		const descriptionValueFromDOM = await root.evaluate(
			() => {
				const metaElements = [].filter.call(document.getElementsByTagName('meta'), ((item) => item.name === 'description'));
				return metaElements[0].content;
			}
		);
		test.expect(descriptionValueFromDOM).toBe(newDescription);

		await root.evaluate(() => {
			const metaElements = [].filter.call(document.getElementsByTagName('meta'), ((item) => item.name === 'description'));
			metaElements[0].remove();
		});

		await root.evaluate((rootCtx) => rootCtx.PageMetaData.description = '');
		test.expect(await root.evaluate((rootCtx) => rootCtx.PageMetaData.description)).toBe('');
	});

	test('link', async () => {
		const href = 'https://edadeal.ru/';
		await root.evaluate((rootCtx, href) => rootCtx.PageMetaData.addLink({rel: 'canonical', href}), href);

		const linkInfo = await root.evaluate((rootCtx) => {
			const links = rootCtx.PageMetaData.getLinks({rel: 'canonical'});
			return {href: links[0].href, length: links.length};
		});

		test.expect(linkInfo.href).toEqual(href);
		test.expect(linkInfo.length).toEqual(1);
	});

	test('meta', async () => {
		const content = 'noindex';
		await root.evaluate((rootCtx, content) => rootCtx.PageMetaData.addMeta({name: 'robots', content}), content);

		const metaInfo = await root.evaluate((rootCtx) => {
			const metas = rootCtx.PageMetaData.getMeta({name: 'robots'});
			return {content: metas[0].content, length: metas.length};
		});

		test.expect(metaInfo.content).toEqual(content);
		test.expect(metaInfo.length).toEqual(1);

		await root.evaluate((rootCtx, content) => rootCtx.PageMetaData.addMeta({name: 'robots', content}), content);
	});
});
