- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Generates a layout for controls
 *
 * @param {!Object} params - additional parameters:
 *   *) [from] - data store
 *   *) [component] - name of the parent component (by default will used link from $parent)
 *   *) [elClasses] - classes for control elements
 *   *) [wrapperClasses] - classes for control wrappers
 *
 * @param {string=} [content] - slot content
 */
- @@ignore
- template index(@params, content)
	: &
		wrapperClasses = {},
		elClasses = {}
	.

	- if Object.isString(@wrapperClasses)
		? wrapperClasses[@wrapperClasses] = {}

	- else if (Object.isPlainObject(@wrapperClasses))
		? Object.assign(wrapperClasses, @wrapperClasses)

	- if Object.isString(@elClasses)
		? elClasses[@elClasses] = {}

	- else if (Object.isPlainObject(@elClasses))
		? Object.assign(elClasses, @elClasses)

	: &
		componentName = @component ? (@component|json) : 'false',
		elClassesJSON = (elClasses|json),
		wrapperClassesJSON = (wrapperClasses|json)
	.

	< ${@wrapperClasses ? 'span' : 'template'} &
		v-for = el in ${@from} |
		:class = ${componentName} ? provide.elClasses(${componentName}, ${wrapperClassesJSON}) : provide.elClasses(${wrapperClassesJSON})
	.
		< component &
			:is = el.component || 'b-button' |
			:instanceOf = bButton |
			:class = ${componentName} ? provide.elClasses(${componentName}, ${elClassesJSON}) : provide.elClasses(${elClassesJSON}) |
			:v-attrs = el.attrs |
			@[getControlEvent(el)] = callControlAction(el, ...arguments)
		.
			- if content
				+= content

			- else
				{{ el.text }}
