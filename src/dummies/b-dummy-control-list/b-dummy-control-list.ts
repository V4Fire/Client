/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-control-list/README.md]]
 * @packageDocumentation
 */

import { derive } from '/core/functools/trait';

import iControlList, { Control } from '/traits/i-control-list/i-control-list';
import iBlock, { component, prop } from '/super/i-block/i-block';

export * from '/super/i-block/i-block';

interface bDummyControlList extends
	Trait<typeof iControlList> {}

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

@derive(iControlList)
class bDummyControlList extends iBlock implements iControlList {
	@prop(Array)
	controls!: Control[];

	protected get modules(): {iControlList: typeof iControlList} {
		return {
			iControlList
		};
	}

	testFn(...args: unknown[]): void {
		globalThis._args = args;
		globalThis._t = 1;
	}

	testArgsMapFn(...args: unknown[]): unknown[] {
		globalThis._tArgsMap = args;
		return args;
	}
}

export default bDummyControlList;
