/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/reflection/README.md]]
 * @packageDocumentation
 */

import { componentParams, components } from 'core/component/const';
import { dsComponentsMods } from 'core/component/reflection/const';
import { isAbstractComponent, isSmartComponent } from 'core/component/reflection/types';

import { ComponentParams, ComponentMeta, ModsDecl } from 'core/component/interface';
import { ComponentConstructorInfo } from 'core/component/reflection/interface';

export * from 'core/component/reflection/types';
export * from 'core/component/reflection/interface';

/**
 * Returns a component name by the specified constructor.
 * The name is represented in a dash style.
 *
 * @param constructor
 *
 */
export function getComponentName(constructor: Function): string {
	return (constructor.name || '').dasherize();
}

/**
 * Returns an object with information from the specified component constructor
 *
 * @param constructor
 * @param [declParams] - component declaration parameters
 */
export function getInfoFromConstructor(constructor: Function, declParams?: ComponentParams): ComponentConstructorInfo {
	const
		name = declParams?.name || getComponentName(constructor),
		parent = Object.getPrototypeOf(constructor),
		parentParams = parent && componentParams.get(parent);

	const params = parentParams ? {root: parentParams.root, ...declParams, name} : {
		root: false,
		tpl: true,
		inheritAttrs: true,
		functional: false,
		...declParams,
		name
	};

	if (parentParams) {
		let
			functional;

		// tslint:disable-next-line:prefer-conditional-expression
		if (Object.isPlainObject(params.functional) && Object.isPlainObject(parentParams.functional)) {
			functional = {...parentParams.functional, ...params.functional};

		} else {
			functional = params.functional !== undefined ? params.functional : parentParams.functional || false;
		}

		params.functional = functional;
	}

	if (!componentParams.has(constructor)) {
		componentParams.set(constructor, params);
		componentParams.set(name, params);
	}

	return {
		name,
		componentName: name.replace(isSmartComponent, ''),
		isAbstract: isAbstractComponent.test(name),
		isSmart: isSmartComponent.test(name),
		constructor,
		params,
		parent,
		parentParams,
		get parentMeta(): CanUndef<ComponentMeta> {
			return parent && components.get(parent);
		}
	};
}

/**
 * Returns a map of component modifiers from the specified component
 * @param component - information object of the component
 */
export function getComponentMods(component: ComponentConstructorInfo): ModsDecl {
	const
		{constructor, componentName} = component;

	const
		normalizedMods = {},
		dsMods = dsComponentsMods?.[componentName],

		// tslint:disable-next-line:no-string-literal
		mods = {...constructor['mods']};

	if (dsMods) {
		for (let keys = Object.keys(dsMods), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				dsModDecl = dsMods[key],
				modDecl = mods[key];

			mods[key] = modDecl ? modDecl.concat(dsModDecl) : dsModDecl;
		}
	}

	for (let o = mods, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			modDecl = o[key],
			res = <unknown[]>[];

		if (modDecl) {
			let
				cache,
				active;

			for (let i = 0; i < modDecl.length; i++) {
				cache = cache || new Map();

				const
					modVal = modDecl[i];

				if (Object.isArray(modVal)) {
					if (active !== undefined) {
						cache.set(active, active);
					}

					active = String(modVal[0]);
					cache.set(active, [active]);

				} else {
					const
						normalizedModVal = Object.isPlainObject(modVal) ? modVal : String(modVal);

					if (!cache.has(normalizedModVal)) {
						cache.set(normalizedModVal, normalizedModVal);
					}
				}
			}

			if (cache) {
				for (let o = cache.values(), el = o.next(); !el.done; el = o.next()) {
					res.push(el.value);
				}
			}
		}

		normalizedMods[key.camelize(false)] = res;
	}

	return normalizedMods;
}
