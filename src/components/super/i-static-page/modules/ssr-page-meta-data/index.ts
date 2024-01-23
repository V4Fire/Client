/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { State } from 'core/component/state';
import type iBlock from 'components/super/i-block/i-block';
import type {

	MetaAttributes,
	LinkAttributes

} from 'components/super/i-static-page/modules/page-meta-data/interface';

export * from 'components/super/i-static-page/modules/page-meta-data/interface';

export default class SSRPageMetaData {
	/**
	 * Current page title
	 */
	get title(): string {
		return this.remoteState.seo.title;
	}

	/**
	 * Sets a new title for the current page
	 * @param value - the new title value
	 */
	set title(value: string) {
		this.remoteState.seo.title = value;
	}

	/**
	 * Current page description
	 */
	get description(): string {
		return this.remoteState.seo.description;
	}

	/**
	 * Sets a new description for the current page
	 * @param value - the new description value
	 */
	set description(value: string) {
		this.remoteState.seo.description = value;
	}

	/**
	 * A link to the object for working with the seo state
	 */
	protected remoteState: State;

	constructor(component: iBlock) {
		this.remoteState = component.remoteState;
	}

	/**
	 * Adds a new link tag with the given attributes to the current page
	 * @param attrs - attributes for the created tag
	 */
	addLink(attrs: LinkAttributes): void {
		this.remoteState.seo.links.push(attrs);
	}

	/**
	 * Adds a new meta element on a page
	 * @param attrs - attributes for the created tag
	 */
	addMeta(attrs: MetaAttributes): void {
		this.remoteState.seo.meta.push(attrs);
	}

	/**
	 * Searches for meta elements with the given attributes and returns them
	 * @param attrs - additional attributes of the searched elements
	 */
	findMetas(attrs: MetaAttributes): MetaAttributes[] {
		return this.remoteState.seo.meta.filter(
			(meta: MetaAttributes) => Object.fastCompare(attrs, meta)
		);
	}

	/**
	 * Searches for link elements with the given attributes and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findLinks(attrs: LinkAttributes): LinkAttributes[] {
		return this.remoteState.seo.links.filter(
			(meta: LinkAttributes) => Object.fastCompare(attrs, meta)
		);
	}

	/**
	 * Устанавливает ссылку `<link rel="canonical" />`
	 * @param [pathname] - строка содержащая первый '/' после хоста с последующим текстом URL
	 */
	setCanonicalLink(pathname?: string): void {
		// todo
	}

	/**
	 * Удаляет ссылку `<link rel="canonical" />`
	 */
	removeCanonicalLink(): NodeListOf<HTMLLinkElement> {
		// todo
	}

	/**
	 * Удаляет мета элемент со страницы
	 * @param attrs
	 */
	removeMeta(attrs: MetaAttributes): NodeListOf<HTMLMetaElement> {
		// todo
	}

	/**
	 * Creates a new element and inserts it into the page `<head>`
	 *
	 * @param tag - the element tag name to create
	 * @param [attrs] - additional attributes of the created element
	 */
	protected createElement<T extends HTMLElement>(tag: string, attrs?: Dictionary<string>): T {
		const el = Object.assign(<T>globalThis.document.createElement(tag), attrs);
		return globalThis.document.head.appendChild(el);
	}
}
