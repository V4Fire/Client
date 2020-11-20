/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:super/i-block/modules/dependencies/README.md]]
 * @packageDocumentation
 */

import Friend from 'super/i-block/modules/friend';

import { dependenciesCache } from 'super/i-block/modules/dependencies/const';
import { Dependence } from 'super/i-block/modules/dependencies/interface';

export * from 'super/i-block/modules/dependencies/interface';

/**
 * Class to load the dynamic dependencies
 */
export default class Dependencies extends Friend {
	/**
	 * Loads the specified dependencies
	 */
	load(...deps: Dependence[]): CanPromise<boolean> {
		const
			toLoad = <Array<Promise<unknown>>>[];

		for (let i = 0; i < deps.length; i++) {
			const
				dep = deps[i];

			if (dep.name != null && dependenciesCache[dep.name]) {
				continue;
			}

			toLoad.push(
				Promise.allSettled(dep.module()).then(() => {
					if (dep.name != null) {
						dependenciesCache[dep.name] = true;
					}
				})
			);
		}

		if (toLoad.length === 0) {
			return false;
		}

		return Promise.all(toLoad).then(() => true);
	}
}
