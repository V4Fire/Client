- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		/// [ERROR?] The mods from v-attrs will override the default :mods = provide.mods()
		< b-button v-func = true | v-attrs = {'@:mods': createPropAccessors(() => ({upper: true}))}

		/// [ERROR] This should throw an accessors error, but it won't due to
		/// the `:mods = provide.mods()` being added automatically during the compile time
		< b-button v-func = false | v-attrs = {mods: {upper: true}}

		/// [ERROR] The `upper` modifier is not applied and also an accessors error is not thrown
		/// because there is `< component :is` inside the virtual scroll with automatically added `:mods = provide.mods()`
		< b-virtual-scroll-new &
			:item = 'b-button-functional' |
			:items = [{}] |
			:itemProps = () => ({mods: {upper: false}})
		.

		/// [OK] The modifier for some reason is applied in case of the regular component
		< b-virtual-scroll-new &
			:item = 'b-button' |
			:items = [{}] |
			:itemProps = () => ({mods: {upper: false}})
		.

		< template v-if = stage === 'teleports'
			< b-bottom-slide
