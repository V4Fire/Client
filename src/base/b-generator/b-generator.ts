/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { component, prop } from 'super/i-block/i-block';
export * from 'super/i-block/i-block';

export interface Attrs extends Dictionary {
	slots: Dictionary<string | CanArray<Document>>;
}

export interface Document {
	component: string;
	attrs: Attrs;
}

@component({flyweight: true, functional: true})
export default class bGenerator extends iBlock {
	/**
	 * List of content
	 */
	@prop(Array)
	content: Document[] = [];
}
