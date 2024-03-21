/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AbstractElement, Link, Meta, Title } from 'core/page-meta-data/elements';
import type { OGElements } from 'core/page-meta-data/storage/interface';

/**
 * Storage for page meta data elements
 */
export default class ElementsStorage {
	/**
	 * Title element
	 */
	title?: Title;

	/**
	 * Description meta element
	 */
	description?: Meta;

	/**
	 * Canonical link element
	 */
	canonical?: Link;

	/**
	 * Open Graph elements
	 */
	og: OGElements = {};

	/**
	 * Link elements
	 */
	metas: Meta[] = [];

	/**
	 * Meta elements
	 */
	links: Link[] = [];

	/**
	 * Adds meta element
	 * @param element
	 */
	addMeta(element: Meta): void {
		this.metas.push(element);
		element.render();
	}

	/**
	 * Adds link element
	 * @param element
	 */
	addLink(element: Link): void {
		this.links.push(element);
		element.render();
	}

	/**
	 * Finds meta elements
	 * @param attrs
	 */
	findMetas(attrs: Dictionary<string>): Meta[] {
		return this.metas.filter((el) => el.is('meta', attrs));
	}

	/**
	 * Finds link elements
	 * @param attrs
	 */
	findLinks(attrs: Dictionary<string>): Link[] {
		return this.links.filter((el) => el.is('link', attrs));
	}

	/**
	 * Sets title element
	 *
	 * @param element
	 * @param attrs
	 */
	setTitle(element: Title, attrs: Dictionary<string>): void {
		if (this.title == null) {
			this.title = element;
			element.render();

		} else {
			this.title.update(attrs);
		}
	}

	/**
	 * Sets canonical link
	 *
	 * @param element
	 * @param attrs
	 */
	setCanonical(element: Link, attrs: Dictionary<string>): void {
		if (this.canonical == null) {
			this.canonical = element;
			element.render();

		} else {
			this.canonical.update(attrs);
		}
	}

	/**
	 * Sets description meta element
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
	 * Sets OG meta element
	 *
	 * @param key
	 * @param element
	 * @param attrs
	 */
	addOG(key: keyof OGElements, element: Meta, attrs: Dictionary<string>): void {
		if (key === 'image') {
			this.og.image ??= [];
			this.og.image.push(element);

		} else {
			this.og[key] = element;
		}

		element.render();
	}

	/**
	 * Gets title element
	 */
	getTitle(): CanUndef<Title> {
		return this.title;
	}

	/**
	 * Gets canonical link
	 */
	getCanonical(): CanUndef<Link> {
		return this.canonical;
	}

	/**
	 * Gets description meta element
	 */
	getDescription(): CanUndef<Meta> {
		return this.description;
	}

	/**
	 * Gets OG meta element
	 */
	getOG<T extends keyof OGElements>(key: T): OGElements[T] {
		return this.og[key];
	}

	/**
	 * Removes canonical link
	 */
	removeCanonical(): CanUndef<Link> {
		const canonical = this.canonical;
		this.canonical = undefined;

		canonical?.remove();

		return canonical;
	}

	/**
	 * Removes meta elements
	 * @param attrs
	 */
	removeMetas(attrs: Dictionary<string>): Meta[] {
		const metas = this.findMetas(attrs);
		this.metas = this.metas.filter((el) => !el.is('meta', attrs));

		metas.forEach((meta) => meta.remove());

		return metas;
	}

	/**
	 * Removes link elements
	 * @param attrs
	 */
	removeLinks(attrs: Dictionary<string>): Link[] {
		const links = this.findLinks(attrs);
		this.links = this.links.filter((el) => !el.is('link', attrs));

		links.forEach((link) => link.remove());

		return links;
	}

	/**
	 * Clears the storage and the elements
	 */
	clear(): void {
		Object.assign(this, new ElementsStorage());
	}

	/**
	 * Returns iterator
	 */
	[Symbol.iterator]() {
		const iter = traverse(Object.values(this));

		return {
			[Symbol.iterator]() {
				return this;
			},

			next: iter.next.bind(iter)
		};

		function* traverse(arr: Array<
			AbstractElement | AbstractElement[] | Record<string, AbstractElement | AbstractElement[]>
		>) {
			for (let i = 0; i < arr.length; i++) {
				const val = arr[i];

				if (val instanceof AbstractElement) {
					yield val;

				} else if (Object.isArray(val)) {
					yield* val;

				} else {
					yield* traverse(Object.values(val));
				}
			}
		}
	}
}
