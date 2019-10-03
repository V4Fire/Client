- namespace [%fileName%]

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- include 'super/i-block'|b as placeholder
- include 'base/b-skeleton/modules/**/*.ss'|b

/**
 * @typedef SkeletonParams
 * @property {Dictionary} [p] - skeleton parameters:
 *   *) [animation] - size of an animation (the distance of the firefly, also affects the firefly speed)
 *   *) [size] - shape size
 *   *) [class] - additional class for a shape
 *
 * @property {Dictionary} [attrs]
 */

/**
 * @typedef {SkeletonParams} SkeletonPart
 * @property {string} shape
 */

/**
 * Generates a skeleton rectangle
 *
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.attrs} [attrs]
 */
- block index->rect(p = {}, attrs = {})
	? p = Object.assign({ &
		class: 'default',
		animation: 's',
		size: 's'
	}, p) .

	< ?.${self.name()}
		< .&__${p.class}.&__item[.&_shape_rect.&_animation_${p.animation}.&_size_${p.size}] &
			${attrs} |
			-skeleton-marker = true
		.

/**
 * Generates a skeleton circle
 *
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.attrs} [attrs]
 */
- block index->circle(p = {}, attrs = {})
	? p = Object.assign({ &
		animation: 's',
		size: 's'
	}, p) .

	< ?.${self.name()}
		< .&__${p.class}.&__item[.&_shape_circle.&_animation_${p.animation}.&_size_${p.size}] &
			${attrs} |
			-skeleton-marker = true
		.

/**
 * @typedef MultipleParams
 * @property {number} [l] - number of elements to be generated
 * @property {SkeletonPart.shape} [shape] - shape of generated elements
 * @property {SkeletonParams.p} [p]
 * @property {SkeletonParams.attrs} [attrs]
 */

/**
 * Generates the specified number of skeletons
 *
 * @param {MultipleParams.l} [l]
 * @param {MultipleParams.shape} [shape]
 * @param {MultipleParams.p} [p]
 * @param {MultipleParams.attrs} [attrs]
 */
- block index->multiple(l = 2, shape = 'rect', p = {}, attrs = {})
	- for var i = 0; i < l; i++
		+= self[shape](p, attrs)

/**
 * Generates a skeleton column
 *
 * @param content
 * @param {SkeletonParams.attrs} [attrs]
 * @param {string} [wrapperClass]
 */
- block index->column(content, attrs = {}, wrapperClass = 'column-default')
	? wrapperClass = wrapperClass || 'column-default'

	< ?.${self.name()}
		< .&__${wrapperClass}.&__column ${attrs}
			{content}

/**
 * Generates a skeleton row
 *
 * @param content
 * @param {SkeletonParams.attrs} [attrs]
 * @param {string} [wrapperClass]
 */
- block index->row(content, attrs = {}, wrapperClass = 'row-default')
	? wrapperClass = wrapperClass || 'row-default'

	< ?.${self.name()}
		< .&__${wrapperClass}.&__row ${attrs}
			{content}

/**
 * Generates a skeleton
 *
 * @param {string} block
 * @param {...*} args
 */
- @@ignore
- template index(block) extends ['i-block'].index
	- block root
		< ?.${self.name()}
			+= self[block].apply(self, [].slice.call(arguments, 1))
