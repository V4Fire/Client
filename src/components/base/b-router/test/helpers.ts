/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { Component, Utils } from 'tests/helpers';

import type { StaticRoutes } from 'core/router';
import type { EngineName, InitRouter } from 'components/base/b-router/test/interface';
import type { Router } from 'components/base/b-router/interface';

/**
 * Returns a function to initialize the router on the page with the specified engine, routes and props
 *
 * @param engineName
 * @param [routes]
 * @param [props]
 */
export function createInitRouter(engineName: EngineName, routes?: StaticRoutes, props?: Dictionary): InitRouter {
	return async (page, initOptions = {}) => {
		if (initOptions.initialRoute === undefined && engineName === 'in-memory') {
			initOptions.initialRoute = 'main';
		}

		let
			engine: (() => Router) | undefined;

		switch (engineName) {
			case 'history':
				engine = Utils.evalInBrowser(() => globalThis.importModule('./src/core/router/engines/browser-history.ts').default);
				break;

			case 'in-memory':
				engine = Utils.evalInBrowser(() => globalThis.importModule('./src/core/router/engines/in-memory.ts').default);
				break;

			default:
				// Do nothing
		}

		await Component.createComponent(page, 'b-router', {
			id: 'target',

			engine,
			routes,
			initialRoute: initOptions.initialRoute ?? undefined,
			...props
		});

		return Component.waitForRoot(page);
	};
}
