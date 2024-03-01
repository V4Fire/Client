/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ModuleMocker } from 'jest-mock';

let
	globalApi: CanUndef<ModuleMocker>;

globalThis.jestMock = {
	/**
	 * {@link ModuleMocker.spyOn}
	 *
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
	 *
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
