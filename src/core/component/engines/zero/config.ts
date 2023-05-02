/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VueConfiguration } from 'vue/types/vue';

export default <VueConfiguration>{
	silent: true,
	devtools: false,
	productionTip: false,
	performance: false,
	optionMergeStrategies: {},
	keyCodes: {},
	ignoredElements: [],
	// eslint-disable-next-line no-console
	errorHandler: console.error,
	// eslint-disable-next-line no-console
	warnHandler: console.warn,
	async: false
};
