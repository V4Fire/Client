/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { unmute } from 'core/object/watch';

import { callMethodFromComponent } from 'core/component/method';
import { runHook } from 'core/component/hook';

import type { ComponentInterface, Hook } from 'core/component/interface';

const
	remoteActivationLabel = Symbol('The remote activation label');

/**
 * Initializes the "created" state to the specified component instance
 * @param component
 */
export function createdState(component: ComponentInterface): void {
	if (component.hook !== 'beforeDataCreate') {
		return;
	}

	const {
		unsafe,
		unsafe: {
			$root: r,
			$async: $a,
			$normalParent: parent
		}
	} = component;

	unmute(unsafe.$fields);
	unmute(unsafe.$systemFields);

	const isDynamicallyMountedComponent =
		parent != null && '$remoteParent' in r;

	if (isDynamicallyMountedComponent) {
		const
			p = parent.unsafe,
			destroy = unsafe.$destroy.bind(unsafe);

		p.$once('[[BEFORE_DESTROY]]', destroy);
		$a.worker(() => p.$off('[[BEFORE_DESTROY]]', destroy));

		const isRegular =
			unsafe.meta.params.functional !== true;

		if (isRegular) {
			const activationHooks = Object.createDict({
				activated: true,
				deactivated: true
			});

			const onActivation = (status: Hook) => {
				if (activationHooks[status] == null) {
					return;
				}

				if (status === 'deactivated') {
					component.deactivate();
					return;
				}

				$a.requestIdleCallback(component.activate.bind(component), {
					label: remoteActivationLabel,
					timeout: 50
				});
			};

			if (activationHooks[p.hook] != null) {
				onActivation(p.hook);
			}

			p.$on('on-hook-change', onActivation);
			$a.worker(() => p.$off('on-hook-change', onActivation));
		}
	}

	runHook('created', component).then(() => {
		callMethodFromComponent(component, 'created');
	}).catch(stderr);
}
