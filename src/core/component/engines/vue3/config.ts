/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';

import type { ComponentPublicInstance } from 'vue';
import Vue from 'core/component/engines/vue3/lib';

import type { ComponentInterface } from 'core/component/interface';

const
	logger = log.namespace('vue');

Vue.config.errorHandler = (err, vm, info) => {
	console.log(err);
	//logger.error('errorHandler', err, info, getComponentInfoLog(vm));
};

Vue.config.warnHandler = (msg, vm, trace) => {
	//logger.warn('warnHandler', msg, trace, getComponentInfoLog(vm));
};

const
	UNRECOGNIZED_COMPONENT_NAME = 'unrecognized-component',
	ROOT_COMPONENT_NAME = 'root-component';

/**
 * Returns information of the specified component to log
 * @param component
 */
function getComponentInfoLog(component: Nullable<ComponentPublicInstance | ComponentInterface>): Dictionary {
	if (component == null) {
		return {
			name: UNRECOGNIZED_COMPONENT_NAME
		};
	}

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

/**
 * Returns a name of the specified component
 * @param component
 */
function getComponentName(component: ComponentPublicInstance | ComponentInterface): string {
	if ('componentName' in component) {
		return component.componentName;
	}

	if (component.$root === component) {
		return ROOT_COMPONENT_NAME;
	}

	return Object.get<string>(component, '$options.name') ?? UNRECOGNIZED_COMPONENT_NAME;
}
