/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { unmute } from 'core/object/watch';

import { destroyedHooks } from 'core/component/const';
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
			$parent: parent
		}
	} = component;

	unmute(unsafe.$fields);
	unmute(unsafe.$systemFields);

	if (parent != null) {
		const
			isRegularComponent = unsafe.meta.params.functional !== true,
			isDynamicallyMountedComponent = '$remoteParent' in r;

		const destroy = (recursive: boolean) => {
			// A component might have already been removed by explicitly calling $destroy
			if (destroyedHooks[unsafe.hook] != null) {
				return;
			}

			if (recursive || isDynamicallyMountedComponent) {
				unsafe.$destroy(recursive);
			}
		};

		parent.unsafe.$once('[[BEFORE_DESTROY]]', destroy);

		unsafe.$async.worker(() => {
			// A component might have already been removed by explicitly calling $destroy
			if (destroyedHooks[parent.hook] != null) {
				return;
			}

			parent.unsafe.$off('[[BEFORE_DESTROY]]', destroy)
		});

		if (isDynamicallyMountedComponent && isRegularComponent) {
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

			const
				normalParent = unsafe.$normalParent!.unsafe;

			if (activationHooks[normalParent.hook] != null) {
				onActivation(normalParent.hook);
			}

			normalParent.$on('on-hook-change', onActivation);
			$a.worker(() => normalParent.$off('on-hook-change', onActivation));
		}
	}

	runHook('created', component).then(() => {
		callMethodFromComponent(component, 'created');
	}).catch(stderr);
}
