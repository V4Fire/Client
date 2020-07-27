/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';

const
	logger = log.namespace('vue');

import Vue from 'vue';

Vue.config.errorHandler = (err, vm, info) => {
	logger.error('errorHandler', err, info, getComponentInfo(vm));
};

Vue.config.warnHandler = (msg, vm, trace) => {
	logger.warn('warnHandler', msg, trace, getComponentInfo(vm));
};

/**
 * Return component info for logging
 * @param vm - component
 */
function getComponentInfo(vm: Vue): Dictionary {
	return {
		name: getComponentName(vm),
		// @ts-ignore - class ComponentInterface has hook property, but Vue hasn't
		hook: vm?.hook,
		// @ts-ignore - class ComponentInterface has componentStatus property, but Vue hasn't
		status: vm?.componentStatus
	};
}

const
	UNRECOGNIZED_COMPONENT_NAME = 'unrecognized-component',
	ROOT_COMPONENT_NAME = 'root-component';

/**
 * Returns a name of a component
 * @param vm - component
 */
function getComponentName(vm: Vue): string {
	if (!vm) {
		return UNRECOGNIZED_COMPONENT_NAME;

	} else if ('componentName' in vm) {
		// @ts-ignore - class ComponentInterface has componentName property, but Vue hasn't
		return vm.componentName;

	} else if (vm.$root === vm) {
		return ROOT_COMPONENT_NAME;

	} else if (vm.$options?.name) {
		return vm.$options?.name;

	}

	return UNRECOGNIZED_COMPONENT_NAME;
}
