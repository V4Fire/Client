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

		< .&__complex-obj
			{{ JSON.stringify(complexObj) }}

		< .&__cached-complex-obj
			{{ JSON.stringify(cachedComplexObj) }}

		< .&__system-complex-obj-store
			{{ JSON.stringify(systemComplexObjStore) }}

		< .&__watchable-mod
			{{ m.watchable }}

		< .&__non-watchable-mod
			{{ mods.nonWatchable }}

		< .&__component-with-slot
			< b-button :p = setField
				< template #default = {ctx}
					{{ JSON.stringify(Array.from(ctx.p)) }}

