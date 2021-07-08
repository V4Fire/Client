/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Playwright.Page} page
 * @param {object} params
 * @returns {void}
 */
module.exports = (page, {browser, contextOpts}) => {
	const initialUrl = page.url();

	let
		component,
		context;

	describe('b-remote-provider', () => {
		beforeEach(async () => {
			context = await browser.newContext(contextOpts);

			page = await context.newPage();
			page.goto(initialUrl);
		});

		afterEach(() => context.close());
	});

	describe('should emit events', () => {
		let
			counter = 1;

		beforeEach(async () => {
			await page.unroute('**/api/*');
			await createRouteHandler(200, () => ({test: counter++}));
		});

		afterEach(() => counter = 1);

		it('`change`', async () => {
			await init({
				dataProvider: 'demo.List'
			});

			const changePayload = await component.evaluate((ctx) => new Promise((res) => {
				ctx.once('change', (_, v) => res(v));
				ctx.reload();
			}));

			expect(changePayload).toEqual({test: 2});
		});

		it('`addData`', async () => {
			await init({
				dataProvider: 'demo.List'
			});

			const addDataPromise = component.evaluate((ctx) => new Promise((res) => {
				ctx.once('addData', (_, v) => res(v));
				ctx.dp.add();
			}));

			await expectAsync(addDataPromise).toBeResolvedTo({test: 2});
		});

		it('`updData`', async () => {
			await init({
				dataProvider: 'demo.List'
			});

			const updDataPromise = component.evaluate((ctx) => new Promise((res) => {
				ctx.once('updData', (_, v) => res(v));
				ctx.dp.upd();
			}));

			await expectAsync(updDataPromise).toBeResolvedTo({test: 2});
		});

		it('`delData`', async () => {
			await init({
				dataProvider: 'demo.List'
			});

			const delDataPromise = component.evaluate((ctx) => new Promise((res) => {
				ctx.once('delData', (_, v) => res(v));
				ctx.dp.del();
			}));

			await expectAsync(delDataPromise).toBeResolvedTo({test: 2});
		});

		it('`error`', async () => {
			await init({
				dataProvider: 'demo.List'
			});

			await h.bom.waitForIdleCallback(page);
			await page.unroute('**/api/*');
			await createRouteHandler(500);

			const errorPromise = component.evaluate((ctx) => new Promise((res) => {
				ctx.once('error', () => res());
				ctx.reload();
			}));

			await expectAsync(errorPromise).toBeResolved();
		});
	});

	describe('providing a `field` to set', () => {
		beforeEach(async () => {
			await createRouteHandler();
		});

		it('stores `db` into the parent field', async () => {
			await init({
				dataProvider: 'demo.List',
				field: 'someField'
			});

			await page.waitForFunction(() => {
				// @ts-expect-error
				const root = document.getElementById('root-component').component;
				return root.someField?.test === 1;
			});

			const
				testVal = await (await h.component.getRoot(page)).evaluate((ctx) => ctx.someField);

			expect(testVal).toEqual({test: 1});
		});
	});

	async function createRouteHandler(status = 200, payloadReturner = () => ({test: 1})) {
		await page.route('**/api/*', (r) => r.fulfill({
			status,
			contentType: 'application/json',
			body: JSON.stringify(payloadReturner())
		}));
	}

	async function init(props) {
		await page.evaluate((props) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						'@updData': console.log,
						'@addData': console.log,
						'@delData': console.log,
						...props
					}
				}
			];

			globalThis.renderComponents('b-remote-provider', scheme);
		}, props);

		component = await h.component.waitForComponent(page, '#target');
	}
};
