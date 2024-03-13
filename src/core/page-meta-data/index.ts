/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { concatURLs } from 'core/url';
import remoteState from 'core/component/client-state';
import type { State } from 'core/component';
import { SSREngine, CSREngine} from 'core/page-meta-data/elements/abstract/engines';
import { CSRTitleEngine } from 'core/page-meta-data/elements/title';

import {

	Link,
	Meta,
	Title,
	AbstractElement,
	MetaAttributes,
	LinkAttributes

} from 'core/page-meta-data/elements';
import ElementsStorage from "core/page-meta-data/storage";

export default class PageMetaData {
	protected elements: ElementsStorage = new ElementsStorage();

	protected state: State = remoteState;

	get meta(): AbstractElement[] {
		return [...this.elements];
	}

	/**
	 * Current page title
	 */
	get title(): string {
		const element = this.elements.getTitle();
		return element?.getAttr('content') ?? '';
	}

	/**
	 * Sets a new title for the current page
	 * @param value - the new title value
	 */
	set title(value: string) {
		const title = new Title(
			SSR ? new SSREngine() : new CSRTitleEngine(),
			{text: value}
		);

		this.elements.setTitle(title);
	}

	/**
	 * Current page description
	 */
	get description(): string {
		const element = this.elements.getDescription();
		return element?.getAttr('content') ?? '';
	}

	/**
	 * Sets a new description for the current page
	 * @param value - the new description value
	 */
	set description(value: string) {
		// this.addMeta({
		// 	name: 'description',
		// 	content: value
		// });

		this.elements.setDescription(new Meta(
			SSR ? SSREngine : CSREngine,
			{
				name: 'description',
				content: value
			}
		));
	}

	/**
	 * Adds a new link tag with the given attributes to the current page
	 * @param attrs - attributes for the created tag
	 */
	addLink(attrs: LinkAttributes): void {
		this.elements.addLink(new Link(
			SSR ? new SSREngine() : new CSREngine<HTMLLinkElement>(),
			attrs
		));
	}

	/**
	 * Searches for link elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findLinks(attrs: LinkAttributes): Array<HTMLLinkElement | Link> {
		// const links = this.findElements<HTMLLinkElement>('links', attrs);
		const links = this.elements.findLinks(attrs);
		return links.map((el) => el.get());
	}

	/**
	 * Adds a new meta element on a page
	 * @param attrs - attributes for the created tag
	 */
	addMeta(attrs: MetaAttributes): void {
		this.elements.addMeta(new Meta(
			SSR ? new SSREngine() : new CSREngine<HTMLMetaElement>(),
			attrs
		));
	}

	/**
	 * Searches for meta elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findMetas(attrs: MetaAttributes): Array<HTMLMetaElement | Meta> {
		// const metas = this.findElements<HTMLMetaElement>('meta', attrs);
		const metas = this.elements.findMetas(attrs);
		return metas.map((el) => el.get());
	}

	/**
	 * Sets canonical link `<link rel="canonical" />` to the page
	 *
	 * @param [pathname] - string containing the first '/' after the domain with the subsequent URL text
	 * @param [query] - query string
	 */
	setCanonicalLink(pathname?: string, query: string = this.state.location.search): void {
		const
			{location} = this.state,
			href = concatURLs(location.origin, pathname, query);

		this.elements.setCanonical(new Meta(
			SSR ? SSREngine : CSREngine,
			{rel: 'canonical', href}
		));
	}

	/**
	 * Removes canonical link `<link rel="canonical" />` from the page
	 */
	removeCanonicalLink(): void {
		this.elements.removeCanonical();
	}

	/**
	 * Removes meta elements from the page
	 * @param attrs
	 */
	removeMeta(attrs: MetaAttributes): void {
		const metas = this.elements.removeMetas(attrs);
		metas.forEach((meta) => meta.remove());
	}

	/**
	 * Removes link elements from the page
	 * @param attrs
	 */
	removeLink(attrs: MetaAttributes): void {
		const metas = this.elements.removeLinks(attrs);
		metas.forEach((link) => link.remove());
	}

	/**
	 * Searches for elements in the document with the given name and attributes and returns them
	 *
	 * @param tag - the tag name of the searched elements
	 * @param [attrs] - additional attributes of the searched elements
	 */
	// protected findElements<T extends HTMLElement>(tag: string, attrs: Dictionary<string> = {}): AbstractElement<T>[] {
	// 	return (<AbstractElement<T>[]>this.elements.filter((element) => element.is(tag, attrs)));
	// }

	// protected removeElements(tag: string, attrs: Dictionary<string>): void {
	// 	const
	// 		stateElements: AbstractElement[] = [];
	//
	// 	this.elements.forEach((element) => {
	// 		if (element.is(tag, attrs)) {
	// 			element.remove();
	//
	// 		} else {
	// 			stateElements.push(element)
	// 		}
	// 	});
	//
	// 	this.elements = stateElements;
	// }
}
