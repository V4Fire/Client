/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';

import type bForm from 'components/form/b-form/b-form';
import type bCheckbox from 'components/form/b-checkbox/b-checkbox';

import Component from 'tests/helpers/component';

/**
 * Renders the `bForm` component with the environment to test
 *
 * @param page
 * @param attrs
 */
export async function renderFormAndEnvironment(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bForm>> {
	await Component.removeCreatedComponents(page);

	const
		formConverter = (v) => v.reduce((res: number, el) => res + Number(el), 0);

	const scheme = [
		{
			children: {
				default: {
					type: 'b-form',

					attrs: {
						id: 'my-form',
						'data-id': 'target',
						...attrs,

						action: attrs.action
					}
				}
			}
		},

		{
			children: {
				default: {
					type: 'b-checkbox',
					attrs: {
						name: 'adult',
						form: 'my-form',
						validators: [['required', {message: 'REQUIRED!'}]]
					}
				}
			}
		},

		{
			children: {
				default: {
					type: 'b-hidden-input',

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
			children: {
				default: {
					type: 'b-hidden-input',

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
			children: {
				default: {
					type: 'b-hidden-input',

					attrs: {
						name: 'user',
						value: 7,
						form: 'another-form'
					}
				}
			}
		},

		{
			children: {
				default: {
					type: 'b-hidden-input',

					attrs: {
						value: 9,
						form: 'my-form'
					}
				}
			}
		}
	];

	await Component.createComponents(page, 'b-dummy', scheme);

	return Component.waitForComponentByQuery(page, '[data-id="target"]');
}

/**
 * Checks all checkboxes associated with the specified form
 * @param form - the form target
 */
export async function checkCheckboxes(form: JSHandle<bForm>): Promise<void> {
	await form.evaluate(async (ctx) => {
		Object.forEach(await ctx.elements, (el) => {
			if (el.componentName === 'b-checkbox') {
				void (<bCheckbox>el).toggle();
			}
		});
	});
}

/**
 * Intercepts all `/form` requests
 * @param page
 */
export function interceptFormRequest(page: Page): Promise<void> {
	return page.route(/\/api/, (r) => {
		const
			req = r.request();

		const
			chunks = (new URL(req.url()).pathname).split('/'),
			normalizedUrl = (chunks.splice(0, 2), `/${chunks.join('/')}`);

		if (req.method() === 'POST') {
			return r.fulfill({
				contentType: 'application/json',
				status: 200,
				body: JSON.stringify([normalizedUrl, 'POST', req.postDataJSON()])
			});
		}

		if (req.method() === 'PUT') {
			return r.fulfill({
				contentType: 'application/json',
				status: 200,
				body: JSON.stringify(['PUT', req.postDataJSON()])
			});
		}

		return r.continue();
	});
}
