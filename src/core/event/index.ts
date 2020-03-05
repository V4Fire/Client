/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/event/README.md]]
 * @packageDocumentation
 */

import SyncPromise from 'core/promise/sync';
import { deprecate } from 'core/functools';
export * from '@v4fire/core/core/event';

/**
 * Returns a promise that will be resolved after the DOMContentLoaded event
 */
export function resolveAfterDOMLoaded(): SyncPromise<void> {
	return new SyncPromise((resolve) => {
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', resolve);

		} else {
			resolve();
		}
	});
}

/**
 * @deprecated
 * @see [[resolveAfterDOMLoaded]]
 */
export const afterDOMLoaded = deprecate(
	{
		alternative: 'resolveAfterDOMLoaded'
	},

	function afterDOMLoaded(cb?: Function): SyncPromise<void> {
		const
			promise = resolveAfterDOMLoaded();

		if (cb) {
			promise.then(cb);
		}

		return promise;
	}
);
