/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import iData, { component, prop, field, watch } from 'super/i-data/i-data';
export * from 'super/i-data/i-data';

export const
	$$ = symbolGenerator(),
	UNDEF = {};

export interface Option {
	label: string;
	value?: any;
	href?: string;
	info?: string;
	theme?: string;
	active?: boolean;
	hidden?: boolean;
	progress?: boolean;
	hint?: string;
	preIcon?: string;
	preIconHint?: string;
	preIconComponent?: string;
	icon?: string;
	iconHint?: string;
	iconComponent?: string;
}

@component({
	functional: {
		dataProvider: undefined
	},

	model: {
		prop: 'valueProp',
		event: 'change'
	}
})

export default class bList<T extends Dictionary = Dictionary> extends iData<T> {
	/**
	 * Initial component value
	 */
	@prop(Array)
	readonly valueProp: Option[] = [];

	/**
	 * Initial component active value
	 */
	@prop({required: false})
	readonly activeProp?: any | any[];

	/**
	 * If true, then will be generated href value for a link if it's not existed
	 */
	@prop(Boolean)
	readonly autoHref: boolean = false;

	/**
	 * If true, then all list labels won't be shown
	 */
	@prop(Boolean)
	readonly hideLabels: boolean = false;

	/**
	 * If true, then will be enabled multiple value mode
	 */
	@prop(Boolean)
	readonly multiple: boolean = false;

	/**
	 * If true, then tab activation can be cancel (with multiple = false)
	 */
	@prop(Boolean)
	readonly cancelable: boolean = false;

	/**
	 * Component value
	 */
	@field({
		merge: true,
		init: (o) => o.link('valueProp')
	})

	value!: Option[];

	/**
	 * Component active value
	 */
	get active(): any {
		if (this.activeStore === UNDEF) {
			return undefined;
		}

		return this.multiple ? Object.keys(this.activeStore) : this.activeStore;
	}

	/**
	 * Sets a new component active value
	 * @param value
	 */
	set active(value: any) {
		if (this.multiple) {
			if (Object.isArray(value)) {
				const
					prop = String(value[0]);

				if (value[1]) {
					this.$set(this.activeStore, prop, true);

				} else {
					this.$delete(this.activeStore, prop);
				}

			} else {
				this.$set(this.activeStore, value, true);
			}

		} else {
			this.activeStore = value;
		}
	}

	/**
	 * Component active value store
	 */
	@field((o) => o.link('activeProp', (val) => {
		const
			ctx: bList = <any>o;

		if (ctx.multiple) {
			const
				objVal = Object.fromArray([].concat(val || []));

			if (Object.fastCompare(objVal, ctx.activeStore)) {
				return ctx.activeStore;
			}

			return objVal;
		}

		return val;
	}))

	protected activeStore!: any;

	/**
	 * Synchronization for the activeStore field
	 * @param value
	 */
	@watch({field: 'activeStore', deep: true})
	protected syncActiveStoreWatcher(value: Option[]): void {
		this.emit('change', this.active);
	}

	/** @override */
	protected initRemoteData(): Option[] | undefined {
		if (!this.db) {
			return;
		}

		const
			val = this.blockConverter ? this.blockConverter(this.db) : this.db;

		if (Object.isArray(val)) {
			return this.value = <Option[]>val;
		}

		return this.value;
	}

	/**
	 * Returns true if the specified link is active
	 *
	 * @param link - link object
	 * @param id - link ID
	 */
	protected isActive(link: Option, id: number): boolean {
		const
			a = document.createElement('a');

		if (link.href) {
			a.href = link.href;
		}

		const
			val = link.value !== undefined ? link.value : link.href;

		let isActive;
		if (this.multiple) {
			if (link.active && !(val in this.activeStore)) {
				this.active = val;
			}

			isActive = Boolean(this.activeStore[val]);

		} else {
			if (link.active && this.active === undefined) {
				this.active = val;
			}

			isActive = Boolean(this.active !== undefined ? val === this.active : link.active);
		}

		const
			{block: $b} = this;

		if ($b) {
			const el = $b.element($b.getElSelector('link', {id}));
			el && $b.setElMod(el, 'link', 'active', isActive);
		}

		return isActive;
	}

	/** @override */
	protected onAddData(data: any): void {
		Object.assign(this.db, this.convertRemoteData(data));
	}

	/** @override */
	protected onUpdData(data: any): void {
		Object.assign(this.db, this.convertRemoteData(data));
	}

	/** @override */
	protected onDelData(data: any): void {
		Object.assign(this.db, this.convertRemoteData(data));
	}

	/**
	 * Handler: tab change
	 *
	 * @param e
	 * @emits actionChange(active: any)
	 */
	protected onActive(e: Event): void {
		const
			val = Object.parse((<HTMLElement>e.delegateTarget).dataset.value).value;

		if (this.multiple) {
			this.active = this.activeStore[val] ? [val] : val;

		} else {
			if (this.cancelable) {
				this.active = this.active === val ? UNDEF : val;

			} else {
				this.active = val;
			}
		}

		this.emit('actionChange', this.active);
	}

	/** @override */
	protected async mounted(): Promise<void> {
		await super.mounted();
		this.async.on(this.$el, 'click', await this.delegateElement('link', this.onActive), {
			label: $$.activation
		});
	}
}
