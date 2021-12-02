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

import watch from '~/core/object/watch';
import iData, { component, prop, field, system, computed, ModsDecl } from '~/super/i-data/i-data';

export * from '~/super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummySync extends iData {
	@prop(Object)
	readonly dictProp: Dictionary = {
		a: {
			b: 2,
			c: 3
		}
	};

	@field((o) => o.sync.link())
	dict!: Dictionary;

	@field({
		after: 'dict',
		init: (o) => o.sync.link('dict.a.b')
	})

	linkToNestedField!: number;

	@field({
		after: 'dict',
		init: (o) => o.sync.link('dict.a.b', (val: number) => val + 1)
	})

	linkToNestedFieldWithInitializer!: number;

	@system((o) => o.sync.link('dict.a.b', {immediate: true}, (val: number) => val + 1))
	immediateLinkToNestedFieldWithInitializerFromSystemToField!: number;

	@field({
		after: 'dict',
		init: (o) => o.sync.object([
			'dict',
			['linkToNestedFieldWithInitializer', (val) => Number(val) * 2],
			['linkToPath', 'dict.a.b'],
			['linkToPathWithInitializer', 'dict.a.c', (val) => Number(val) * 2]
		])
	})

	watchableObject!: Dictionary;

	@computed({cache: true, watchable: true})
	get mountedWatcher(): Dictionary {
		return watch({a: {b: 1}}).proxy;
	}

	static override readonly mods: ModsDecl = {
		foo: [
			'bar',
			'bla'
		]
	};

	protected override initModEvents(): void {
		super.initModEvents();
		this.sync.mod('foo', 'dict.a.b', (v) => v === 2 ? 'bar' : 'bla');
	}
}
