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
		- super
		- block group
			< .&__title
				- block title
					< .&__cell.&__title-text
						+= self.slot('title')
							{{ title }}

				< .&__cell.&__toggle v-if = blockStatus === 'ready'
					- block icon
						< span @click = m.opened === 'true' ? close() : open()
							< b-icon :value = m.opened === 'true' ? 'caret-up' : 'caret-down'

			< .&__content v-if = blockStatus === 'ready'
				- block content
					+= self.slot('body')
