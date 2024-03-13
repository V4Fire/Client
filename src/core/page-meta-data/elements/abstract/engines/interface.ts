/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { AbstractElement } from 'core/page-meta-data/elements';

export interface Engine<T extends HTMLElement = HTMLElement> {
	render(element: T | AbstractElement<T>, tag: string, attrs: Dictionary<string>): T | string;
	update(element: T | AbstractElement<T>, attrs: Dictionary<string>): T | AbstractElement<T>;
	create?(tag: string, attrs: Dictionary<string>): T ;
	remove?(element: T | AbstractElement<T>): T;
}
