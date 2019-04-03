- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder

- template index() extends ['i-block'].index
	- rootWrapper = true

	- block body
		- block component
			< .&__component
				+= self.slot()

		- block mods
			< .&__mods v-if = stage
				< .&__title
					{{ debugComponent.componentName }}

					< span.&__parents v-for = nm in getDebugParents()
						{{ ' / ' + nm }}

				< template v-for = (mod, key) in debugComponent.meta.mods
					< .&__mod
						{{ key }}

						< span.&__buttons
							< button &
								v-for = val in mod |
								:class = provide.elClasses({modValue: {selected: debugComponent.mods[key] === getModValue(val)}}) |
								@click = setDebugMod($event.target, key, getModValue(val))
							.
								{{ getModValue(val) }}
