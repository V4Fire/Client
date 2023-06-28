/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { Locator, Page } from 'playwright';

import { Component } from 'tests/helpers';

import type { Listener } from 'components/directives/bind-with';
import type { BindWithTestInfo } from 'components/directives/bind-with/test/interface';

/**
 * A handler to pass as .then()/.catch() in v-bind-with
 *
 * @param element - The target element
 * @param args - Args provided by v-bind-with trigger (on/path/callback...)
 */
function handler(element: HTMLElement, ...args: any[]) {

	const previousInfo: Partial<BindWithTestInfo> =
		JSON.parse(element.getAttribute('data-test-bind-with') ?? '{}');

	const newInfo: BindWithTestInfo = {
		calls: previousInfo.calls ?? [],
		errorCalls: previousInfo.errorCalls ?? []
	};

	const preparedArgs = args.map(
		(arg: any) => {
			// Avoid converting circular structure to JSON
			try {
				JSON.stringify(arg);
			} catch (e) {
				return null;
			}

			return arg;
		}
	);

	let callDestination: keyof BindWithTestInfo = 'calls';

	if (args.length > 0 && args[0] instanceof Error) {
		callDestination = 'errorCalls';
	}

	newInfo[callDestination].push({
		args: preparedArgs
	});

	element.setAttribute('data-test-bind-with', JSON.stringify(newInfo));
}

/**
 * Force put our handlers to given v-bind-with listener.
 * @param listener - A v-bind-with listener to process
 */
function addTestHandlersToListener(listener: Partial<Listener>) {
	return {
		...listener,
		then: handler,
		catch: handler
	};
}

/**
 * Create a <div> with v-bind-with set by test code.
 *
 * @param page - The page.
 * @param bindWithValue - Value to pass to v-bind-with
 */
export async function createDivForBindWithTest(
	page: Page, bindWithValue: CanArray<Partial<Listener>>
): Promise<Locator> {
	await Component.createComponent(page, 'div', {
		'v-bind-with': Object.isArray(bindWithValue) ?
			bindWithValue.map(addTestHandlersToListener) :
			addTestHandlersToListener(bindWithValue),
		'data-testid': 'div'
	});

	return page.getByTestId('div');
}

/**
 * Get v-bind-with calls info by given locator
 * @param locator - The source locator
 */
export async function getBindWithTestInfo(
	locator: Locator
): Promise<BindWithTestInfo | null> {
	const attrValue = await locator.getAttribute('data-test-bind-with');

	if (attrValue == null) {
		return null;
	}

	return <BindWithTestInfo>JSON.parse(attrValue);
}
