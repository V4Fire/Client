/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { DirectiveOptions, VNodeData as BaseVNodeData } from 'vue';

export interface VNodeData extends BaseVNodeData {
	model?: {
		expression: string;
		value: unknown;
		callback(value: unknown): void;
	};
}

export interface Options extends Dictionary {
	filters: Dictionary<Function>;
	directives: Dictionary<DirectiveOptions>;
}
