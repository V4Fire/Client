/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentInterface, ComponentDestructorOptions } from 'core/component/interface';

/**
 * Overrides inheritable parameters for the given component based on those of the parent
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

	// Here, the functional component is recreated during re-rendering.
	// Therefore, the destructor call should not be recursively propagated to child components.
	// Additionally, we should not unmount the vnodes created within the component.
	parentCtx.$destroy(<ComponentDestructorOptions>{recursive: false, shouldUnmountVNodes: false});

	const linkedFields = {};

	const
		props = ctx.$props,
		parentProps = parentCtx.$props,
		parentKeys = Object.keys(parentProps);

	for (let i = 0; i < parentKeys.length; i++) {
		const
			prop = parentKeys[i],
			linked = parentCtx.$syncLinkCache.get(prop);

		if (linked != null) {
			const links = Object.values(linked);

			for (let i = 0; i < links.length; i++) {
				const link = links[i];

				if (link != null) {
					linkedFields[link.path] = prop;
				}
			}
		}
	}

	for (const cluster of [parentCtx.meta.systemFields, parentCtx.meta.fields]) {
		const keys = Object.keys(cluster);

		for (let i = 0; i < keys.length; i++) {
			const
				name = keys[i],
				field = cluster[name];

			if (field == null) {
				continue;
			}

			const link = linkedFields[name];

			const
				val = ctx[name],
				oldVal = parentCtx[name];

			const needMerge =
				ctx.$modifiedFields[name] !== true &&

				(
					Object.isFunction(field.unique) ?
						!Object.isTruly(field.unique(ctx, Object.cast(parentCtx))) :
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
						let newVal = oldVal;

						if (Object.isDictionary(val) || Object.isDictionary(oldVal)) {
							// eslint-disable-next-line prefer-object-spread
							newVal = Object.assign({}, val, oldVal);

						} else if (Object.isArray(val) || Object.isArray(oldVal)) {
							newVal = Object.assign([], val, oldVal);
						}

						ctx[name] = newVal;

					} else if (Object.isFunction(field.merge)) {
						field.merge(ctx, Object.cast(parentCtx), name, link);
					}

				} else {
					ctx[name] = parentCtx[name];
				}
			}
		}
	}
}
