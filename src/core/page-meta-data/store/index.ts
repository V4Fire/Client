/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AbstractElement, Link, Meta, Title } from 'core/page-meta-data/elements';
import type { OGElements } from 'core/page-meta-data/store/interface';

/**
 * A store for page meta data elements
 */
export default class Store {
	/**
	 * Page title
	 */
	title: CanNull<Title> = null;

	/**
	 * Page description
	 */
	description: CanNull<Meta> = null;

	/**
	 * Page canonical link
	 */
	canonical: CanNull<Link> = null;

	/**
	 * Open Graph elements
	 */
	og: OGElements = {};

	/**
	 * Page meta-elements
	 */
	metas: Meta[] = [];

	/**
	 * Page links
	 */
	links: Link[] = [];

	/**
	 * Returns an iterator over the elements from the store
	 */
	[Symbol.iterator](): IterableIterator<AbstractElement> {
		const iter = traverse(Object.values(this));

		return {
			[Symbol.iterator]() {
				return this;
			},

			next: iter.next.bind(iter)
		};

		function* traverse(arr: Array<CanArray<AbstractElement> | StrictDictionary<CanArray<AbstractElement>>>) {
			for (let i = 0; i < arr.length; i++) {
				const val = arr[i];

				if (val instanceof AbstractElement) {
					yield val;

				} else if (Object.isArray(val)) {
					yield* val;

				} else if (Object.isPlainObject(val)) {
					yield* traverse(Object.values(val));
				}
			}
		}
	}

	/**
	 * Returns the page title
	 */
	getTitle(): CanNull<Title> {
		return this.title;
	}

	/**
	 * Sets a new page title with the given attributes
	 *
	 * @param title
	 * @param attrs
	 */
	setTitle(title: Title, attrs: Dictionary<string>): void {
		if (this.title == null) {
			this.title = title;
			title.render();

		} else {
			this.title.update(attrs);
		}
	}

	/**
	 * Returns the page description
	 */
	getDescription(): CanNull<Meta> {
		return this.description;
	}

	/**
	 * Sets a new page description with the given attributes
	 *
	 * @param element
	 * @param attrs
	 */
	setDescription(element: Meta, attrs: Dictionary<string>): void {
		if (this.description == null) {
			this.description = element;
			element.render();

		} else {
			this.description.update(attrs);
		}
	}

	/**
	 * Returns the canonical link
	 */
	getCanonical(): CanNull<Link> {
		return this.canonical;
	}

	/**
	 * Sets a new canonical link with the given attributes
	 *
	 * @param link
	 * @param attrs
	 */
	setCanonical(link: Link, attrs: Dictionary<string>): void {
		if (this.canonical == null) {
			this.canonical = link;
			link.render();

		} else {
			this.canonical.update(attrs);
		}
	}

	/**
	 * Removes the page canonical link
	 */
	removeCanonical(): CanNull<Link> {
		const {canonical} = this;

		this.canonical = null;
		canonical?.remove();

		return canonical;
	}

	/**
	 * Adds a new meta-element to the store
	 * @param element
	 */
	addMeta(element: Meta): void {
		this.metas.push(element);
		element.render();
	}

	/**
	 * Searches for meta elements within the store with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findMetas(attrs: Dictionary<string>): Meta[] {
		return this.metas.filter((el) => el.is('meta', attrs));
	}

	/**
	 * Removes meta-elements from the store with the given attributes and returns them
	 * @param attrs - attributes of the removed elements
	 */
	removeMetas(attrs: Dictionary<string>): Meta[] {
		const metas = this.findMetas(attrs);

		this.metas = this.metas.filter((el) => !el.is('meta', attrs));
		metas.forEach((meta) => meta.remove());

		return metas;
	}

	/**
	 * Adds a new link element to the store
	 * @param link
	 */
	addLink(link: Link): void {
		this.links.push(link);
		link.render();
	}

	/**
	 * Removes link elements from the store with the given attributes and returns them
	 * @param attrs - attributes of the removed elements
	 */
	removeLinks(attrs: Dictionary<string>): Link[] {
		const links = this.findLinks(attrs);

		this.links = this.links.filter((el) => !el.is('link', attrs));
		links.forEach((link) => link.remove());

		return links;
	}

	/**
	 * Searches for link elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findLinks(attrs: Dictionary<string>): Link[] {
		return this.links.filter((el) => el.is('link', attrs));
	}

	/**
	 * Returns the OG meta element by its name
	 * @param name
	 */
	getOG<T extends keyof OGElements>(name: T): OGElements[T] {
		return this.og[name];
	}

	/**
	 * Sets a new OG meta element by its name
	 *
	 * @param name
	 * @param element
	 */
	addOG(name: keyof OGElements, element: Meta): void {
		if (name === 'image') {
			this.og.image ??= [];
			this.og.image.push(element);

		} else {
			this.og[name] = element;
		}

		element.render();
	}

	/**
	 * Clears the storage and the elements
	 */
	clear(): void {
		Object.assign(this, new Store());
	}
}
