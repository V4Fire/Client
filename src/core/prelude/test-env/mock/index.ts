/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * @file Provides an API to Work with `jest-mock` package
 */

import { ModuleMocker } from 'jest-mock';

let
	globalApi: ModuleMocker;

globalThis.jest = {
	/**
	 * {@link ModuleMocker.spyOn}
	 * @see https://jestjs.io/docs/mock-functions
	 *
	 * @param args
	 */
	spy: (...args: Parameters<ModuleMocker['spyOn']>): any => {
		globalApi ??= mockerFactory();
		return globalApi.spyOn(...args);
	},

	/**
	 * {@link ModuleMocker.fn}
	 * @see https://jestjs.io/docs/mock-functions
	 *
	 * @param args
	 */
	mock: (...args: any[]): any => {
		globalApi ??= mockerFactory();
		return globalApi.fn(...args);
	}
};

/**
 * {@link ModuleMocker}
 */
function mockerFactory(): ModuleMocker {
	return new ModuleMocker(globalThis);
}
