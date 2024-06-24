/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import bDummy, { component, system, computed } from 'components/dummies/b-dummy/b-dummy';
import type { Item } from 'core/component/functional/test/b-functional-getters-dummy/interface';

import { item } from 'core/component/functional/test/b-functional-getters-dummy/const';

export * from 'components/dummies/b-dummy/b-dummy';

@component({functional: true})
export default class bFunctionalGettersDummy extends bDummy {
	@system()
	itemStore?: CanUndef<Item>;

	protected override $refs!: bDummy['$refs'] & {
		container: HTMLElement;
	};

	@computed({dependencies: ['item']})
	get value(): string {
		return String(this.item?.value);
	}

	@computed()
	get item(): CanUndef<Item> {
		return this.field.get('itemStore');
	}

	set item(value: CanUndef<Item>) {
		this.field.set('itemStore', value);
	}

	mounted(): void {
		this.console.log('mounted');
		this.item = item;
		this.$refs.container.textContent = this.value;
	}
}
