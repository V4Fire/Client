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
 * @param {object} params - additional parameters:
 *   *) [from] - an Iterable with data to render controls
 *   *) [component] - the component name within which the controls are rendered (taken from the context by default)
 *   *) [controlClasses] - CSS classes for control elements
 *   *) [wrapper] - a tag that will wrap the control elements
 *   *) [wrapperClasses] - CSS classes for elements that wrap controls
 *
 * @param {string} [content] - slot content for control elements
 */
- @@ignore
- template index(@params, content)
	: &
		wrapperClasses = {},
		controlClasses = {}
	.

	- if Object.isString(@wrapperClasses)
		? wrapperClasses[@wrapperClasses] = {}

	- else if (Object.isDictionary(@wrapperClasses))
		? Object.assign(wrapperClasses, @wrapperClasses)

	- if Object.isString(@controlClasses)
		? controlClasses[@controlClasses] = {}

	- else if (Object.isDictionary(@controlClasses))
		? Object.assign(controlClasses, @controlClasses)

	: &
		componentName = @component ? (@component|json) : 'false',
		controlClassesJSON = (controlClasses|json),
		wrapperClassesJSON = (wrapperClasses|json)
	.

	< ${@wrapperClasses ? @wrapper || 'span' : 'template'} &
		v-for = el of ${@from} |
		:class = ${componentName} ? provide.elementClasses(${componentName}, ${wrapperClassesJSON}) : provide.elementClasses(${wrapperClassesJSON})
	.
		< component &
			:is = el.component || 'b-button' |
			:class = ${componentName} ? provide.elementClasses(${componentName}, ${controlClassesJSON}) : provide.elementClasses(${controlClassesJSON}) |
			v-attrs = el.attrs |
			@[getControlEvent(el)] = (...args) => callControlAction(el, ...args)
		.
			- if content
				+= content

			- else
				{{ el.text }}
