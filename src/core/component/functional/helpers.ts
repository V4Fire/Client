/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as init from 'core/component/init';
import type { ComponentInterface } from 'core/component/interface';

const
	componentInitLabel = Symbol('The component initialization label');

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

	unsafe.$on('[[COMPONENT_HOOK]]', async (hook, node) => {
		switch (hook) {
			case 'mounted':
				unsafe.unsafe.$el = node;
				init.mountedState(unsafe);
				break;

			case 'beforeUpdate':
				break;

			case 'updated': {
				inheritContext(unsafe, node.component);

				await unsafe.$async.promise(unsafe.$nextTick(), {
					label: componentInitLabel
				});

				init.createdState(unsafe);
				init.mountedState(unsafe);

				break;
			}

			case 'beforeDestroy': {
				unsafe.$destroy();
				break;
			}

			default:
				init[`${hook}State`](unsafe);
		}
	});

	return component;
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

	for (let keys = Object.keys(parentProps), i = 0; i < keys.length; i++) {
		const
			prop = keys[i],
			linked = parentCtx.$syncLinkCache.get(prop);

		if (linked != null) {
			for (let keys = Object.keys(linked), i = 0; i < keys.length; i++) {
				const
					link = linked[keys[i]];

				if (link != null) {
					linkedFields[link.path] = prop;
				}
			}
		}
	}

	const fields = [
		parentCtx.meta.systemFields,
		parentCtx.meta.fields
	];

	for (let i = 0; i < fields.length; i++) {
		const
			cluster = fields[i],
			keys = Object.keys(cluster);

		for (let j = 0; j < keys.length; j++) {
			const
				key = keys[j],
				field = cluster[key];

			if (field == null) {
				continue;
			}

			const
				link = linkedFields[key];

			const
				val = ctx[key],
				oldVal = parentCtx[key];

			const needMerge =
				ctx.$modifiedFields[key] !== true &&

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

						ctx[key] = newVal;

					} else if (Object.isFunction(field.merge)) {
						field.merge(ctx, parentCtx, key, link);
					}

				} else {
					ctx[key] = parentCtx[key];
				}
			}
		}
	}
}
