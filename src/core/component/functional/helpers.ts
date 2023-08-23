/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as init from 'core/component/init';
import type { ComponentInterface, ComponentElement } from 'core/component/interface';

/**
 * Initializes the default component dynamic lifecycle handlers for the passed functional component.
 * Also, the function adds the ability for the component to emit lifecycle events,
 * such as `mounted` or `destroyed` hooks.
 *
 * @param component
 */
export function initDynamicComponentLifeCycle(component: ComponentInterface): ComponentInterface {
	const
		{unsafe} = component;

	unsafe.$on('[[COMPONENT_HOOK]]', hookHandler);
	return component;

	function hookHandler(hook: string, node: ComponentElement<typeof unsafe>) {
		switch (hook) {
			case 'mounted':
				mount();
				break;

			case 'beforeUpdate':
				break;

			case 'updated': {
				inheritContext(unsafe, node.component);
				init.createdState(unsafe);
				mount();
				break;
			}

			case 'beforeDestroy': {
				unsafe.$destroy();
				break;
			}

			default:
				init[`${hook}State`](unsafe);
		}

		function mount() {
			unsafe.$async.nextTick()
				.then(() => {
					unsafe.unsafe.$el = node;
					init.mountedState(unsafe);
				})

				.catch(stderr);
		}
	}
}

/**
 * Overrides inheritable parameters to the given functional component context from the parent
 *
 * @param ctx
 * @param parentCtx
 */
export function inheritContext(
	ctx: ComponentInterface['unsafe'],
	parentCtx: CanUndef<ComponentInterface['unsafe']>
): void {
	if (
		parentCtx == null ||
		parentCtx === ctx ||
		ctx.componentName !== parentCtx.componentName
	) {
		return;
	}

	parentCtx.unsafe.$destroy();

	const
		props = ctx.$props,
		parentProps = parentCtx.$props;

	const
		linkedFields = {};

	Object.keys(parentProps).forEach((prop) => {
		const
			linked = parentCtx.$syncLinkCache.get(prop);

		if (linked != null) {
			Object.values(linked).forEach((link) => {
				if (link != null) {
					linkedFields[link.path] = prop;
				}
			});
		}
	});

	const fields = [
		parentCtx.meta.systemFields,
		parentCtx.meta.fields
	];

	fields.forEach((cluster) => {
		Object.entries(cluster).forEach(([name, field]) => {
			if (field == null) {
				return;
			}

			const
				link = linkedFields[name];

			const
				val = ctx[name],
				oldVal = parentCtx[name];

			const needMerge =
				ctx.$modifiedFields[name] !== true &&

				(
					Object.isFunction(field.unique) ?
						!Object.isTruly(field.unique(ctx, parentCtx)) :
						!field.unique
				) &&

				!Object.fastCompare(val, oldVal) &&

				(
					link == null ||
					Object.fastCompare(props[link], parentProps[link])
				);

			if (needMerge) {
				if (Object.isTruly(field.merge)) {
					if (field.merge === true) {
						let
							newVal = oldVal;

						if (Object.isPlainObject(val) || Object.isPlainObject(oldVal)) {
							// eslint-disable-next-line prefer-object-spread
							newVal = Object.assign({}, val, oldVal);

						} else if (Object.isArray(val) || Object.isArray(oldVal)) {
							newVal = Object.assign([], val, oldVal);
						}

						ctx[name] = newVal;

					} else if (Object.isFunction(field.merge)) {
						field.merge(ctx, parentCtx, name, link);
					}

				} else {
					ctx[name] = parentCtx[name];
				}
			}
		});
	});
}
