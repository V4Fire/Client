- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-data'|b as placeholder
- include '**/*.window.ss'|b

- template index() extends ['i-data'].index
	- teleport = @@teleport

	- block body
		- super
		- block window
			- thirdPartySlots = true

			< .&__back
			< .&__wrapper v-if = &
				forceInnerRender ||
				opt.ifOnce('opened', m.opened === 'true') && delete reactiveModsStore.opened
			.

				< :section.&__window ref = window
					- if thirdPartySlots
						< template v-if = slotName
							: isSlot = /^windowSlot[A-Z]/

							- forEach self => el, key
								- if isSlot.test(key)
									< template v-if = slotName === '${key}'
										+= el(@@globalTplDirs[key])

					< template v-else
						+= self.slot()
							< h1.&__title v-if = title || $slots['title']
								+= self.slot('title', {':title': 'title'})
									- block title
										{{ title }}

							< .&__body.&__content
								+= self.slot('body')
									- block content

							< .&__controls
								+= self.slot('controls')
									- block controls
										< b-button @click:component = close
											{{ `Close` }}

				< ?:-section
