import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';

export interface RecycleComponent<T extends unknown = unknown> {
	node: HTMLElement;
	id: string;
	data: T;
}

export default class ComponentRender {
	/**
	 * Link to component
	 */
	protected component: bVirtualScroll;

	/**
	 * Rendered elements store
	 */
	protected nodesCache: Dictionary<HTMLElement> = {};

	/**
	 * Tombstones elements
	 */
	protected tombstones: HTMLElement[] = [];

	/**
	 * Link to tombstone DOM element
	 */
	protected tombstoneToClone: CanUndef<HTMLElement>;

	/**
	 * Link to component create element method
	 */
	protected get $createElement(): bVirtualScroll['$createElement'] {
		// @ts-ignore (acccess)
		return this.component.$createElement.bind(this.component);
	}

	/**
	 * Cloned tombstone
	 */
	protected get clonedTombstone(): CanUndef<HTMLElement> {
		return this.tombstoneToClone && this.tombstoneToClone.cloneNode(true) as HTMLElement;
	}

	/**
	 * Link to component refs
	 */
	protected get $refs(): bVirtualScroll['$refs'] {
		// @ts-ignore (access)
		return this.component.$refs;
	}

	/**
	 * @param ctx
	 */
	constructor(ctx: bVirtualScroll) {
		this.component = ctx;
		this.tombstoneToClone = <HTMLElement>this.$refs.tombstone.children[0];
	}

	/**
	 * Returns a VNode
	 * @param key
	 */
	getElement(key: string): CanUndef<HTMLElement> {
		return this.nodesCache[key];
	}

	/**
	 * Save a specified VNode
	 *
	 * @param key
	 * @param node
	 */
	saveElement(key: string, node: HTMLElement): HTMLElement {
		this.nodesCache[key] = node;

		const
			{cacheSize} = this.component,
			length = Object.keys(this.nodesCache).length;

		if (length > cacheSize) {
			// this.dropCache(); // TODO: Дропнуть кэш
		}

		return node;
	}

	/** @see bVirtualScroll.getOptionKey */
	getOptionKey(data: unknown): string {
		// @ts-ignore (access)
		return this.component.getOptionKey(data);
	}

	/**
	 * Renders a new VNode
	 *
	 * @param data - component data
	 * @param el
	 * @param item
	 */
	render(data: unknown, item: RecycleComponent): CanUndef<HTMLElement> {
		const
			{cacheNode} = this.component,
			id = this.getOptionKey(data);

		if (cacheNode) {
			const node = id && this.getElement(id);

			if (node) {
				item.node = node;
				return node;

			} else {
				return (item.node = this.createComponent(data));
			}
		}

		return;
	}

	/**
	 * Returns a tombstone
	 */
	getTombstone(): HTMLElement {
		const
			{component} = this,
			tombstone = this.tombstones.pop();

		if (tombstone) {
			tombstone.classList.remove(`${component.componentName}__tombstone_hidden_true`);

			tombstone.style.transform = 'translate3d(0, 0, 0)';
			tombstone.style.transition = '';

			return tombstone;
		}

		return this.createTombstone();
	}

	/**
	 * Saves the specified tombstone in cache
	 */
	saveTombstone(node: HTMLElement): void {
		this.tombstones.push(node);
	}

	/**
	 * Creates a tombstone
	 * @param [el]
	 */
	protected createTombstone(el?: HTMLElement): HTMLElement {
		const
			{component} = this,
			tombstone = el || this.clonedTombstone;

		tombstone.classList.add(`${component.componentName}__tombstone-el`);
		return tombstone;
	}

	/**
	 * Creates a new Recycle item
	 *
	 * @param data - Item data
	 * @param el
	 * @param [active]
	 */
	protected createRecycleComponent(data: unknown, el: HTMLElement, active: boolean = true): RecycleComponent {
		const
			id = this.getOptionKey(data);

		const item = {
			node: this.createComponent(data),
			data,
			id
		};

		return item;
	}

	/**
	 * Creates a component by specified params
	 *
	 * @param data
	 * @param el
	 */
	protected createComponent(data: unknown): HTMLElement {
		const
			id = this.getOptionKey(data);

		const renderOpts = {
			props: {
				data
			},

			staticClass: `${this.component.componentName}__option-el`
		};

		const node = <HTMLElement>this.component.vdom.render(this.$createElement(this.component.option, renderOpts));
		return this.saveElement(id, node);
	}
}
