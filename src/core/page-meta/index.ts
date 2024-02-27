/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-static-page/modules/page-meta-data/README.md]]
 * @packageDocumentation
 */

import { concatURLs } from 'core/url';
import remoteState from 'core/component/client-state';
import type { State } from 'core/component';
import type AbstractElement from 'core/page-meta/modules/abstract';
import type { MetaAttributes } from 'core/page-meta/modules/meta';
import type { LinkAttributes } from 'core/page-meta/modules/link';
import Link from 'core/page-meta/modules/link';
import Meta from 'core/page-meta/modules/meta';
import Title from 'core/page-meta/modules/title';


export default class PageMeta {
	protected elements: AbstractElement[] = [];

	protected state: State = remoteState;

	get meta(): AbstractElement[] {
		return Object.fastClone(this.elements);
	}

	/**
	 * Current page title
	 */
	get title(): string {
		const element = this.findElements('title')[0];
		return element.getAttr('content');
	}

	/**
	 * Sets a new title for the current page
	 * @param value - the new title value
	 */
	set title(value: string) {
		const title = new Title({text: value});
		title.create();

		this.elements.push(title);
	}

	/**
	 * Current page description
	 */
	get description(): string {
		const element = this.findElements<HTMLMetaElement>('meta', {name: 'description'})[0];
		return element.getAttr('content');
	}

	/**
	 * Sets a new description for the current page
	 * @param value - the new description value
	 */
	set description(value: string) {
		this.addMeta({
			name: 'description',
			content: value
		});
	}

	/**
	 * Adds a new link tag with the given attributes to the current page
	 * @param attrs - attributes for the created tag
	 */
	addLink(attrs: LinkAttributes): void {
		const link = new Link(attrs);
		link.create();

		this.elements.push(link);
	}

	/**
	 * Searches for link elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findLinks(attrs: LinkAttributes): NodeListOf<HTMLLinkElement> | AbstractElement<HTMLLinkElement>[] {
		const links = this.findElements<HTMLLinkElement>('links', attrs);
		return links[0].find() ?? links;
	}

	/**
	 * Adds a new meta element on a page
	 * @param attrs - attributes for the created tag
	 */
	addMeta(attrs: MetaAttributes): void {
		const meta = new Meta(attrs);
		meta.create();

		this.elements.push(meta);
	}

	/**
	 * Searches for meta elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findMetas(attrs: MetaAttributes): NodeListOf<HTMLMetaElement> | AbstractElement<HTMLMetaElement>[] {
		const metas = this.findElements<HTMLMetaElement>('meta', attrs);
		return metas[0].find() ?? metas;
	}

	/**
	 * Sets canonical link `<link rel="canonical" />` to the page
	 * @param [pathname] - string containing the first '/' after the domain with the subsequent URL text
	 */
	setCanonicalLink(pathname?: string): void {
		const
			{location} = SSR ? this.state : globalThis,
			links = this.findElements('link', {rel: 'canonical'}),
			href = concatURLs(location.origin, pathname, location.search);

		if (Object.isEmpty(links)) {
			this.addLink({rel: 'canonical', href});

		} else {
			links[0].update({href});
		}
	}

	/**
	 * Removes canonical link `<link rel="canonical" />` from the page
	 */
	removeCanonicalLink(): void {
		this.removeElements('link', {rel: 'canonical'});
	}

	/**
	 * Removes meta element from the page
	 * @param attrs
	 */
	removeMeta(attrs: MetaAttributes): void {
		this.removeElements('meta', attrs);
	}

	/**
	 * Searches for elements in the document with the given name and attributes and returns them
	 *
	 * @param tag - the tag name of the searched elements
	 * @param [attrs] - additional attributes of the searched elements
	 */
	protected findElements<T extends HTMLElement>(tag: string, attrs: Dictionary<string> = {}): AbstractElement<T>[] {
		return (<AbstractElement<T>[]>this.elements.filter((element) => element.is(tag, attrs)));
	}

	protected removeElements(tag: string, attrs: Dictionary<string>): void {
		const
			stateElements: AbstractElement[] = [];

		this.elements.forEach((element) => {
			if (element.is(tag, attrs)) {
				element.remove();

			} else {
				stateElements.push(element)
			}
		});

		this.elements = stateElements;
	}
}
