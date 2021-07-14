/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-sync/README.md]]
 * @packageDocumentation
 */

import iData, { component, field, prop, system } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummySync extends iData {
	/**
	 * Prop for test purposes
	 */
	@prop(Object)
	readonly dictProp: Dictionary = {
		a: {
			b: 2,
			c: 3
		}
	};

	/**
	 * Field for test purposes
	 */
	@field((o) => o.sync.link())
	dict!: Dictionary;

	/**
	 * Field for test purposes
	 */
	@field({
		after: 'dict',
		init: (o) => o.sync.link('dict.a.b', {immediate: true, collapse: false}, (val: number) => val + 1)
	})

	linkToNestedFieldWithInitializer!: number;

	/**
	 * Field for test purposes
	 */
	@field({
		after: 'dict',
		init: (o) => o.sync.object({deep: true, immediate: true, collapse: false}, [
			'dict',
			['linkToNestedFieldWithInitializer', (val) => Number(val) * 2],
			['linkToPath', 'dict.a.b'],
			['linkToPathWithInitializer', 'dict.a.c', (val) => Number(val) * 2]
		])
	})

	watchableObject!: Dictionary;
}
