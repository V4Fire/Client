/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:dummies/b-dummy-state/README.md]]
 * @packageDocumentation
 */

import iData, { component, field, system, ConverterCallType } from 'super/i-data/i-data';

export * from 'super/i-data/i-data';

@component({
	functional: {
		functional: true,
		dataProvider: undefined
	}
})

export default class bDummyState extends iData {
	@system()
	systemField: string = 'foo';

	@field()
	regularField?: number;

	/** @override */
	protected syncStorageState(data?: Dictionary, type: ConverterCallType = 'component'): Dictionary {
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

	/** @override */
	protected convertStateToStorageReset(): Dictionary {
		return {
			systemField: 'foo',
			regularField: 0,
			'mods.foo': undefined
		};
	}
}
