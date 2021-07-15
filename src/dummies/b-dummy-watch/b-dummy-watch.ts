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

import iData, { component, field, system, computed, ModsDecl } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyWatch extends iData {
	@field(() => new Set([]))
	setField!: Set<string>;

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

	get complexObj(): Dictionary {
		return Object.fastClone(this.complexObjStore);
	}

	@computed({cache: true, dependencies: ['complexObjStore']})
	get cachedComplexObj(): Dictionary {
		return Object.fastClone(this.complexObjStore);
	}

	@computed({cache: false})
	get systemComplexObj(): Dictionary {
		return Object.fastClone(this.systemComplexObjStore);
	}

	static mods: ModsDecl = {
		watchable: [
			'val-1',
			'val-2'
		],

		nonWatchable: [
			['val-1'],
			'val-2'
		]
	};
}
