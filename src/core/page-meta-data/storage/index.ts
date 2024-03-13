/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { AbstractElement, Link, Meta, Title } from 'core/page-meta-data/elements';

type StorageKeys = 'title' | 'description' | 'meta' | 'link' | 'og';

// interface ElementsStorage {
// 	title?: AbstractElement<HTMLTitleElement>;
// 	description?: AbstractElement<HTMLMetaElement>;
// 	canonical?: AbstractElement<HTMLMetaElement>;
// 	meta: AbstractElement<HTMLMetaElement>[];
// 	link: AbstractElement<HTMLLinkElement>[];
// 	og: OGElements;
// }

interface OGElements {
	title?: Meta;
	type?: Meta;
	url?: Meta;
	site_name?: Meta;
	image?: Meta[];
}

interface OGImageElements {
	image: Meta;
	width?: Meta;
	height?: Meta;
	type?: Meta;
	alt?: Meta;
}

interface LinkElements {
	canonical?: AbstractElement<HTMLLinkElement>;
	alternate?: AbstractElement<HTMLLinkElement>[];
}

interface MetaElements {
	description?: AbstractElement<HTMLMetaElement>;
	og?: OGElements;
}

export default class ElementsStorage {
	title?: Title;
	description?: Meta;
	canonical?: Meta;
	og: OGElements = {};
	metas: Meta[] = [];
	links: Link[] = [];

	addMeta(element: Meta): void {
		this.metas.push(element);
	}

	addLink(element: Link): void {
		this.links.push(element);
	}

	findMetas(attrs: Dictionary<string>): Meta[] {
		return this.metas.filter((el) => el.is('meta', attrs));
	}

	findLinks(attrs: Dictionary<string>): Link[] {
		return this.links.filter((el) => el.is('link', attrs));
	}

	// meta: MetaElements = {};

	// link: LinkElements = {};

	// addMeta<T extends HTMLElement>(element: AbstractElement<T>) {
	// 	// if (key.startsWith('og')) {
	// 	// 	Object.set(this, key, element);
	// 	// }
	// 	//
	// 	// if (key === 'meta' || key === 'link') {
	// 	// 	this.meta.filter((el) => {
	// 	//
	// 	// 	});
	// 	//
	// 	// 	this[key].push(Object.cast(element));
	// 	// }
	// 	//
	// 	// this[key] = element;
	//
	// 	Object.set(this, `meta.${key}`, element);
	// }

	setTitle(element: Title): void {
		this.title = element;
	}

	setCanonical(element: Meta): void {
		this.canonical = element;
	}

	setDescription(element: Meta): void {
		this.description = element;
	}

	addOG(key: string, element: Meta): void {
		if (key.includes('image')) {
			this.og.image ??= [];
			this.og.image.push(element);
			return;
		}

		this.og[key] = element;
	}

	getTitle() {
		return this.title;
	}

	getCanonical() {
		return this.canonical;
	}

	getDescription() {
		return this.description;
	}

	getOG<T extends keyof OGElements>(key: T): OGElements[T] {
		return this.og[key];
	}

	removeCanonical(): CanUndef<Meta> {
		const canonical = this.canonical;
		this.canonical = undefined;

		return canonical;
	}

	removeMetas(attrs: Dictionary<string>): Meta[] {
		const metas = this.findMetas(attrs);
		this.metas = this.metas.filter((el) => !el.is('meta', attrs));

		return metas;
	}

	removeLinks(attrs: Dictionary<string>): Link[] {
		const links = this.findLinks(attrs);
		this.links = this.links.filter((el) => !el.is('link', attrs));

		return links;
	}

	clear(): void {
		Object.assign(this, new ElementsStorage());
	}

	[Symbol.iterator]() {
		const iter = traverse(Object.values(this));

		return {
			[Symbol.iterator]() {
				return this;
			},

			next: iter.next.bind(iter)
		};

		function* traverse(arr: Array<AbstractElement | Dictionary<AbstractElement | AbstractElement[]>>) {
			for (let i = 0; i < arr.length; i++) {
				const val = arr[i];

				if (val instanceof AbstractElement) {
					yield val;
				}

				if (Object.isArray(val)) {
					yield* val;
				}

				yield* traverse(Object.values(val));
			}
		}
	}
}
