- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-block'|b as placeholder

- template index() extends ['i-block'].mono
	- block body
		< b-remote-provider &
			/// if v-once is removed the component will be destroyed
			v-once |
			:dataProvider = 'Dummy' |
			ref = remoteProvider |
			@hook:updated = console.log('remote provider updated') |
			@hook:destroyed = console.log('remote provider destroyed')
		.
			< template #default = {db}
				{{ db }}
