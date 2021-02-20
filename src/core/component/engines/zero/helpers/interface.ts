/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { DirectiveOptions } from 'vue';
import { ComponentElement } from 'core/component';

export type DocumentFragmentP = DocumentFragment & {
	getAttribute(nm: string): void;
	setAttribute(nm: string, val: string): void;
};

export type DirElement =
	Element |
	ComponentElement |
	DocumentFragmentP;

export interface Options extends Dictionary {
	filters: Dictionary<Function>;
	directives: Dictionary<DirectiveOptions>;
}
