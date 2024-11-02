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

const logger = log.namespace('vue');

Vue.config.errorHandler = (err, vm, info) => {
	logger.error('errorHandler', err, info, getComponentInfo(vm));
};

Vue.config.warnHandler = (msg, vm, trace) => {
	// It prevents event loop freeze (check CHANGELOG for details)
	const omitDetails = Object.isString(msg) &&
		msg.endsWith('was accessed during render but is not defined on instance.');

	logger.warn('warnHandler', msg, trace, getComponentInfo(vm, omitDetails));
};

const
	UNRECOGNIZED_COMPONENT_NAME = 'unrecognized-component',
	ROOT_COMPONENT_NAME = 'root-component';

/**
 * Returns a dictionary with information for debugging or logging the component
 *
 * @param component
 * @param omitDetails
 */
function getComponentInfo(
	component: Nullable<ComponentPublicInstance | ComponentInterface>,
	omitDetails: boolean = false
): Dictionary {
	if (component == null) {
		return {
			name: UNRECOGNIZED_COMPONENT_NAME
		};
	}

	if ('componentName' in component && !omitDetails) {
		return {
			name: getComponentName(component),
			...component.getComponentInfo?.()
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

	return component.$options.name ?? UNRECOGNIZED_COMPONENT_NAME;
}
