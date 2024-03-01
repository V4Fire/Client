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
import createInitAppSemaphore from 'core/init/semaphore';

export * as cookies from 'core/cookies';
export { initApp, createInitAppSemaphore };

//#unless runtime has storybook

if (SSR) {
	process.on('unhandledRejection', stderr);

} else {
	resolveAfterDOMLoaded()
		.then(() => {
			const
				targetToMount = document.querySelector<HTMLElement>('[data-root-component]'),
				rootComponentName = targetToMount?.getAttribute('data-root-component'),
				ready = createInitAppSemaphore();

			return initApp(rootComponentName, {targetToMount, ready});
		})

		.catch(stderr);
}

//#endunless
