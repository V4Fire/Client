/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { HandlerAttachment } from 'core/component/directives/aria/roles/interface';
import type { Orientation } from 'core/component/directives/aria';

export interface ListboxParams {
	multiselectable?: boolean;
	orientation?: Orientation;
	label?: string;
	labelledby?: string;
}

export class ListboxParams {
	standAlone: boolean = true;
	'@change'?: HandlerAttachment = () => undefined;
}
