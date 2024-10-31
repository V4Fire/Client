/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import log from 'core/log';
import ComponentEngine from 'core/component';

import type { VNode } from 'core/component/engines';
import { getDirectiveContext, patchVnodeEventListener } from 'core/component/directives';

import type { SafeOnDirectiveParams } from 'components/directives/safe-on/interface';

//#if runtime has dummyComponents
import('components/directives/safe-on/test/b-safe-on-dummy');
//#endif

export * from 'components/directives/safe-on/interface';

const logger = log.namespace('v-safe-on');

ComponentEngine.directive('safe-on', {
	beforeCreate(binding: SafeOnDirectiveParams, vnode: VNode) {
		if (binding.arg == null) {
			logger.warn('event name is not specified');
			return;
		}

		const props = vnode.props ?? {};
		vnode.props ??= props;

		const activeModifiers = Object.entries(binding.modifiers).reduce<string[]>((acc, [modifier, value]) => {
			if (value) {
				acc.push(modifier);
			}

			return acc;
		}, ['safe']);

		const vOnKey = `@${binding.arg}.${activeModifiers.join('.')}`;

		patchVnodeEventListener(
			getDirectiveContext(binding, vnode),
			vnode,
			props,
			vOnKey,
			binding.value
		);
	}
});
