/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'components/super/i-data'|b as placeholder

- template index() extends ['i-data'].index
	- block body
		< .&__wrapper
			< .&__container ref = container | -test-ref = container
				< component &
					v-for = {item, key, props} in firstChunkItems |
					:key = key |
					:is = item |
					v-attrs = props
				.

			< .&__tombstones &
				ref = tombstones |
				v-if = $slots['tombstone'] |
				v-in-view = {
					threshold: 0.0000001,
					handler: onTombstonesEnter,
					onLeave: onTombstonesLeave
				}
			.
				< .&__tombstone v-for = i in tombstoneCount || chunkSize
					+= self.slot('tombstone')

			< .&__loader &
				ref = loader |
				v-if = $slots['loader']
			.
				+= self.slot('loader')

			< .&__retry &
				ref = retry |
				v-if = $slots['retry'] |
				:style = {display: 'none'}
			.
				+= self.slot('retry')

			< .&__empty &
				ref = empty |
				v-if = $slots['empty'] |
				:style = {display: 'none'}
			.
				+= self.slot('empty')

			< .&__done &
				ref = done |
				v-if = $slots['done'] |
				:style = {display: 'none'}
			.
				+= self.slot('done')

			< .&__render-next &
				ref = renderNext |
				v-if = $slots['renderNext'] |
				:style = {display: 'none'}
			.
				+= self.slot('renderNext')
