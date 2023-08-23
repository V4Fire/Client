/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import watch from 'core/object/watch';
import iData, { component, prop, field, system, computed, ModsDecl } from 'components/super/i-data/i-data';

import Sync from 'components/friends/sync/class';
import * as SyncAPI from 'components/friends/sync/api';

export * from 'components/super/i-data/i-data';

Sync.addToPrototype(SyncAPI);

interface bFriendsSyncDummy extends Dictionary {}

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

class bFriendsSyncDummy extends iData {
	@prop(Object)
	readonly dictProp: Dictionary<Dictionary<number>> = {
		a: {
			b: 2,
			c: 3
		}
	};

	@field((o) => o.sync.link())
	dict!: Dictionary<Dictionary<number>>;

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

	@system((o) => o.sync.link('dict.a.b', {flush: 'sync', immediate: true}, (val: number) => val + 1))
	immediateWithFlushSyncLinkToNestedFieldWithInitializerFromSystemToField!: number;

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
	get mountedWatcher(): Dictionary<Dictionary<number>> {
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

export default bFriendsSyncDummy;
