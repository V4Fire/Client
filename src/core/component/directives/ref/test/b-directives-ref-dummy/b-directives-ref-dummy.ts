/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import bDummy, { component, prop } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
class bDirectivesRefDummy extends bDummy {
	@prop(Boolean)
	useAsyncRender: boolean = false;

	protected override $refs!: bDummy['$refs'] & {
		component?: CanArray<bDummy>;
		slotComponent?: CanArray<bDummy>;
		nestedSlotComponent?: CanArray<bDummy>;
	};
}

export default bDirectivesRefDummy;
