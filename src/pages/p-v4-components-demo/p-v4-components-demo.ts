/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:pages/p-v4-components-demo/README.md]]
 * @packageDocumentation
 */

import Checkbox from 'models/demo/checkbox';

//#if demo
import 'models/demo/session';
//#endif

import iStaticPage, { component, system, field } from 'super/i-static-page/i-static-page';
import RequestError from 'core/request/error';

export * from 'super/i-static-page/i-static-page';

console.time('Initializing');

/**
 * Page with component demo-s.
 * Basically it uses with component tests.
 */
@component({root: true})
export default class pV4ComponentsDemo extends iStaticPage {
	/**
	 * Parameter to test
	 */
	@system()
	rootParam?: number;

	/**
	 * Field for tests purposes
	 */
	@field()
	someField: unknown = {some: 'val'};

	protected beforeCreate(): void {
		console.time('Render');
	}

	protected mounted(): void {
		console.timeEnd('Render');
		console.timeEnd('Initializing');
	}

	protected async makeRequest(): Promise<void> {
		let errorFromServerResponse;

		try {
			// https://beeceptor.com/console/v4-test-json
			// отвечает со статусом 400 и телом ответа {"error":{"code":400,"message":"test message","description":"test desc","title":"test tile"}}
			await new Checkbox().get();

		} catch (err) {
			try {
				if (err instanceof RequestError) {
					errorFromServerResponse = await err.details.response?.json();
				}

			} catch (e) {
					console.log('error while parsing json', e);
			}
		}

		console.log('error from server response', errorFromServerResponse);
	}
}
