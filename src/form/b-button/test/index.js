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

/** @param {Page} page */
module.exports = (page) => {
	describe('b-button', () => {
		beforeAll(async () => {
			await page.evaluate(() => {
				globalThis.removeCreatedComponents();

				const scheme = [
					{
						attrs: {
							id: 'target'
						}
					}
				];

				globalThis.renderComponents('b-button', scheme);
			});
		});

		it('getting a component instance from a DOM node', async () => {
			const
				component = await (await page.$('.b-button')).getProperty('component'),
				componentName = await component.getProperty('componentName');

			expect(await componentName.jsonValue()).toBe('b-button');
		});

		describe('buttonType', () => {
			it('file', async () => {
				// ...
			});

			it('submit', async () => {
				// ...
			});

			it('link', async () => {
				// ...
			});
		});

		describe('accept', () => {
			it('.txt', async () => {
				// ...
			});
		});

		describe('href', () => {
			it('https://someurl.com', async () => {
				// ...
			});
		});

		describe('autofocus', () => {
			it('true', async () => {
				// ...
			});
		});

		describe('tabIndex', () => {
			it('-1', async () => {
				// ...
			});

			it('1', async () => {
				// ...
			});
		});

		describe('preIcon', () => {
			it('dropdown', async () => {
				// ...
			});
		});

		describe('preIconComponent', () => {
			it('b-icon', async () => {
				// ...
			});
		});

		describe('hint', () => {
			it('not shown if the cursor is not hovering', async () => {
				// ...
			});

			it('shown if the cursor is hovering', async () => {
				// ...
			});
		});

		describe('isFocused', () => {
			it('true if the button is focused', async () => {
				// ...
			});

			it('false if the button is not focused', async () => {
				// ...
			});
		});

		describe('click event', () => {
			it('emits on click', async () => {
				// ...
			});

			it('does not emit an event without click', async () => {
				// ...
			});
		});

		describe('change event', () => {
			it('emits on file change', async () => {
				// ...
			});
		});

	});
};
