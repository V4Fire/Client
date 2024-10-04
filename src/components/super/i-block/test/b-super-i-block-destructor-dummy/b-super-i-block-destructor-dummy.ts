/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import type iBlock from 'components/super/i-block/i-block';
import bDummy, { component, field, system } from 'components/dummies/b-dummy/b-dummy';

export * from 'components/dummies/b-dummy/b-dummy';

@component()
export default class bSuperIBlockDestructorDummy extends bDummy {
	@field()
	content: boolean = true;

	@system()
	store: iBlock[] = [];

	declare protected readonly $refs: bDummy['$refs'] & {
		child?: CanArray<iBlock>;
	};

	pushToStore(component: iBlock): void {
		this.store.push(component);
	}
}
