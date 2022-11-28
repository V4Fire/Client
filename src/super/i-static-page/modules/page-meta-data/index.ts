/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { PageMetaDataStorage, PageMetaDataLink, PageMetaDataMeta } from 'super/i-static-page/modules/page-meta-data/interface';

export * from 'super/i-static-page/modules/page-meta-data/interface';

export default class PageMetaData {
	protected _storage: PageMetaDataStorage = {
		title: undefined,
		meta: [],
		links: []
	};

	get title(): string {
		const {title} = this._storage;

		if (title == null) {
			this._storage.title = document.title;
		}

		return this._storage.title!;
	}

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

	get description(): string {
		const descriptionMeta = this.getMeta('description');

		return descriptionMeta?.content ?? '';
	}

	set description(value: string) {
		if (!Object.isString(value)) {
			return;
		}

		this.addMeta('description', value);
	}

	getLink(rel: string): PageMetaDataLink | undefined {
		return this._storage.links.find((link: PageMetaDataLink) => link.rel === rel);
	}

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

	getMeta(name: string): PageMetaDataMeta | undefined {
		return this._storage.meta.find((item: PageMetaDataMeta) => item.name === name);
	}

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

	protected getMetaTag(name: string): HTMLMetaElement {
		let metaTag = this.findMetaTag(name);

		if (!metaTag) {
			metaTag = <HTMLMetaElement>this.createTag('meta', {name});
		}

		return metaTag;
	}

	protected getLinkTag(rel: string): HTMLLinkElement {
		let linkTag = this.findLinkTag(rel);

		if (!linkTag) {
			linkTag = <HTMLLinkElement>this.createTag('link', {rel});
		}

		return linkTag;
	}

	protected findMetaTag(name: string): HTMLMetaElement | undefined {
		return [].find.call(
			document.getElementsByTagName('meta'),
			(item: HTMLMetaElement) => item.name === name
		);
	}

	protected findLinkTag(linkRel: string): HTMLLinkElement | undefined {
		return [].find.call(
			document.getElementsByTagName('link'),
			(item: HTMLLinkElement) => item.rel === linkRel
		);
	}

	protected createTag(tag: string, opts: Dictionary<string>): HTMLElement {
		const elem = document.createElement(tag);
		Object.assign(elem, opts);

		return document.head.appendChild(elem);
	}
}
