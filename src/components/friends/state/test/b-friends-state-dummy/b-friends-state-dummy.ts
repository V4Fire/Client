/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable @v4fire/require-jsdoc */

import iData, { component, field, system } from 'components/super/i-data/i-data';

import type { ConverterCallType } from 'components/friends/state/interface';

import State from 'components/friends/state';
import * as StateAPI from 'components/friends/state/api';

export * from 'components/super/i-data/i-data';

State.addToPrototype(StateAPI);

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bFriendsStateDummy extends iData {
	@system()
	systemField: string = 'foo';

	@field()
	regularField?: number;

	protected override syncStorageState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		if (type === 'remote') {
			return {
				normalizedSystemField: data?.systemField ?? this.systemField,
				normalizedRegularField: data?.regularField ?? this.regularField ?? 0,
				'mods.foo': data?.['mods.foo'] ?? this.mods.foo
			};
		}

		return {
			systemField: data?.normalizedSystemField ?? this.systemField,
			regularField: data?.normalizedRegularField ?? this.regularField ?? 0,
			'mods.foo': data?.['mods.foo'] ?? this.mods.foo
		};
	}

	protected override convertStateToStorageReset(): Dictionary {
		return {
			systemField: 'foo',
			regularField: 0,
			'mods.foo': undefined
		};
	}

	protected override syncRouterState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
		if (type === 'remote') {
			return {
				systemField: this.systemField,
				regularField: this.regularField ?? 0,
				'mods.foo': this.mods.foo
			};
		}

		return {
			systemField: data?.systemField ?? this.systemField,
			regularField: data?.regularField ?? this.regularField ?? 0,
			'mods.foo': data?.['mods.foo'] ?? this.mods.foo
		};
	}

	protected override convertStateToRouterReset(): Dictionary {
		return this.convertStateToStorageReset();
	}
}
