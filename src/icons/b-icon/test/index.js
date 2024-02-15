/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	h = include('tests/helpers').default;

module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('b-icon', () => {
		it('empty rendering', async () => {
			const
				target = await init();

			expect(clrfx(await target.evaluate((ctx) => ctx.$el.innerHTML)))
				.toBe('<use data-update-on-id="id"></use>');
		});

		it('async rendering', async () => {
			const
				target = await init({value: 'foo'});

			expect(clrfx(await target.evaluate((ctx) => ctx.$el.innerHTML)))
				.toBe('<use data-update-on-id="id" xlink:href="#foo"></use>');

			await Promise.resolve('next tick');

			expect(clrfx(await target.evaluate((ctx) => ctx.$el.innerHTML)))
				.toBe('<use data-update-on-id="id" xlink:href="#foo"></use>');
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-icon', scheme);
		}, attrs);

		await h.bom.waitForIdleCallback(page);
		return h.component.waitForComponent(page, '#target');
	}

	function clrfx(str) {
		return str.replace(/data-update-on-id="\d+"/, 'data-update-on-id="id"');
	}
};
