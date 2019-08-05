/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

- namespace [%fileName%]

- include 'super/i-block'|b as placeholder
- include 'base/b-skeleton/modules/*.ss'|b

/**
 * @typedef SkeletonParams
 * @property {Dictionary} [p]
 *   *) [p.animation]
 *   *) [p.size]
 *   *) [p.class]
 * @property {string} [style]
 */

/**
 * @typedef {SkeletonParams} SkeletonPart
 * @property {string} shape
 */

 /**
 * Generates a skeleton rect
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.style} [style]
 */
- block index->rect(p = {}, style = {})
	? p = Object.assign({ &
		animation: 's',
		class: 'default',
		size: 's'
	}, p) .

	< ?.${self.name()}
		< .&__${p.class}.&__item[.&_shape_rect.&_animation_${p.animation}.&_size_${p.size}] :style = style

/**
 * Generates a skeleton circle
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
 * @param {number} [l] - Number of elements to be generated
 * @param {SkeletonPart.shape} [shape] - Shape of generated elements
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.style} [style]
 */

 /**
 *
 * Generates a specified number of skeletons
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
 * @param {SkeletonParams.style} [style]
 */
- block index->column(content, style = {}, wrapperClass = 'column-default')
	? wrapperClass = wrapperClass || 'column-default'

	< ?.${self.name()}
		< .&__${wrapperClass}.&__column
			{content}

/**
 * Generates a skeleton row
 * @param {SkeletonParams.style} [style]
 */
- block index->row(content, style = {}, wrapperClass = 'row-default')
	? wrapperClass = wrapperClass || 'row-default'

	< ?.${self.name()}
		< .&__${wrapperClass}.&__row :style = style
			{content}

/**
 * Generates a skeleton
 * @param {SkeletonPart[] | SkeletonPart} map
 */
- @@ignore
- template index(block, params) extends ['i-block'].index
	- block body
		< ?.${self.name()}
			+= self[block](params)
