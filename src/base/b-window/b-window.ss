- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-data'|b as placeholder
- include '**/*.window.ss'|b

- template index() extends ['i-data'].index
	- block body
		- super
		- block window
			- thirdPartySlots = true

			< .&__back
			< .&__wrapper v-if = &
				isFunctional ||
				forceInnerRender ||
				opt.ifOnce('opened', m.opened === 'true') && delete watchModsStore.opened
			.

				< section.&__window ref = window
					- if thirdPartySlots
						< template v-if = slotName
							: isSlot = /^slot[A-Z]/

							- forEach self => el, key
								- if isSlot.test(key)
									< template v-if = slotName === '${key}'
										+= el(@@globalNames[key])

					< template v-else
						+= self.slot()
							< h1.&__title v-if = title || vdom.getSlot('title')
								+= self.slot('title', {':title': 'title'})
									- block title
										{{ title }}

							< .&__content
								+= self.slot('body')
									- block content

							< .&__controls
								+= self.slot('control')
									- block controls
										< b-button @click = close
											{{ `Close` }}
