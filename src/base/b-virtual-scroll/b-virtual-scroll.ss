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
			< .&__container ref = container | -test-ref = container

			< .&__tombstones-wrapper &
				v-if = vdom.getSlot('tombstone') |
				ref = tombstoneWrapper
			.
				< .&__tombstones &
					ref = tombstones
				.
					< .&__tombstone v-for = i in tombstonesSize || chunkSize
						+= self.slot('tombstone')

			< .&__loader-wrapper &
				v-if = vdom.getSlot('loader') |
				ref = loaderWrapper
			.
				< .&__loader &
					ref = loader
				.
					+= self.slot('loader')

			< .&__retry-wrapper &
				v-if = vdom.getSlot('retry') |
				ref = retryWrapper
			.
				< .&__retry &
					ref = retry |
					:style = {display: 'none'}
				.
					+= self.slot('retry')

			< .&__empty-wrapper &
				v-if = vdom.getSlot('empty') |
				ref = emptyWrapper
			.
				< .&__empty &
					ref = empty |
					:style = {display: 'none'}
				.
					+= self.slot('empty')

			< .&__done-wrapper &
				v-if = vdom.getSlot('done') |
				ref = doneWrapper
			.
				< .&__done &
					ref = done |
					:style = {display: 'none'}
				.
					+= self.slot('done')

			< .&__render-next-wrapper &
				v-if = vdom.getSlot('renderNext') |
				ref = renderNextWrapper
			.
				< .&__render-next &
					ref = renderNext |
					:style = {display: 'none'}
				.
					+= self.slot('renderNext')
