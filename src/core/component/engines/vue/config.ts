/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import Vue from 'vue';
import log from 'core/log';
import { ComponentInterface } from 'core/component/interface';

const
	logger = log.namespace('vue');

Vue.config.errorHandler = (err, vm, info) => {
	logger.error('errorHandler', err, info, getComponentInfo(vm));
};

Vue.config.warnHandler = (msg, vm, trace) => {
	logger.warn('warnHandler', msg, trace, getComponentInfo(vm));
};

/**
 * Returns component info to log
 * @param component
 */
function getComponentInfo(component: Vue | ComponentInterface): Dictionary {
	if ('componentName' in component) {
		return {
			name: getComponentName(component),
			hook: component.hook,
			status: component.unsafe.componentStatus
		};
	}

	return {
		name: getComponentName(component)
	};
}

const
	UNRECOGNIZED_COMPONENT_NAME = 'unrecognized-component',
	ROOT_COMPONENT_NAME = 'root-component';

interface VueWithComponentTag extends Vue {
	_componentTag?: string;
}

/**
 * Returns a name of the specified component
 * @param component
 */
function getComponentName(component: VueWithComponentTag | ComponentInterface): string {
	if ('componentName' in component) {
		return component.componentName;
	}

	if (component.$root === component) {
		return ROOT_COMPONENT_NAME;
	}

	// @see https://github.com/V4Fire/Client/issues/312
	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	if (component?.$options?.name != null) {
		return component.$options.name;
	}

	if (Object.isString(component._componentTag)) {
		return component._componentTag;
	}

	return UNRECOGNIZED_COMPONENT_NAME;
}
