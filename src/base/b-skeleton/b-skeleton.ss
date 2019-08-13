/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-block'|b as placeholder
- include 'base/b-skeleton/modules/**/*.ss'|b

/**
 * @typedef SkeletonParams
 * @property {Dictionary} [p] - skeleton parameters:
 *   *) [animation] - size of an animation (the distance of the firefly, also affects the firefly speed)
 *   *) [size] - shape size
 *   *) [class] - additional class for a shape

 * @property {string} [style]
 */

/**
 * @typedef {SkeletonParams} SkeletonPart
 * @property {string} shape
 */

/**
 * Generates a skeleton rectangle
 *
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.style} [style]
 */
- block index->rect(p = {}, style = {})
	? p = Object.assign({ &
		class: 'default',
		animation: 's',
		size: 's'
	}, p) .

	< ?.${self.name()}
		< .&__${p.class}.&__item[.&_shape_rect.&_animation_${p.animation}.&_size_${p.size}] :style = style

/**
 * Generates a skeleton circle
 *
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.style} [style]
 */
- block index->circle(p = {}, style = {})
	? p = Object.assign({ &
		animation: 's',
		size: 's'
	}, p) .

	< ?.${self.name()}
		< .&__${p.class}.&__item[.&_shape_circle.&_animation_${p.animation}.&_size_${p.size}] :style = style

/**
 * @typedef MultipleParams
 * @property {number} [l] - number of elements to be generated
 * @property {SkeletonPart.shape} [shape] - shape of generated elements
 * @property {SkeletonParams.p} [p]
 * @property {SkeletonParams.style} [style]
 */

/**
 * Generates the specified number of skeletons
 *
 * @param {MultipleParams.l} [l]
 * @param {MultipleParams.shape} [shape]
 * @param {MultipleParams.p} [p]
 * @param {MultipleParams.style} [style]
 */
- block index->multiple(l = 2, shape = 'rect', p = {}, style = {})
	- for var i = 0; i < l; i++
		+= self[shape](p, style)

/**
 * Generates a skeleton column
 *
 * @param content
 * @param {SkeletonParams.style} [style]
 * @param {string} [wrapperClass]
 */
- block index->column(content, style = {}, wrapperClass = 'column-default')
	? wrapperClass = wrapperClass || 'column-default'

	< ?.${self.name()}
		< .&__${wrapperClass}.&__column :style = style
			{content}

/**
 * Generates a skeleton row
 *
 * @param content
 * @param {SkeletonParams.style} [style]
 * @param {string} [wrapperClass]
 */
- block index->row(content, style = {}, wrapperClass = 'row-default')
	? wrapperClass = wrapperClass || 'row-default'

	< ?.${self.name()}
		< .&__${wrapperClass}.&__row :style = style
			{content}

/**
 * Generates a skeleton
 *
 * @param {string} block
 * @param {...*} args
 */
- @@ignore
- template index(block, args) extends ['i-block'].index
	- block body
		< ?.${self.name()}
			+= self[block](args)
