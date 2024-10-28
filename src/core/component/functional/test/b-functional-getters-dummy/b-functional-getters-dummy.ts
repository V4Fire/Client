/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import { cacheStatus } from 'core/component/watch';

import bDummy, { component, system, computed, hook } from 'components/dummies/b-dummy/b-dummy';
import type { Item } from 'core/component/functional/test/b-functional-getters-dummy/interface';

import { item } from 'core/component/functional/test/b-functional-getters-dummy/const';

export * from 'components/dummies/b-dummy/b-dummy';

@component({functional: true})
export default class bFunctionalGettersDummy extends bDummy {
	@system()
	itemStore?: CanUndef<Item>;

	@system({merge: true})
	logStore: string[] = [];

	/** @inheritDoc */
	protected declare $refs: bDummy['$refs'] & {
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

	@computed({cache: false})
	get isValueCached(): boolean {
		// eslint-disable-next-line @v4fire/unbound-method
		const {get} = Object.getOwnPropertyDescriptor(this, 'value')!;

		if (get == null) {
			throw new TypeError('"value" getter is missing');
		}

		return cacheStatus in get;
	}

	@hook(['beforeDestroy', 'mounted'])
	logValueIsCached(): void {
		this.logStore.push(`Hook: ${this.hook}. Value is cached: ${this.isValueCached}`);
	}

	mounted(): void {
		this.item = item;
		this.$refs.container.textContent = this.value;
	}
}
