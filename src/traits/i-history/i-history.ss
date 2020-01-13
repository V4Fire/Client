- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- @@ignore
- template index(@params)
	< . &
		-page = index |
		:class = provide.elClasses(${@self.name()}, {page: {}})
	.
		+= @self.slot('default', {':history': 'history'})

	- block back
		< . &
			v-if = vdom.getSlot('pages') |
			:class = provide.elClasses(${@self.name()}, {back: {}}) |
			@click = () => history.back()
		.

	- block subPages
		< . &
			v-if = vdom.getSlot('pages') |
			:class = provide.elClasses(${@self.name()}, {'sub-pages': {}})
		.
			+= @self.slot('pages', {':history': 'history'})
