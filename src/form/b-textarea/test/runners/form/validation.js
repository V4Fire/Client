/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

// @ts-check

/* eslint-disable max-lines */

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

	describe('b-textarea form API validation', () => {
		describe('`required`', () => {
			it('simple usage', async () => {
				const target = await init({
					validators: ['required']
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'Required field'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('Required field');

				await target.evaluate((ctx) => {
					ctx.value = '0';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();
			});

			it('`required` with parameters (an array form)', async () => {
				const target = await init({
					validators: [['required', {msg: 'REQUIRED!'}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('REQUIRED!');
			});

			it('`required` with parameters (an object form)', async () => {
				const target = await init({
					validators: [{required: {msg: 'REQUIRED!', showMsg: false}}]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toEqual({validator: 'required', error: false, msg: 'REQUIRED!'});

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('');
			});

			it('forcing validation by `actionChange`', async () => {
				const target = await init({
					validators: ['required']
				});

				await target.evaluate((ctx) => ctx.emit('actionChange'));

				expect(await target.evaluate((ctx) => ctx.block.element('error-box').textContent.trim()))
					.toBe('Required field');
			});
		});

		describe('`pattern`', () => {
			it('simple usage', async () => {
				const params = {
					pattern: '\\d'
				};

				const target = await init({
					value: '1456',
					validators: [['pattern', params]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = 'dddd';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'pattern',
					error: {name: 'NOT_MATCH', value: 'dddd', params},
					msg: 'A value must match the pattern'
				});
			});

			it('providing `min` and `max`', async () => {
				const params = {
					min: 2,
					max: 4
				};

				const target = await init({
					value: '123',
					validators: [['pattern', params]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '12';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '3414';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'pattern',
					error: {name: 'MIN', value: '1', params},
					msg: 'Value length must be at least 2 characters'
				});

				await target.evaluate((ctx) => {
					ctx.value = '3456879';
				});

				expect(await target.evaluate((ctx) => ctx.validate())).toEqual({
					validator: 'pattern',
					error: {name: 'MAX', value: '3456879', params},
					msg: 'Value length must be no more than 4 characters'
				});
			});

			it('providing `min`, `max` and `skipLength`', async () => {
				const target = await init({
					value: '12',
					validators: [['pattern', {min: 1, max: 3, skipLength: true}]]
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '1';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '341';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();

				await target.evaluate((ctx) => {
					ctx.value = '3456879';
				});

				expect(await target.evaluate((ctx) => ctx.validate()))
					.toBeTrue();
			});
		});

		async function init(attrs = {}) {
			await page.evaluate((attrs) => {
				const scheme = [
					{
						attrs: {
							'data-id': 'target',
							messageHelpers: true,
							...attrs
						}
					}
				];

				globalThis.renderComponents('b-textarea', scheme);
			}, attrs);

			return h.component.waitForComponent(page, '[data-id="target"]');
		}
	});
};
