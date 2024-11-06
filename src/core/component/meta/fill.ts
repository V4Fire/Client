/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isAbstractComponent } from 'core/component/reflect';
import type { RegisteredComponent } from 'core/component/decorators';

import { sortFields } from 'core/component/meta/field';
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
 * @param registeredComponent - the descriptor of the registered component
 * @param [constructor] - the component constructor
 */
export function fillMeta(
	meta: ComponentMeta,
	registeredComponent: Required<RegisteredComponent>,
	constructor: ComponentConstructor = meta.constructor
): ComponentMeta {
	addMethodsToMeta(meta, registeredComponent, constructor);

	if (isAbstractComponent.test(meta.componentName)) {
		return meta;
	}

	// For smart components, this method can be called more than once
	const isFirstFill = !constructor.hasOwnProperty(ALREADY_FILLED);

	if (Object.isDictionary(meta.params.functional) && meta[BLUEPRINT] == null) {
		Object.defineProperty(meta, BLUEPRINT, {
			value: {
				watchers: meta.watchers,
				hooks: meta.hooks
			}
		});
	}

	type Blueprint = Pick<ComponentMeta, 'watchers' | 'hooks'>;

	const blueprint: CanNull<Blueprint> = meta[BLUEPRINT];

	if (blueprint != null) {
		const hooks = {};

		const hookNames = Object.keys(blueprint.hooks);

		for (let i = 0; i < hookNames.length; i++) {
			const name = hookNames[i];
			hooks[name] = blueprint.hooks[name].slice();
		}

		Object.assign(meta, {
			hooks,
			watchers: {...blueprint.watchers}
		});
	}

	const {component} = meta;

	if (isFirstFill) {
		meta.fieldInitializers = sortFields(meta.fields);
		meta.systemFieldInitializers = sortFields(meta.systemFields);
	}

	for (const init of meta.metaInitializers.values()) {
		init(meta);
	}

	if (isFirstFill) {
		const {mods} = component;

		const modNames = Object.keys(meta.mods);

		for (let i = 0; i < modNames.length; i++) {
			const
				modName = modNames[i],
				mod = meta.mods[modName];

			let defaultValue: CanUndef<ModVal[]>;

			if (mod != null) {
				for (let i = 0; i < mod.length; i++) {
					const val = mod[i];

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
