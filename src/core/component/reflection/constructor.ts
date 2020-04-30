/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { componentParams, components } from 'core/component/const';
import { dsComponentsMods } from 'core/component/reflection/const';
import { isAbstractComponent, isSmartComponent } from 'core/component/reflection/types';

import { ComponentOptions, ComponentMeta, ComponentConstructor, ModsDecl } from 'core/component/interface';
import { ComponentConstructorInfo } from 'core/component/reflection/interface';

/**
 * Returns a component name by the specified constructor.
 * The name is represented in a dash style.
 *
 * @param constructor
 *
 * @example
 * ```js
 * class bButton {
 *
 * }
 *
 * getComponentName(bButton); // 'b-button'
 * ```
 */
export function getComponentName(constructor: Function): string {
	return (constructor.name || '').dasherize();
}

/**
 * Returns an object with information from the specified component constructor
 *
 * @param constructor
 * @param [declParams] - component declaration parameters
 *
 * @example
 * ```js
 * @component({functional: true})
 * class bButton extends iBlock {
 *
 * }
 *
 * // {
 * //   name: 'b-button',
 * //   componentName: 'b-button',
 * //   parent: iBlock,
 * //   ...
 * // }
 * getInfoFromConstructor(bButton);
 * ```
 */
export function getInfoFromConstructor(
	constructor: ComponentConstructor,
	declParams?: ComponentOptions
): ComponentConstructorInfo {
	const
		name = declParams?.name || getComponentName(constructor),
		parent = Object.getPrototypeOf(constructor),
		parentParams = parent && componentParams.get(parent);

	// Create an object with parameters of a component
	const params = parentParams ? {root: parentParams.root, ...declParams, name} : {
		root: false,
		tpl: true,
		inheritAttrs: true,
		functional: false,
		...declParams,
		name
	};

	// Mix the "functional" parameter from a parent @component declaration
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

	// Register component parameters in the special storage
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
 * Returns a map of component modifiers from the specified component.
 * This function normalizes the raw modifier declaration and mixes to it values from a design system
 * (if it is specified).
 *
 * @param component - information object of the component
 *
 * @example
 * ```js
 * @component()
 * class bButton extends iBlock {
 *   static mods = {
 *     'opened-window': [
 *       true,
 *       false,
 *       undefined,
 *       [false],
 *       bButton.PARENT
 *     ]
 *   };
 * }
 *
 * // {openedWindow: ['true', ['false'], bButton.PARENT]}
 * getComponentMods(getInfoFromConstructor());
 * ```
 */
export function getComponentMods(component: ComponentConstructorInfo): ModsDecl {
	const
		{constructor, componentName} = component;

	const
		mods = {};

	const
		modsFromDS = dsComponentsMods?.[componentName],
		// tslint:disable-next-line:no-string-literal
		modsFromConstructor = {...constructor['mods']};

	if (modsFromDS) {
		for (let keys = Object.keys(modsFromDS), i = 0; i < keys.length; i++) {
			const
				key = keys[i],
				dsModDecl = modsFromDS[key],
				modDecl = modsFromConstructor[key];

			modsFromConstructor[key] = modDecl ? modDecl.concat(dsModDecl) : dsModDecl;
		}
	}

	for (let o = modsFromConstructor, keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			key = keys[i],
			modDecl = o[key],
			modValues = <Array<string | object>>[];

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
					modValues.push(el.value);
				}
			}
		}

		mods[key.camelize(false)] = modValues;
	}

	return mods;
}
