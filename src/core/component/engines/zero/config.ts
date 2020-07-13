/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VueConfiguration } from 'vue/types/vue';

export default <VueConfiguration>{
	silent: true,
	devtools: false,
	productionTip: false,
	performance: false,
	optionMergeStrategies: {},
	keyCodes: {},
	ignoredElements: [],
	errorHandler: console.error,
	warnHandler: console.warn,
	async: false
};
