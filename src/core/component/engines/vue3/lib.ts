/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import makeLazy from 'core/lazy';
import { createApp } from 'vue';

const Vue = makeLazy(createApp, {
	use: Function,

	component: Function,
	directive: Function,

	mixin: Function,
	provide: Function,
	version: '',

	mount: Function,
	unmount: Function,

	config: {
		performance: false,

		errorHandler: Function,
		warnHandler: Function,

		compilerOptions: {},
		globalProperties: {},
		optionMergeStrategies: {}
	}
});

export default Vue;
