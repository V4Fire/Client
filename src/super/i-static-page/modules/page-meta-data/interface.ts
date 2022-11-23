/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface PageMetaDataStorage {
	title?: string;
	meta: PageMetaDataMeta[];
	links: PageMetaDataLink[];
}

export interface PageMetaDataLink {
	rel: string;
	href: string;
}

export interface PageMetaDataMeta {
	name: string;
	content: string;
}
