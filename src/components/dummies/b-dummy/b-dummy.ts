/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/dummies/b-dummy/README.md]]
 * @packageDocumentation
 */

import iData, { component, computed, prop, field } from 'components/super/i-data/i-data';

export * from 'components/super/i-data/i-data';


interface Item {
	id: number;
	state: number;
}

@component({
	functional: {
		functional: true
	}
})

class bDummy extends iData {
	readonly Items!: Item[];

	@prop(Number)
	readonly groupSize: number = 0;

	@prop(Array)
	readonly itemsProp!: this['Items'];

	@field<bDummy>((o) => o.sync.link<Partial<Item>[]>((val) => o.normalizeItems(val)))
	itemsStore!: this['Items'];

	/** {@link bAnchorNavigation.items} */
	@computed({dependencies: ['itemsStore']})
	get items(): this['Items'] {
		return <this['Items']>this.field.get('itemsStore');
	}

	/** {@link bAnchorNavigation.items} */
	set items(value: this['Items']) {
		this.field.set('itemsStore', value);
	}

	@computed({dependencies: ['items', 'groupSize']})
	get debug() {
		return JSON.stringify(this.items, null, '  ');
	}

	@computed({dependencies: ['items', 'groupSize']})
	get groups() {
		const
			result: Item[][] = [],
			arr = Array.from(this.items);

		for (let i = 0; i < arr.length; i += this.groupSize) {
			result.push(arr.slice(i, i + this.groupSize));
		}

		this.console.log(result);

		return result;
	}

	normalizeItems(value: Partial<Item>[]): Item[] {
		return (value ?? []).map((item, index) => ({...item, id: item.id ?? index + 1, state: item.state ?? 0}));
	}

	modifyItem() {
		this.items[0].state += 1;
	}

	spliceItem() {
		this.items.splice(0, 1);
	}
}

export default bDummy;
