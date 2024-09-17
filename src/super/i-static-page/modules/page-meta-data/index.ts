/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { MetaAttributes, LinkAttributes } from 'super/i-static-page/modules/page-meta-data/interface';

export * from 'super/i-static-page/modules/page-meta-data/interface';

/**
 * Class provides API to work with the metadata of a page
 */
export default class PageMetaData {
	/**
	 * Current title of a page
	 */
	get title(): string {
		return document.title;
	}

	/**
	 * Sets a title of a page
	 * @param value - new title value
	 */
	set title(value: string) {
		document.title = value;
	}

	/**
	 * Current description of a page
	 */
	get description(): string {
		const descriptionMeta = this.findElementsWithAttrs<HTMLMetaElement>('meta', {name: 'description'});

		if (descriptionMeta.length > 0) {
			return descriptionMeta[0].content;
		}

		return '';
	}

	/**
	 * Sets a description of a page
	 * @param content - new description content value
	 */
	set description(content: string) {
		const metaAttrs = {name: 'description'};
		const metaDescriptionElements = this.findElementsWithAttrs<HTMLMetaElement>('meta', metaAttrs);

		let metaDescriptionElement: HTMLMetaElement | undefined;

		if (metaDescriptionElements.length > 0) {
			metaDescriptionElement = metaDescriptionElements[0];
		} else {
			metaDescriptionElement = this.createElement<HTMLMetaElement>('meta', metaAttrs);
		}

		metaDescriptionElement.content = content;
	}

	/**
	 * Returns specified link elements
	 * @param atrs - attributes of searched link
	 */
	getLinks(attrs?: LinkAttributes): NodeListOf<HTMLLinkElement> {
		return this.findElementsWithAttrs('link', attrs);
	}

	/**
	 * Adds a new link tag on a page
	 * @param attrs - rel of link
	 */
	addLink(attrs: LinkAttributes): HTMLLinkElement {
		return this.createElement<HTMLLinkElement>('link', attrs);
	}

	/**
	 * Returns specified meta elements
	 * @param attrs - attributes of searched meta element
	 */
	getMeta(attrs?: MetaAttributes): NodeListOf<HTMLMetaElement> {
		return this.findElementsWithAttrs<HTMLMetaElement>('meta', attrs);
	}

	/**
	 * Adds a new meta element on a page
	 * @param attrs - attributes of added meta element
	 */
	addMeta(attrs: MetaAttributes): HTMLMetaElement {
		return this.createElement<HTMLMetaElement>('meta', attrs);
	}

	/**
	 * Search the elements with specified tag and attributes on the page
	 *
	 * @param tag - tag of searched elements
	 * @param attrs - attributes of searched elements
	*/
	protected findElementsWithAttrs<T extends Element = Element>(tag: string, attrs?: Dictionary<string>): NodeListOf<T> {
		const queryParams: string[] = [];

		for (const attrName in attrs) {
			if (attrs.hasOwnProperty(attrName)) {
				const attrValue = attrs[attrName];
				queryParams.push(`[${attrName}=${attrValue}]`);
			}
		}

		const queryString = `${tag}${queryParams.length > 0 ? queryParams.join('') : ''}`;

		return document.querySelectorAll<T>(queryString);
	}

	/**
	 * Creates a new element and inserts into a page head
	 *
	 * @param tag - element tag
	 * @param attrs - element attributes
	 */
	protected createElement<T extends HTMLElement>(tag: string, attrs?: Dictionary<string>): T {
		const elem = document.createElement(tag);
		Object.assign(elem, attrs);

		return <T>document.head.appendChild(elem);
	}
}
