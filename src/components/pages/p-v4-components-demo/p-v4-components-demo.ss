- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'components/super/i-static-page/i-static-page.component.ss'|b as placeholder

- template index() extends ['i-static-page.component'].index
	- block body
		< div dragable = true
			hello world
		< .my-image v-image = { &
      src: 'http://fakeimg.pl/300x300',
      preview: 'http://fakeimg.pl/100x300',
      broken: 'http://fakeimg.pl/300x100',
      draggable: true,
			onDragStart: dragStart
    } .
