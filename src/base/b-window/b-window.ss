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
	- overWrapper = false

	- block rootAttrs
		- super
		? Object.assign(rootAttrs, {':style': "{top: global.pageYOffset + 'px'}"})

	- block body
		- super
		- block window
			/* FIXME: при переносе наверх ss падает с ошибкой missing closing or opening directives in the template */
			- thirdPartySlots = true
			< .&__back

			+= self.transition()
				< .&__wrapper v-if = isFunctional || ifOnce('hidden', m.hidden !== 'true')
						< section.&__window
							- if thirdPartySlots
								< template v-if = slotName
									: isSlot = /^slot[A-Z]/
									- forEach self => el, key
										- if isSlot.test(key)
											< template v-if = slotName === '${key}'
												+= el(@@globalNames[key])

							< template v-else
								+= self.slot()
									< h1.&__title v-if = title || $slots.title
										+= self.slot('title')
											- block title
												{{ title }}

									< .&__content
										+= self.slot('body')
											- block content

									< .&__controls
										+= self.slot('control')
											- block controls
												< b-button &
													:mods = provideMods({theme: 'dark', size: gt[m.size]}) |
													@click = close
												.
													{{ `Close` }}
