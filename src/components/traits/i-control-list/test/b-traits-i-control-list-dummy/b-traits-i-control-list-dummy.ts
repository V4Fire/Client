/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { derive } from 'core/functools/trait';

import iControlList, { Control } from 'components/traits/i-control-list/i-control-list';
import iBlock, { component, prop } from 'components/super/i-block/i-block';

export * from 'components/super/i-block/i-block';

interface bTraitsIControlListDummy extends
	Trait<typeof iControlList> {}

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

@derive(iControlList)
class bTraitsIControlListDummy extends iBlock implements iControlList {
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

	getControlEvent(opts: Control): string {
		switch (opts.component) {
			case 'b-button':
				return 'click:component';

			case 'b-file-button':
				return 'change';

			default:
				return 'click';
		}
	}
}

export default bTraitsIControlListDummy;
