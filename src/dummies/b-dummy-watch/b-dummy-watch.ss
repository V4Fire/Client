- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< .&__set-field
			{{ JSON.stringify(Array.from(setField)) }}

		< .&__complex-obj-store
			{{ JSON.stringify(complexObjStore) }}

		< .&__system-complex-obj-store
			{{ JSON.stringify(systemComplexObjStore) }}
