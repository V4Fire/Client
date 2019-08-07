- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- @@ignore
- template index(@params = {}, content)
	: classes = {}

	- if Object.isString(@class)
		? classes[@class] = {}

	- else if (Object.isObject(@class))
		? Object.assign(classes, @class)

	< component &
		v-for = el in ${@from} |
		:is = el.component || 'b-button' |
		:instanceOf = bButton |
		:class = provide.elClasses(${classes|json}) |
		:v-attrs = el.attrs |
		@[getControlEvent(el)] = callControlAction(el, ...arguments)
	.
		- if content
			+= content

		- else
			{{ el.text }}
