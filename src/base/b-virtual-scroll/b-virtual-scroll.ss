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
		< .&__container ref = container
			< .&__trigger &
				v-in-view = {
					delay: 0,
					onEnter: onIntersectChange,
					onLeave: onIntersectChange
				}
			.

			< .&__scroll-runner ref = scrollRunner
				&nbsp;

		< .&__tombstone ref = tombstone
			+= self.slot('tombstone')
