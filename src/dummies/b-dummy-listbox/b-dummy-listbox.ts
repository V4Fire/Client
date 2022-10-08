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

import { derive } from 'core/functools/trait';

import iBlock, { component, prop } from 'super/i-block/i-block';
import iAccess from 'traits/i-access/i-access';
import type iItems from 'traits/i-items/i-items';
import type { Item } from 'base/b-list/interface';
import type { Orientation } from 'core/component/directives/aria';

export * from 'super/i-block/i-block';

interface bDummyListbox extends Trait<typeof iAccess> {
}

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

@derive(iAccess)
class bDummyListbox extends iBlock implements iAccess, iItems {
	readonly Item!: Item;

	readonly Items!: Array<this['Item']>;

	@prop(Boolean)
	readonly multiple: boolean = false;

	@prop(String)
	readonly orientation: Orientation = 'vertical';

	@prop(Array)
	readonly items: this['Items'] = [];

	protected activeStore: CanUndef<Set<string> | string>;

	setActive(value: string): void {
		if (this.multiple) {
			if (Object.isSet(this.activeStore)) {
				if (this.activeStore.has(value)) {
					this.activeStore.delete(value);

				} else {
					this.activeStore.add(value);
				}

			} else {
				this.activeStore = new Set();
				this.activeStore.add(value);
			}

		} else if (this.activeStore !== value) {
			this.activeStore = value;

		} else {
			this.activeStore = undefined;
		}

		const
			items = this.block?.elements('item');

		items?.forEach((el) => {
			if (el.getAttribute('value') === value) {
				const
					mod = this.block?.getElMod(el, 'item', 'active') ?? 'false';

				this.block?.setElMod(el, 'item', 'active', mod === 'false');

			} else if (!Object.isSet(this.activeStore)) {
				this.block?.setElMod(el, 'item', 'active', false);
			}
		});
	}

	isActive(value: string): boolean {
		if (Object.isSet(this.activeStore)) {
			return this.activeStore.has(value);
		}

		return this.activeStore === value;
	}

	protected getAriaConfig(role: 'listbox' | 'option', item?: this['Item']): Dictionary {
		const onChange = (cb) => {
			this.on('change', () => cb(this.isActive(String(item?.value))));
		};

		const listboxConfig = {
			standAlone: true,
			multiselectable: this.multiple,
			orientation: this.orientation
		};

		const optionConfig = {
			'@change': onChange
		};

		switch (role) {
			case 'listbox': return listboxConfig;
			case 'option': return optionConfig;
			default: return {};
		}
	}

	protected onItemClick(e: Event): void {
		const
			target = <Element>e.target,
			value = String(target.getAttribute('value'));

		this.setActive(value);
		this.emit('change', this.activeStore);
	}

	protected onItemKeydown(e: KeyboardEvent): void {
		if (e.key === ' ') {
			this.onItemClick(e);
		}
	}
}

export default bDummyListbox;
