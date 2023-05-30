/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type LinkAttributes = {
	[Property in keyof Partial<HTMLLinkElement>]: string;
};

export type MetaAttributes = {
	[Property in keyof Partial<HTMLMetaElement>]: string;
};
