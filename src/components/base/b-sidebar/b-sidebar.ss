- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- rootTag = 'aside'
	- rootWrapper = true
	- overWrapper = true

	- block body
		< .&__content-wrapper &
			v-if =
				forceInnerRender ||
				opt.ifOnce('opened', m.opened === 'true') && delete reactiveModsStore.opened
		.
			< .&__content
				- block content
					+= self.slot()
