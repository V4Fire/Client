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
		< .&__wrapper v-resize.width = () => axis === 'y' ? scrollRender.onResize : undefined
			< .&__container ref = container

			< .&__tombstones ref = tombstones
				< .&__tombstone v-for = i in renderPerChunk
					+= self.slot('tombstone')

			< .&__retry &
				v-if = vdom.getSlot('retry') |
				ref = retry
			.
				+= self.slot('retry')

			< .&__empty &
				v-if = vdom.getSlot('empty') |
				ref = empty
			.
				+= self.slot('empty')
