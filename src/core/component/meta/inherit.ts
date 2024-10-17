/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { PARENT } from 'core/component/const';

import type { ModDeclVal } from 'core/component/interface';
import type { ComponentMeta } from 'core/component/meta/interface';

/**
 * Inherits the specified metaobject from another one.
 * This function modifies the original object and returns it.
 *
 * @param meta
 * @param parentMeta
 */
export function inheritMeta(meta: ComponentMeta, parentMeta: ComponentMeta): ComponentMeta {
	meta.tiedFields = {...parentMeta.tiedFields};

	if (parentMeta.metaInitializers.size > 0) {
		meta.metaInitializers = new Map(parentMeta.metaInitializers);
	}

	if (parentMeta.watchDependencies.size > 0) {
		meta.watchDependencies = new Map(parentMeta.watchDependencies);
	}

	inheritParams(meta, parentMeta);

	meta.props = Object.create(parentMeta.props);
	meta.fields = Object.create(parentMeta.fields);
	meta.systemFields = Object.create(parentMeta.systemFields);

	meta.accessors = Object.create(parentMeta.accessors);
	meta.computedFields = Object.create(parentMeta.computedFields);
	meta.methods = Object.create(parentMeta.methods);

	meta.component.props = {...parentMeta.component.props};
	meta.component.attrs = {...parentMeta.component.attrs};
	meta.component.computed = {...parentMeta.component.computed};
	meta.component.methods = {...parentMeta.component.methods};

	if (meta.params.partial == null) {
		inheritMods(meta, parentMeta);
	}

	return meta;
}

/**
 * Inherits the `params` property for a given metaobject based on the parent one.
 * This function modifies the original object.
 *
 * @param meta
 * @param parentMeta
 */
export function inheritParams(meta: ComponentMeta, parentMeta: ComponentMeta): void {
	/* eslint-disable deprecation/deprecation */

	const
		deprecatedProps = meta.params.deprecatedProps ?? {},
		parentDeprecatedProps = parentMeta.params.deprecatedProps;

	meta.params = {
		...parentMeta.params,
		...meta.params,

		deprecatedProps,
		name: meta.params.name
	};

	if (parentDeprecatedProps != null && Object.keys(parentDeprecatedProps).length > 0) {
		meta.params.deprecatedProps = {...parentDeprecatedProps, ...deprecatedProps};
	}

	/* eslint-enable deprecation/deprecation */
}

/**
 * Inherits the `mods` property for a given metaobject based on the parent one.
 * This function modifies the original object.
 *
 * @param meta
 * @param parentMeta
 */
export function inheritMods(meta: ComponentMeta, parentMeta: ComponentMeta): void {
	const {mods} = meta;

	const keys = Object.keys(parentMeta.mods);

	for (let i = 0; i < keys.length; i++) {
		const
			modName = keys[i],
			parentModValues = parentMeta.mods[modName];

		const
			currentModValues = mods[modName],
			forkedParentModValues = parentModValues?.slice() ?? [];

		if (currentModValues != null) {
			const values = Object.createDict<ModDeclVal>();

			for (const [i, modVal] of currentModValues.slice().entries()) {
				if (modVal !== PARENT) {
					const modName = String(modVal);

					if (Object.isArray(modVal) || !(modName in values)) {
						values[modName] = <Exclude<typeof modVal, {}>>modVal;
					}

					continue;
				}

				const hasDefault = currentModValues.some((el) => Object.isArray(el));

				let appliedDefault = !hasDefault;

				for (const modVal of forkedParentModValues) {
					const modsName = String(modVal);

					if (!(modsName in values)) {
						values[modsName] = <Exclude<typeof modVal, {}>>modVal;
					}

					if (!appliedDefault && Object.isArray(modVal)) {
						forkedParentModValues[i] = modVal[0];
						appliedDefault = true;
					}
				}

				currentModValues.splice(i, 1, ...forkedParentModValues);
			}

			mods[modName] = <ModDeclVal[]>Object
				.values(values)
				.filter((val) => val !== undefined);

		} else if (!(modName in mods)) {
			mods[modName] = forkedParentModValues;
		}
	}
}
