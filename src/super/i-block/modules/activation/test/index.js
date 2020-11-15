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
		describe('deactivate', () => {
			it('sets inactive status to the component', async () => {
				const
					status = await dummyComponent.evaluate((ctx) => (ctx.deactivate(), ctx.componentStatus)),
					isActivated = await dummyComponent.evaluate((ctx) => ctx.isActivated);

				expect(status).toBe('inactive');
				expect(isActivated).toBeFalse();
			});

			it('fires beforeDeactivate event', async () => {
				const eventPromise = dummyComponent.evaluate((ctx) => new Promise((res) => {
					ctx.once('beforeDeactivate', res);
					ctx.deactivate();
				}));

				await expectAsync(eventPromise).toBeResolved();
			});

			it('fires deactivated event', async () => {
				const eventPromise = dummyComponent.evaluate((ctx) => new Promise((res) => {
					ctx.once('deactivated', res);
					ctx.deactivate();
				}));

				await expectAsync(eventPromise).toBeResolved();
			});
		});

		describe('activate', () => {
			it('sets ready status to the component', async () => {
				await dummyComponent.evaluate((ctx) => ctx.deactivate());

				const
					status = await dummyComponent.evaluate((ctx) => (ctx.activate(), ctx.componentStatus)),
					isActivated = await dummyComponent.evaluate((ctx) => ctx.isActivated);

				expect(status).toBe('ready');
				expect(isActivated).toBeTrue();
			});

			it('fires beforeActivate event', async () => {
				const eventPromise = dummyComponent.evaluate((ctx) => new Promise((res) => {
					ctx.once('beforeActivate', res);
					ctx.deactivate();
					ctx.activate();
				}));

				await expectAsync(eventPromise).toBeResolved();
			});

			it('fires activated event', async () => {
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
