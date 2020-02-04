/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< .&__wrapper
			< .&__container ref = container

			< .&__tombstones &
				ref = tombstones |
				v-if = vdom.getSlot('tombstone')
			.
				< .&__tombstone v-for = i in (tombstonesSize || chunkSize)
					+= self.slot('tombstone')

			< .&__loader &
				ref = loader |
				v-if = vdom.getSlot('loader')
			.
				+= self.slot('loader')

			< .&__retry &
				ref = retry |
				v-if = vdom.getSlot('retry')
			.
				+= self.slot('retry')

			< .&__empty &
				ref = empty |
				v-if = vdom.getSlot('empty')
			.
				+= self.slot('empty')

			< .&__done &
				ref = done |
				v-if = vdom.getSlot('done')
			.
				+= self.slot('done')
