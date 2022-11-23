/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PageMetaDataStorage, PageMetaDataLink, PageMetaDataMeta } from 'super/i-static-page/modules/page-meta-data/interface';

export * from 'super/i-static-page/modules/page-meta-data/interface';

/**
 * Class provides API to work with metadata of page
 */
export default class PageMetaData {
	protected _storage: PageMetaDataStorage = {
		title: undefined,
		meta: [],
		links: []
	};

	/**
	 * Current title of page
	 */
	get title(): string {
		const {title} = this._storage;

		if (title == null) {
			this._storage.title = document.title;
		}

		return this._storage.title!;
	}

	/**
	 * Sets a title of page
	 *
	 * @param value - new title value
	 */
	set title(value: string) {
		if (!Object.isString(value)) {
			return;
		}

		const
			div = Object.assign(document.createElement('div'), {innerHTML: value}),
			title = div.textContent ?? '';

		// Fix strange Chrome bug
		// tslint:disable-next-line:no-irregular-whitespace
		document.title = `${title} `;
		document.title = title;

		this._storage.title = title;
	}

	/**
	 * Current description of page
	 */
	get description(): string {
		const descriptionMeta = this.getMeta('description');

		return descriptionMeta?.content ?? '';
	}

	/**
	 * Sets a description of page
	 *
	 * @param value - new description value
	 */
	set description(value: string) {
		if (!Object.isString(value)) {
			return;
		}

		this.addMeta('description', value);
	}

	/**
	 * Return a content of specified link tag
	 *
	 * @param rel - rel of link
	 */
	getLink(rel: string): PageMetaDataLink | undefined {
		let storageLink = this._storage.links.find((link: PageMetaDataLink) => link.rel === rel);

		if (!storageLink) {
			const linkTag = this.findLinkTag(rel);

			if (linkTag) {
				storageLink = {
					rel,
					href: linkTag.href
				};

				this._storage.links.push(storageLink);
			}
		}

		return storageLink;
	}

	/**
	 * Adds a new link tag on page
	 *
	 * @param rel - rel of link
	 * @param href - href of link
	 */
	addLink(rel: string, href: string): void {
		const
			linkTag = this.getLinkTag(rel),
			link = this.getLink(rel);

		if (link) {
			link.href = href;

		} else {
			this._storage.links.push({
				rel,
				href
			});
		}

		linkTag.href = href;
	}

	/**
	 * Returns a content of specified meta tag
	 *
	 * @param name - name of meta
	 */
	getMeta(name: string): PageMetaDataMeta | undefined {
		let storageMeta = this._storage.meta.find((item: PageMetaDataMeta) => item.name === name);

		if (!storageMeta) {
			const metaTag = this.findMetaTag(name);

			if (metaTag) {
				storageMeta = {
					name,
					content: metaTag.content
				};

				this._storage.meta.push(storageMeta);
			}
		}

		return storageMeta;
	}

	/**
	 * Adds a new meta tag on page
	 *
	 * @param name - name of meta tag
	 * @param content - content of meta tag
	 */
	addMeta(name: string, content: string): void {
		const
			metaTag = this.getMetaTag(name),
			meta = this.getMeta(name);

		if (meta) {
			meta.content = content;

		} else {
			this._storage.meta.push({
				name,
				content
			});
		}

		metaTag.content = content;
	}

	/**
	 * Search on page meta tag by name,
	 * if nothing found create it
	 *
	 * @param name - name of meta tag
	 */
	protected getMetaTag(name: string): HTMLMetaElement {
		let metaTag = this.findMetaTag(name);

		if (!metaTag) {
			metaTag = <HTMLMetaElement>this.createTag('meta', {name});
		}

		return metaTag;
	}

	/**
	 * Search on page link tag by rel,
	 * if nothing found create it
	 *
	 * @param rel - rel of link tag
	 */
	protected getLinkTag(rel: string): HTMLLinkElement {
		let linkTag = this.findLinkTag(rel);

		if (!linkTag) {
			linkTag = <HTMLLinkElement>this.createTag('link', {rel});
		}

		return linkTag;
	}

	/**
	 * Search on page meta tag by name
	 *
	 * @param name - name of meta tag
	 */
	protected findMetaTag(name: string): HTMLMetaElement | undefined {
		return [].find.call(
			document.getElementsByTagName('meta'),
			(item: HTMLMetaElement) => item.name === name
		);
	}

	/**
	 * Search on page link tag by rel
	 *
	 * @param linkRel - rel of link tag
	 */
	protected findLinkTag(linkRel: string): HTMLLinkElement | undefined {
		return [].find.call(
			document.getElementsByTagName('link'),
			(item: HTMLLinkElement) => item.rel === linkRel
		);
	}

	/**
	 * Create a new tag and insert it into page head
	 *
	 * @param tag - tag name
	 * @param properties - tag properties
	 */
	protected createTag(tag: string, properties: Dictionary<string>): HTMLElement {
		const elem = document.createElement(tag);
		Object.assign(elem, properties);

		return document.head.appendChild(elem);
	}
}
