/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import iIcon from 'traits/i-icon/i-icon';
import iVisible from 'traits/i-visible/i-visible';
import iWidth from 'traits/i-width/i-width';

import iData, { component, prop, field, system, hook, watch, p, ModsDecl } from 'super/i-data/i-data';
import { Option } from 'base/b-list/modules/interface';

export * from 'super/i-data/i-data';
export * from 'base/b-list/modules/interface';

export const
	$$ = symbolGenerator();

@component({
	functional: {
		dataProvider: undefined
	},

	model: {
		prop: 'valueProp',
		event: 'onChange'
	}
})

export default class bList<T extends object = Dictionary> extends iData<T> implements iIcon, iVisible, iWidth {
	/**
	 * Initial component value
	 */
	@prop(Array)
	readonly valueProp: Option[] = [];

	/**
	 * Initial component active value
	 */
	@prop({required: false})
	readonly activeProp?: CanArray<unknown>;

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
	 * If true, then will be shown page load status on transitions
	 */
	@prop(Boolean)
	readonly showProgress: boolean = false;

	/**
	 * Component value
	 */
	@field<bList>({
		watch: (o) => {
			o.initComponentValues();
		},

		init: (o) => o.sync.link<Option[]>((val) => o.dataProvider ? o.value || [] : o.normalizeOptions(val))
	})

	value!: Option[];

	/**
	 * Component active value
	 */
	@p({cache: false})
	get active(): unknown {
		const v = this.field.get('activeStore');
		return this.multiple ? Object.keys(<object>v) : v;
	}

	/** @inheritDoc */
	static readonly mods: ModsDecl = {
		...iVisible.mods,
		...iWidth.mods
	};

	/**
	 * Temporary index table
	 */
	@system()
	protected indexes!: Dictionary;

	/**
	 * Temporary values table
	 */
	@system()
	protected values!: Dictionary<number>;

	/**
	 * Component active value store
	 *
	 * @emits change(active: unknown)
	 * @emits immediateChange(active: unknown)
	 */
	@system<bList>((o) => o.sync.link((val) => {
		const
			beforeDataCreate = o.hook === 'beforeDataCreate';

		if (val === undefined && beforeDataCreate) {
			return o.activeStore;
		}

		let
			newVal;

		if (o.multiple) {
			const
				objVal = Object.fromArray((<unknown[]>[]).concat(val || []));

			if (Object.fastCompare(objVal, o.activeStore)) {
				return o.activeStore;
			}

			newVal = objVal;

		} else {
			newVal = val;
		}

		if (beforeDataCreate) {
			o.emit('immediateChange', newVal);

		} else {
			o.setActive(newVal);
		}

		return newVal;
	}))

	protected activeStore!: unknown;

	/**
	 * Returns link to the active element
	 */
	@p({cache: true})
	protected get activeElement(): CanPromise<CanUndef<HTMLAnchorElement>> {
		return this.waitStatus('ready', () => {
			const
				val = String(this.active);

			if (val in this.values) {
				return this.block.element<HTMLAnchorElement>('link', {
					id: this.values[val]
				});
			}

			return undefined;
		});
	}

	/** @see iIcon.getIconLink */
	getIconLink(iconId: string): string {
		return iIcon.getIconLink(iconId);
	}

	/**
	 * Toggles the specified value
	 *
	 * @param value
	 * @emits change(active: unknown)
	 */
	toggleActive(value: unknown): boolean {
		const
			active = this.field.get('activeStore');

		if (this.multiple) {
			if (String(value) in <Dictionary>active) {
				return this.removeActive(value);
			}

			return this.setActive(value);
		}

		if (active !== value) {
			return this.setActive(value);
		}

		return this.removeActive(value);
	}

	/**
	 * Activates the specified value
	 *
	 * @param value
	 * @emits change(active: unknown)
	 * @emits immediateChange(active: unknown)
	 */
	setActive(value: unknown): boolean {
		const
			active = this.field.get('activeStore');

		if (this.multiple) {
			if (String(value) in <Dictionary>active) {
				return false;
			}

			this.field.set(`activeStore.${value}`, true);

		} else if (active === value) {
			return false;

		} else {
			this.field.set('activeStore', value);
		}

		const
			{block: $b} = this;

		if ($b) {
			const
				target = $b.element('link', {id: this.values[String(value)]});

			if (!this.multiple) {
				const
					old = $b.element('link', {active: true});

				if (old && old !== target) {
					$b.setElMod(old, 'link', 'active', false);
				}
			}

			if (target) {
				$b.setElMod(target, 'link', 'active', true);
			}
		}

		this.emit('change', this.active);
		this.emit('immediateChange', this.active);
		return true;
	}

	/**
	 * Deactivates the specified value
	 *
	 * @param value
	 * @emits change(active: unknown)
	 * @emits immediateChange(active: unknown)
	 */
	removeActive(value: unknown): boolean {
		const
			active = this.field.get('activeStore'),
			cantCancel = !this.cancelable;

		if (this.multiple) {
			if (!(String(value) in <Dictionary>active) || cantCancel) {
				return false;
			}

			this.field.delete(`activeField.${value}`);

		} else if (active !== value || cantCancel) {
			return false;

		} else {
			this.field.set('activeStore', undefined);
		}

		const
			{block: $b} = this;

		if ($b) {
			const
				target = $b.element('link', {id: this.values[String(value)]});

			if (target) {
				$b.setElMod(target, 'link', 'active', false);
			}
		}

		this.emit('change', this.active);
		this.emit('immediateChange', this.active);
		return true;
	}

	/** @override */
	protected initRemoteData(): CanUndef<Option[]> {
		if (!this.db) {
			return;
		}

		const
			val = this.convertDBToComponent<Option[]>(this.db);

		if (Object.isArray(val)) {
			return this.value = this.normalizeOptions(val);
		}

		return this.value;
	}

	/** @override */
	protected initBaseAPI(): void {
		super.initBaseAPI();

		const
			i = this.instance;

		this.isActive = i.isActive.bind(this);
		this.setActive = i.setActive.bind(this);
		this.normalizeOptions = i.normalizeOptions.bind(this);
	}

	/**
	 * Returns true if the specified option is active
	 * @param option
	 */
	protected isActive(option: Option): boolean {
		const active = this.field.get('activeStore');
		return this.multiple ? String(option.value) in <Dictionary>active : option.value === active;
	}

	/**
	 * Normalizes the specified options and returns it
	 * @param options
	 */
	protected normalizeOptions(options: CanUndef<Option[]>): Option[] {
		const
			res = <Option[]>[];

		if (!options) {
			return res;
		}

		for (let i = 0; i < options.length; i++) {
			const
				el = options[i];

			if (el.value === undefined) {
				el.value = el.href;
			}

			if (el.href === undefined) {
				el.href = this.autoHref && el.value !== undefined ? `#${el.value}` : 'javascript:void(0)';
			}

			res.push(el);
		}

		return res;
	}

	/**
	 * Initializes component values
	 * @emits valueChange(value: Option[])
	 */
	@hook('beforeDataCreate')
	protected initComponentValues(): void {
		const
			values = {},
			indexes = {},
			active = this.field.get('activeStore');

		for (let o = <Option[]>this.$$data.value || [], i = 0; i < o.length; i++) {
			const
				el = o[i],
				val = el.value;

			if (el.active && (this.multiple ? !(<string>val in <Dictionary>active) : active === undefined)) {
				this.setActive(val);
			}

			values[<string>val] = i;
			indexes[i] = val;
		}

		this.values = values;
		this.indexes = indexes;
		this.emit('valueChange', this.value);
	}

	/**
	 * Returns a hint message for the specified element
	 * @param el
	 */
	protected getElHint(el: Option): string {
		return el.iconHint != null ? el.iconHint : this.hideLabels ? t(el.label) : '';
	}

	/** @override */
	protected initModEvents(): void {
		super.initModEvents();
		iVisible.initModEvents(this);
	}

	/** @override */
	protected onAddData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/** @override */
	protected onUpdData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/** @override */
	protected onDelData(data: unknown): void {
		Object.assign(this.db, this.convertDataToDB(data));
	}

	/**
	 * Handler: tab change
	 *
	 * @param e
	 * @emits actionChange(active: unknown)
	 */
	@watch({
		field: '?$el:click',
		wrapper: (o, cb) => o.dom.delegateElement('link', cb)
	})

	protected onActive(e: Event): void {
		const
			target = <Element>e.delegateTarget,
			id = Number(this.block.getElMod(target, 'link', 'id'));

		this.toggleActive(this.indexes[id]);
		this.emit('actionChange', this.active);
	}
}
