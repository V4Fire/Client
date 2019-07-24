- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'form/b-input'|b as placeholder

- template index() extends ['b-input'].index
	- block wrapper
		< b-scroll-inline.&__scroll &
			ref = scroll |
			v-func = isFunctional |
			:mods = provide.mods({
				theme: 'light',
				width: 'full',
				size: 'm'
			})
		.

			< textarea.&__input &
				ref = input |
				:id = id |
				:name = name |
				:form = form |
				:placeholder = placeholder |
				:autofocus = autofocus |
				:maxlength = maxlength |
				@focus = onFocus |
				@input = onEdit |
				@blur = onBlur |
				${attrs|!html}
			.

	- block helpers
		- super
		- block limit
			+= self.slot('limit', {':limit': 'limit', ':maxlength': 'maxlength'})
				< _ v-if = maxlength | :class = provide.elClasses({ &
					limit: {
						hidden: limit > maxlength / 1.5,
						warning: limit < maxlength / 4
					}
				}) .

					{{ `Characters left:` }} {{ limit }}
