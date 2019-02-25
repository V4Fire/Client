/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Async, { AsyncOpts } from 'core/async';
import { statuses } from 'super/i-block/modules/const';
import { Hooks, ComponentMeta } from 'core/component';
import { Statuses } from 'super/i-block/modules/interface';

const beforeHooks = {
	beforeRuntime: true,
	beforeCreate: true,
	beforeDataCreate: true
};

export default class Life {
	/**
	 * iBlock instance
	 */
	protected readonly component: iBlock;

	/**
	 * @param component - component instance
	 */
	constructor(component: iBlock) {
		this.component = component;
	}

	/**
	 * Returns an object with classes for elements of an another component
	 *
	 * @param componentName
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	protected classes(componentName: string, classes?: Classes): Readonly<Dictionary<string>>;

	/**
	 * @param classes - additional classes ({baseElementName: newElementName})
	 */
	protected classes(classes: Classes): Readonly<Dictionary<string>>;
	protected classes(componentName: string | Classes, classes?: Classes): Readonly<Dictionary<string>> {
		if (!Object.isString(componentName)) {
			classes = componentName;
			componentName = this.componentName;
		}

		const
			key = JSON.stringify(classes),
			cache = classesCache.create('base'),
			cacheVal = cache[key];

		if (cacheVal) {
			return <Readonly<Dictionary<string>>>cacheVal;
		}

		const
			map = cache[key] = {};

		if (classes) {
			const
				keys = Object.keys(classes);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i];

				let
					el = classes[key];

				if (el === true) {
					el = key;

				} else if (Object.isArray(el)) {
					el = el.slice();
					for (let i = 0; i < el.length; i++) {
						if (el[i] === true) {
							el[i] = key;
						}
					}
				}

				map[key.dasherize()] = this.getFullElName.apply(this, (<unknown[]>[componentName]).concat(el));
			}
		}

		return Object.freeze(map);
	}

	/**
	 * Returns an object with base component modifiers
	 * @param mods - additional modifiers ({modifier: {currentValue: value}} || {modifier: value})
	 */
	protected mods(mods?: Dictionary<ModVal | Dictionary<ModVal>>): Readonly<ModsNTable> {
		const
			key = JSON.stringify(this.baseMods) + JSON.stringify(mods),
			cache = modsCache[key];

		if (cache) {
			return cache;
		}

		const
			map = modsCache[key] = {...this.baseMods};

		if (mods) {
			const
				keys = Object.keys(mods);

			for (let i = 0; i < keys.length; i++) {
				const
					key = keys[i],
					mod = key.dasherize();

				let
					el = <Dictionary>mods[key];

				if (!Object.isObject(el)) {
					el = {default: el};
				}

				// tslint:disable-next-line:prefer-conditional-expression
				if (!(key in mods) || el[key] === undefined) {
					map[mod] = el[Object.keys(el)[0]];

				} else {
					map[mod] = el[key];
				}
			}
		}

		return Object.freeze(map);
	}
}
