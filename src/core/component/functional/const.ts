/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

export const
	$$ = symbolGenerator();

export const componentOpts = [
	'filters',
	'directives',
	'components'
];

export const destroyCheckHooks = [
	'beforeMounted',
	'created',
	'beforeDestroy'
];

export const destroyHooks = [
	'beforeDestroy',
	'destroyed'
];

export const mountHooks = [
	'beforeMounted',
	'beforeUpdated',
	'beforeActivated'
];

export const parentMountMap = Object.createDict({
	beforeMount: 'beforeMounted',
	beforeUpdate: 'beforeUpdated',
	deactivated: 'beforeActivated'
});
