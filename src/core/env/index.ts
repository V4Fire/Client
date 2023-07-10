/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { GlobalEnvironment } from 'core/component/state';

export * from '@v4fire/core/core/env';

/**
 * Takes an object and uses its properties to extend the global object.
 * For example, for SSR rendering, the proper functioning of APIs such as `document.cookie` or `location` is required.
 * Using this method, polyfills for all necessary APIs can be passed through.
 *
 * @param [env] - an object containing the environment for initialization
 */
export function initGlobalEnv(env?: object & {globalEnv?: GlobalEnvironment}): GlobalEnvironment {
	if (env?.globalEnv == null) {
		return {};
	}

	Object.entries(env.globalEnv).forEach(([key, value]) => {
		Object.defineProperty(globalThis, key, {
			configurable: true,
			value
		});
	});

	return env.globalEnv;
}
