/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isAbsURL, concatURLs } from 'core/url';

import { ssrEngine, domEngine } from 'core/page-meta-data/elements/abstract/engines';
import { domTitleEngine } from 'core/page-meta-data/elements/title';

import Store from 'core/page-meta-data/store';

import {

	Link,
	Meta,
	Title,

	AbstractElement,
	AbstractElementProperties,

	MetaAttributes,
	LinkAttributes

} from 'core/page-meta-data/elements';

export * from 'core/page-meta-data/elements';

export default class PageMetaData {
	/**
	 * All added meta elements
	 */
	get elements(): AbstractElement[] {
		return [...this.store];
	}

	/**
	 * Current page title
	 */
	get title(): string {
		const element = this.store.getTitle();
		return element?.text ?? '';
	}

	/**
	 * Sets a new title for the current page
	 * @param value - the new title value
	 */
	set title(value: string) {
		const attrs = {text: value};

		const title = new Title(
			SSR ? ssrEngine : domTitleEngine,
			attrs
		);

		this.store.setTitle(title, attrs);
	}

	/**
	 * Current page description
	 */
	get description(): string {
		const element = this.store.getDescription();
		return element?.content ?? '';
	}

	/**
	 * Sets a new description for the current page
	 * @param value - the new description value
	 */
	set description(value: string) {
		const attrs = {name: 'description', content: value};

		const description = new Meta(
			SSR ? ssrEngine : domEngine,
			attrs
		);

		this.store.setDescription(description, attrs);
	}

	/**
	 * Elements storage
	 */
	protected store: Store = new Store();

	/**
	 * An API for working with the target document's URL
	 */
	protected location: URL;

	/**
	 * @param location - an API for working with the target document's URL
	 * @param [elements] - an array of elements for setting in the constructor, used to restore data from the environment
	 */
	constructor(location: URL, elements: AbstractElementProperties[] = []) {
		this.location = location;
		this.restoreElements(elements);
	}

	/**
	 * Adds a new link element with the given attributes to the current page
	 * @param attrs - attributes for the created element
	 */
	addLink(attrs: LinkAttributes): void {
		const link = new Link(
			SSR ? ssrEngine : domEngine,
			attrs
		);

		this.store.addLink(link);
	}

	/**
	 * Removes link elements with the given attributes from the current page
	 * @param attrs - attributes of the removed elements
	 */
	removeLink(attrs: MetaAttributes): void {
		this.store.removeLinks(attrs);
	}

	/**
	 * Searches for link elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findLinks(attrs: LinkAttributes): Array<HTMLLinkElement | Link> {
		const links = this.store.findLinks(attrs);
		return links.map((el) => el.getElement());
	}

	/**
	 * Returns a canonical link `<link rel="canonical" />`
	 */
	getCanonicalLink(): CanUndef<HTMLLinkElement | Link> {
		return this.store.getCanonical()?.getElement();
	}

	/**
	 * Sets a news canonical link `<link rel="canonical" />` to the current page
	 *
	 * @param [pathname] - a string containing the URL text following the first `/` after the domain
	 * @param [query] - a query string
	 */
	setCanonicalLink(pathname?: string, query: string = this.location.search): void {
		const
			href = (isAbsURL.test(pathname ?? '') ? pathname : concatURLs(this.location.origin, pathname)) + query,
			attrs = {rel: 'canonical', href};

		const link = new Link(
			SSR ? ssrEngine : domEngine,
			attrs
		);

		this.store.setCanonical(link, attrs);
	}

	/**
	 * Removes the canonical link `<link rel="canonical" />` from the current page
	 */
	removeCanonicalLink(): void {
		this.store.removeCanonical();
	}

	/**
	 * Adds a new meta-element with the given attributes to the current page
	 * @param attrs - attributes for the created element
	 */
	addMeta(attrs: MetaAttributes): void {
		const meta = new Meta(
			SSR ? ssrEngine : domEngine,
			attrs
		);

		this.store.addMeta(meta);
	}

	/**
	 * Removes meta-elements with the given attributes from the page
	 * @param attrs - attributes of the removed elements
	 */
	removeMeta(attrs: MetaAttributes): void {
		this.store.removeMetas(attrs);
	}

	/**
	 * Searches for meta elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findMetas(attrs: MetaAttributes): Array<HTMLMetaElement | Meta> {
		const metas = this.store.findMetas(attrs);
		return metas.map((el) => el.getElement());
	}

	/**
	 * Restores the elements storage from the passed array of elements properties
	 * @param elements - an array of elements for setting in the constructor, used to restore data from the environment
	 */
	protected restoreElements(elements: AbstractElementProperties[]): void {
		elements.forEach(({tag, attrs}) => {
			switch (tag) {
				case 'title':
					this.title = attrs.text!;
					break;

				case 'description':
					this.description = attrs.value!;
					break;

				case 'link':
					this.addLink(attrs);
					break;

				case 'meta':
					this.addMeta(attrs);
					break;

				default:
					break;
			}
		});
	}
}
