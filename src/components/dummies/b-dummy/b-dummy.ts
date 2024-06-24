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

import type { VNode } from 'core/component/engines';

import type iBlock from 'components/super/i-block/i-block';
import iData, { prop, component, computed, field, system } from 'components/super/i-data/i-data';

export * from 'components/super/i-data/i-data';

const item = {value: Math.random()};

@component({
	functional: {
		functional: true
	}
})

class bDummy extends iData {
	@prop({type: Object, required: false})
	readonly itemProp!: any;

	/**
	 * Name of the test component
	 */
	@field()
	testComponent?: string;

	/**
	 * Attributes for the test component
	 */
	@field()
	testComponentAttrs: Dictionary = {};

	/**
	 * Slots for the test component
	 */
	@field()
	testComponentSlots?: CanArray<VNode>;

	protected override readonly $refs!: iData['$refs'] & {
		testComponent?: iBlock;
		counter?: HTMLElement;
	};

	@computed({dependencies: ['getValue']})
	protected get value(): string {
		return String(this.getValue);
	}

	@computed({dependencies: ['itemStore']})
	protected get getValue(): CanUndef<number> {
		return this.item?.value;
	}

	protected get item(): any | undefined {
		return this.field.get('itemStore', this, (fieldName: string, obj: Nullable<object>) => {
			if (obj == null) {
				return undefined;
			}

			const objFromPrimitive = Object(obj);

			if (fieldName in objFromPrimitive) {
				return obj[fieldName];
			}

			const underscoredFieldName = fieldName.underscore();

			if (underscoredFieldName in objFromPrimitive) {
				return obj[underscoredFieldName];
			}

			return undefined;
		});
	}

	protected set item(value: any) {
		this.field.set('itemStore', value);
	}

	@system((o) => o.sync.link())
	protected itemStore: any;

	mounted(): void {
		this.console.log('mounted');
		this.item = item;
		this.$refs.counter!.textContent = this.value;
	}
}

export default bDummy;
