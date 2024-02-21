/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { concatURLs } from 'core/url';
import type { SeoState } from 'core/component/state';
import type iBlock from 'components/super/i-block/i-block';
import type { LinkAttributes, MetaAttributes } from 'components/super/i-static-page/modules/page-meta-data';

export * from 'components/super/i-static-page/modules/page-meta-data/interface';

export default class SSRPageMetaData {
	/**
	 * Current page title
	 */
	get title(): string {
		return this.seoState.title;
	}

	/**
	 * Sets a new title for the current page to the storage
	 * @param value - the new title value
	 */
	set title(value: string) {
		this.seoState.title = value;
	}

	/**
	 * Current page description
	 */
	get description(): string {
		return this.seoState.description;
	}

	/**
	 * Sets a new description for the current page to the storage
	 * @param value - the new description value
	 */
	set description(value: string) {
		this.seoState.description = value;
		this.addMeta({name: 'description', content: value});
	}

	/**
	 * A link to the storage object for working with the seo state
	 */
	protected seoState: SeoState;

	constructor(component: iBlock) {
		this.seoState = component.remoteState.seo!;

		Object.defineProperty(this.seoState, 'toString', {
			enumerable: false,
			writable: false,
			value(this: SeoState) {
				const meta = this.meta.map((attr) => attr.toString()).join(' ');
				const links = this.links.map((attr) => attr.toString()).join(' ');

				return [
					`<title>${this.title}</title>`,
					meta,
					links,
				].join(' ');
			}
		});
	}

	/**
	 * Adds a new link tag with the given attributes to the storage
	 * @param attrs - attributes for the created tag
	 */
	addLink(attrs: LinkAttributes): void {
		const {createElement} = this;

		const linkAttrs = Object.defineProperty({...attrs}, 'toString', {
			enumerable: false,
			writable: false,
			value() {
				return createElement('link', this);
			}
		});

		this.seoState.links.push(linkAttrs);
	}

	/**
	 * Adds a new meta element to the storage
	 * @param attrs - attributes for the created tag
	 */
	addMeta(attrs: MetaAttributes): void {
		const {createElement} = this;

		const metaAttrs = Object.defineProperty({...attrs}, 'toString', {
			enumerable: false,
			writable: false,
			value() {
				return createElement('meta', this);
			}
		});

		this.seoState.links.push(metaAttrs);
	}

	/**
	 * Searches for meta elements with the given attributes in the storage and returns them
	 * @param attrs - additional attributes of the searched elements
	 */
	findMetas(attrs: MetaAttributes): MetaAttributes[] {
		return this.seoState.meta.filter(
			(meta: MetaAttributes) => Object.fastCompare(attrs, meta)
		);
	}

	/**
	 * Searches for link elements with the given attributes in the storage and returns them
	 * @param attrs - attributes of the searched elements
	 */
	findLinks(attrs: LinkAttributes): LinkAttributes[] {
		return this.seoState.links.filter(
			(link: LinkAttributes) => Object.fastCompare(attrs, link)
		);
	}

	/**
	 * Sets canonical link `<link rel="canonical" />` to the storage
	 * @param [pathname] - string containing the first '/' after the domain with the subsequent URL text
	 */
	setCanonicalLink(pathname?: string): void {
		const
			links = this.findLinks({rel: 'canonical'}),
			href = concatURLs(location.origin, pathname, location.search);

		if (Object.isEmpty(links)) {
			this.addLink({rel: 'canonical', href});

		} else {
			links[0].href = href;
		}
	}

	/**
	 * Removes canonical link `<link rel="canonical" />` from the storage
	 */
	removeCanonicalLink(): LinkAttributes[] {
		const
			removedLinks: LinkAttributes[] = [],
			stateLinks: LinkAttributes[] = [];

		this.seoState.links.forEach((link: LinkAttributes) => {
			if (link.rel === 'canonical') {
				removedLinks.push(link);

			} else {
				stateLinks.push(link)
			}
		});

		this.seoState.links = stateLinks;

		return removedLinks;
	}

	/**
	 * Removes meta element from the storage
	 * @param attrs
	 */
	removeMeta(attrs: MetaAttributes): MetaAttributes[] {
		const
			removedMeta: LinkAttributes[] = [],
			stateMeta: LinkAttributes[] = [];

		this.seoState.meta.forEach((metaAttrs: MetaAttributes) => {
			if (Object.fastCompare(metaAttrs, attrs)) {
				removedMeta.push(metaAttrs);

			} else {
				stateMeta.push(metaAttrs)
			}
		});

		this.seoState.meta = stateMeta;

		return removedMeta;
	}

	/**
	 * Creates a new element as a string
	 *
	 * @param tag - the element tag name to create
	 * @param [attrs] - additional attributes of the created element
	 */
	protected createElement(tag: string, attrs: Dictionary<string> = {}): string {
		const attrsString = Object.keys(attrs)
			.map((key) => `${key}="${attrs[key]}"`)
			.join(' ');

		return `<${tag} ${attrsString} />`;
	}
}
