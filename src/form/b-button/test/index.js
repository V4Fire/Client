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
	describe('b-button', () => {
		let
			buttonNode,
			buttonCtx;

		const renderButton = async (props = {}) => {
			await page.evaluate(() => {
				const scheme = [
					{
						attrs: {
							id: 'target',
							...props
						}
					}
				];

				globalThis.renderComponents('b-button', scheme);
			});

			buttonNode = await page.waitForSelector('#target');
			buttonCtx = await h.component.getComponentById(page, 'target');
		};

		beforeEach(async () => {
			await page.evaluate(() => {
				globalThis.removeCreatedComponents();
			});
		});

		describe('buttonType', () => {
			xit('file', async () => {
				// ...
			});

			xit('submit', async () => {
				// ...
			});

			xit('link', async () => {
				// ...
			});
		});

		describe('accept', () => {
			xit('.txt', async () => {
				// ...
			});
		});

		describe('href', () => {
			it('https://someurl.com', async () => {
				await renderButton({
					href: 'https://someurl.com'
				});
			});
		});

		describe('autofocus', () => {
			xit('true', async () => {
				// ...
			});
		});

		describe('tabIndex', () => {
			xit('-1', async () => {
				// ...
			});

			xit('1', async () => {
				// ...
			});
		});

		describe('preIcon', () => {
			xit('dropdown', async () => {
				// ...
			});
		});

		describe('preIconComponent', () => {
			xit('b-icon', async () => {
				// ...
			});
		});

		describe('hint', () => {
			xit('not shown if the cursor is not hovering', async () => {
				// ...
			});

			xit('shown if the cursor is hovering', async () => {
				// ...
			});
		});

		describe('isFocused', () => {
			xit('true if the button is focused', async () => {
				// ...
			});

			xit('false if the button is not focused', async () => {
				// ...
			});
		});

		describe('click event', () => {
			xit('emits on click', async () => {
				// ...
			});

			xit('does not emit an event without click', async () => {
				// ...
			});
		});

		describe('change event', () => {
			xit('emits on file change', async () => {
				// ...
			});
		});

	});
};
