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

	const
		parentProps = parentCtx.getPassedProps?.(),
		linkedFields = {};

	if (parentProps != null) {
		const propNames = Object.keys(parentProps);

		for (let i = 0; i < propNames.length; i++) {
			const
				propName = propNames[i],
				linked = parentCtx.$syncLinkCache.get(propName);

			if (linked != null) {
				const links = Object.values(linked);

				for (let i = 0; i < links.length; i++) {
					const link = links[i];

					if (link != null) {
						linkedFields[link.path] = propName;
					}
				}
			}
		}
	}

	const parentMeta = parentCtx.meta;

	const clusters = <const>[
		[parentMeta.systemFields, parentMeta.systemFieldInitializers],
		[parentMeta.fields, parentMeta.fieldInitializers]
	];

	for (const [cluster, fields] of clusters) {
		for (let i = 0; i < fields.length; i++) {
			const
				fieldName = fields[i][0],
				field = cluster[fieldName];

			if (field == null) {
				continue;
			}

			const link = linkedFields[fieldName];

			const
				val = ctx[fieldName],
				oldVal = parentCtx[fieldName];

			const needMerge =
				ctx.$modifiedFields[fieldName] !== true &&

				(
					Object.isFunction(field.unique) ?
						!Object.isTruly(field.unique(ctx, parentCtx)) :
						!field.unique
				) &&

				!Object.fastCompare(val, oldVal) &&

				(
					link == null ||
					Object.fastCompare(ctx[link], parentCtx[link])
				);

			if (needMerge) {
				if (field.merge === true) {
					let newVal = oldVal;

					if (Object.isDictionary(val) || Object.isDictionary(oldVal)) {
						// eslint-disable-next-line prefer-object-spread
						newVal = Object.assign({}, val, oldVal);

					} else if (Object.isArray(val) || Object.isArray(oldVal)) {
						newVal = Object.assign([], val, oldVal);
					}

					ctx[fieldName] = newVal;

				} else if (Object.isFunction(field.merge)) {
					field.merge(ctx, parentCtx, fieldName, link);

				} else {
					ctx[fieldName] = parentCtx[fieldName];
				}
			}
		}
	}
}
