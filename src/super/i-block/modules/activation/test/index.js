/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @typedef {import('playwright').Page} Page
 */

const
	h = include('tests/helpers');

/**
 * Starts a test
 *
 * @param {Page} page
 * @returns {void}
 */
module.exports = (page) => {
	let
		dummyComponent;

	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();

			globalThis.renderComponents('b-dummy', [
				{
					attrs: {
						id: 'test-dummy'
					},
					content: {}
				}
			]);
		});

		dummyComponent = await h.component.waitForComponent(page, '#test-dummy');
	});

	describe('i-block activation module', () => {
		describe('events', () => {
			it('beforeDeactivate', async () => {
				const eventPromise = dummyComponent.evaluate((ctx) => new Promise((res) => {
					ctx.once('beforeDeactivate', res);
					ctx.deactivate();
				}));

				await expectAsync(eventPromise).toBeResolved();
			});

			it('deactivated', async () => {
				const eventPromise = dummyComponent.evaluate((ctx) => new Promise((res) => {
					ctx.once('deactivated', res);
					ctx.deactivate();
				}));

				await expectAsync(eventPromise).toBeResolved();
			});

			it('beforeActivate', async () => {
				const eventPromise = dummyComponent.evaluate((ctx) => new Promise((res) => {
					ctx.once('beforeActivate', res);
					ctx.deactivate();
					ctx.activate();
				}));

				await expectAsync(eventPromise).toBeResolved();
			});

			it('activated', async () => {
				const eventPromise = dummyComponent.evaluate((ctx) => new Promise((res) => {
					ctx.once('activated', res);
					ctx.deactivate();
					ctx.activate();
				}));

				await expectAsync(eventPromise).toBeResolved();
			});
		});
	});
};
