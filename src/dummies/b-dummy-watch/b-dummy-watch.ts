/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-watch/README.md]]
 * @packageDocumentation
 */

import iData, { component, field, system, computed } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyWatch extends iData {
	@field()
	complexObjStore: Dictionary = {
		a: {
			b: {
				c: 1,
				d: 2
			}
		}
	};

	@system()
	systemComplexObjStore: Dictionary = {
		a: {
			b: {
				c: 1,
				d: 2
			}
		}
	};

	get complexObj(): number {
		return Math.random();
	}

	@computed({cache: false})
	get systemComplexObj(): number {
		return Math.random();
	}
}
