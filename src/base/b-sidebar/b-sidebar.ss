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
	- rootWrapper = true
	- overWrapper = true

	- block body
		< .&__content-wrapper &
			v-if =
				isFunctional ||
				forceInnerRender ||
				opt.ifOnce('opened', m.opened !== 'true') && delete watchModsStore.opened
		.
			< .&__content
				- block content
					+= self.slot()
