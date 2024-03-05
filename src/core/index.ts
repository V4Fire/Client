/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import '@v4fire/core/core';
import { resolveAfterDOMLoaded } from 'core/event';

import initApp from 'core/init';

import * as session from 'core/session';
import SessionEngine from 'core/session/engines';

export * as cookies from 'core/cookies';
export * as session from 'core/session';
export * as kvStorage from 'core/kv-storage';

export { initApp };

//#unless runtime has storybook

if (SSR) {
	process.on('unhandledRejection', stderr);

} else {
	resolveAfterDOMLoaded()
		.then(() => {
			const
				targetToMount = document.querySelector<HTMLElement>('[data-root-component]'),
				rootComponentName = targetToMount?.getAttribute('data-root-component');

			return initApp(rootComponentName, {
				appId: Object.fastHash(Math.random()),

				cookies: document,
				session: session.from(SessionEngine),
				location: getLocationAPI(),

				targetToMount
			});

			function getLocationAPI(): URL {
				Object.defineProperties(location, {
					username: {
						configurable: true,
						enumerable: true,
						get: () => ''
					},

					password: {
						configurable: true,
						enumerable: true,
						get: () => ''
					},

					searchParams: {
						configurable: true,
						enumerable: true,
						get: () => new URLSearchParams(location.search)
					},

					toJSON: {
						configurable: true,
						enumerable: true,
						writable: false,
						value: () => location.toString()
					}
				});

				return Object.cast(location);
			}
		})

		.catch(stderr);
}

//#endunless
