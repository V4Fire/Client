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
	h = include('tests/helpers');

/** @param {Page} page */
module.exports = (page) => {
	beforeEach(async () => {
		await page.evaluate(() => {
			globalThis.removeCreatedComponents();
		});
	});

	describe('i-block base props', () => {
		it('`rootTag`', async () => {
			const target = await init({
				rootTag: 'main'
			});

			expect(await target.evaluate((ctx) => ctx.$el.tagName)).toBe('MAIN');
		});

		it('`mods`', async () => {
			const target = await init({
				mods: {
					foo: 1,
					bla: true,
					baz: 'ban'
				}
			});

			expect(
				await target.evaluate((ctx) => Object.fastClone(ctx.mods))

			).toEqual({
				foo: '1',
				bla: 'true',
				baz: 'ban'
			});
		});

		it('passing modifiers as props', async () => {
			const target = await init({
				exterior: 'foo',
				diff: true
			});

			expect(
				await target.evaluate((ctx) => Object.fastClone(ctx.mods))

			).toEqual({
				exterior: 'foo',
				diff: 'true'
			});
		});

		it('`stage`', async () => {
			const target = await init({
				stage: 'main'
			});

			expect(await target.evaluate((ctx) => ctx.stage)).toBe('main');
		});

		it('`activatedProp`', async () => {
			const target = await init({
				activatedProp: false
			});

			expect(await target.evaluate((ctx) => ctx.isActivated)).toBeFalse();
		});

		it('`classes`', async () => {
			const target = await init({
				classes: {
					wrapper: 'baz'
				}
			});

			expect(
				await target.evaluate((ctx) => ctx.block.element('wrapper').classList.contains('baz'))
			).toBeTrue();
		});

		it('`styles`', async () => {
			const target = await init({
				styles: {
					wrapper: 'color: red;'
				}
			});

			expect(
				await target.evaluate((ctx) => ctx.block.element('wrapper').getAttribute('style'))
			).toBe('color: red;');
		});
	});

	async function init(attrs = {}) {
		await page.evaluate((attrs = {}) => {
			const scheme = [
				{
					attrs: {
						id: 'target',
						...attrs
					}
				}
			];

			globalThis.renderComponents('b-dummy', scheme);
		}, attrs);

		return h.component.waitForComponent(page, '#target');
	}
};
