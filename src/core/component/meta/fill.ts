/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isAbstractComponent } from 'core/component/reflect';

import { addFieldsToMeta } from 'core/component/meta/field';
import { addMethodsToMeta } from 'core/component/meta/method';

import type { ComponentConstructor, ModVal } from 'core/component/interface';
import type { ComponentMeta } from 'core/component/meta/interface';

const
	BLUEPRINT = Symbol('The metaobject blueprint'),
	ALREADY_FILLED = Symbol('This constructor has already been used to populate the metaobject');

/**
 * Populates the passed metaobject with methods and properties from the specified component class constructor
 *
 * @param meta
 * @param [constructor] - the component constructor
 */
export function fillMeta(meta: ComponentMeta, constructor: ComponentConstructor = meta.constructor): ComponentMeta {
	addMethodsToMeta(meta, constructor);

	if (isAbstractComponent.test(meta.componentName)) {
		return meta;
	}

	// For smart components, this method can be called more than once
	const isFirstFill = !constructor.hasOwnProperty(ALREADY_FILLED);

	if (Object.isDictionary(meta.params.functional) && meta[BLUEPRINT] == null) {
		Object.defineProperty(meta, BLUEPRINT, {
			value: {
				watchers: meta.watchers,
				hooks: meta.hooks,
				fieldInitializers: meta.fieldInitializers,
				systemFieldInitializers: meta.systemFieldInitializers
			}
		});
	}

	type Blueprint = Pick<ComponentMeta, 'watchers' | 'hooks' | 'fieldInitializers' | 'systemFieldInitializers'>;

	const blueprint: CanNull<Blueprint> = meta[BLUEPRINT];

	if (blueprint != null) {
		const hooks = {};

		for (const name of Object.keys(blueprint.hooks)) {
			hooks[name] = blueprint.hooks[name].slice();
		}

		Object.assign(meta, {
			hooks,
			watchers: {...blueprint.watchers},
			fieldInitializers: blueprint.fieldInitializers.slice(),
			systemFieldInitializers: blueprint.systemFieldInitializers.slice()
		});
	}

	const {component} = meta;

	addFieldsToMeta('fields', meta);
	addFieldsToMeta('systemFields', meta);

	for (const init of meta.metaInitializers.values()) {
		init(meta);
	}

	// Modifiers

	if (isFirstFill) {
		const {mods} = component;

		for (const modName of Object.keys(meta.mods)) {
			const mod = meta.mods[modName];

			let defaultValue: CanUndef<ModVal[]>;

			if (mod != null) {
				for (const val of mod) {
					if (Object.isArray(val)) {
						defaultValue = val;
						break;
					}
				}

				mods[modName] = defaultValue !== undefined ? String(defaultValue[0]) : undefined;
			}
		}
	}

	Object.defineProperty(constructor, ALREADY_FILLED, {value: true});

	return meta;
}
