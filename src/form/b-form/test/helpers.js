// @ts-check

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
	h = include('tests/helpers').default;

/**
 * Creates the `bForm` component with the environment to test
 *
 * @param {Page} page
 * @param {Object=} attrs
 * @returns {!Promise<CanUndef<Playwright.JSHandle>>}
 */
exports.createFormAndEnvironment = async (page, attrs = {}) => {
	await page.evaluate((attrs) => {
		globalThis.removeCreatedComponents();

		const
			formConverter = (v) => v.reduce((res, el) => res + Number(el), 0);

		const scheme = [
			{
				content: {
					default: {
						tag: 'b-form',

						attrs: {
							id: 'my-form',
							'data-id': 'target',
							...attrs,

							// eslint-disable-next-line no-eval
							action: /new /.test(attrs.action) ? eval(attrs.action) : attrs.action
						}
					}
				}
			},

			{
				content: {
					default: {
						tag: 'b-checkbox',
						attrs: {
							name: 'adult',
							form: 'my-form',
							validators: [['required', {msg: 'REQUIRED!'}]]
						}
					}
				}
			},

			{
				content: {
					default: {
						tag: 'b-input-hidden',

						attrs: {
							name: 'user',
							value: '1',
							form: 'my-form',
							formConverter
						}
					}
				}
			},

			{
				content: {
					default: {
						tag: 'b-input-hidden',

						attrs: {
							name: 'user',
							value: 2,
							default: 5,
							form: 'my-form'
						}
					}
				}
			},

			{
				content: {
					default: {
						tag: 'b-input-hidden',

						attrs: {
							name: 'user',
							value: 7,
							form: 'another-form'
						}
					}
				}
			},

			{
				content: {
					default: {
						tag: 'b-input-hidden',

						attrs: {
							value: 9,
							form: 'my-form'
						}
					}
				}
			}
		];

		globalThis.renderComponents('b-dummy', scheme);
	}, attrs);

	return h.component.waitForComponent(page, '[data-id="target"]');
};

/**
 * Checks all associated with the specified form checkboxes
 *
 * @param {Playwright.JSHandle} form - form target
 * @returns {!Promise<void>}
 */
exports.checkCheckboxes = async (form) => {
	await form.evaluate(async (ctx) => {
		Object.forEach(await ctx.elements, (el) => {
			if (el.componentName === 'b-checkbox') {
				el.toggle();
			}
		});
	});
};
