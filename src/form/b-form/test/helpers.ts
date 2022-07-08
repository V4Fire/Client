/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { JSHandle, Page } from 'playwright';
import type bForm from 'form/b-form/b-form';
import type bCheckbox from 'form/b-checkbox/b-checkbox';
import Component from 'tests/helpers/component';

/**
 * Creates the `bForm` component with the environment to test
 *
 * @param page
 * @param attrs
 */
export async function createFormAndEnvironment(page: Page, attrs: Dictionary = {}): Promise<JSHandle<bForm>> {
	await Component.removeCreatedComponents(page);

	const
		formConverter = (v) => v.reduce((res, el) => <number>res + Number(el), 0);

	const scheme = [
		{
			content: {
				default: {
					tag: 'b-form',

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

	await Component.createComponents(page, 'b-dummy', <RenderParams[]>scheme);

	return Component.waitForComponentByQuery(page, '[data-id="target"]');
}

/**
 * Checks all associated with the specified form checkboxes
 * @param form - form target
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
 * Intercepts `/form` requests
 * @param page
 */
export function interceptFormRequest(page: Page): Promise<void> {
	return page.route(/\/api/, (r) => {
		const
			req = r.request();

		const
			splitted = (new URL(req.url()).pathname).split('/'),
			normalizedUrl = (splitted.splice(0, 2), `/${splitted.join('/')}`);

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
