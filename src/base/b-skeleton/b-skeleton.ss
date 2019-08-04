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
 * Generates a skeleton
 * @param {SkeletonPart[] | SkeletonPart} map
 */
- @@ignore
- template index(map = []) extends ['i-block'].index
	? map = [].concat(map)

	- block body
		< ?.${self.name()}
			- for i in map
				? sk = map[i]
				+= self[sk.shape](sk.p, sk.style)

/**
 * Generates a skeleton rect
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.style} [style]
 */
- block index->rect(p = {}, style = {})
	? Object.assign(p, { &
		animation: 's',
		class: 'default'
	}) .

	< ?.${self.name()}
		< .&__item[.&_shape_rect.&_animation_${p.animation}.&__${p.class}] :style = style

/**
 * Generates a skeleton circle
 * @param {SkeletonParams.p} [p]
 * @param {SkeletonParams.style} [style]
 */
- block index->circle(p = {}, style = {})
	? Object.assign(p, { &
		animation: 's'
	}) .

	< ?.${self.name()}
		< .&__item[.&_shape_circle.&_animation_${p.animation}.&__${p.class}] :style = style

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
- block multiple(l = 2, shape = 'rect', p = {}, style = {})
	- for var i = 0; i < l; i++
		+= self[shape](p, style)

/**
 * Generates a skeleton column
 * @param {MultipleParams.l} [l]
 * @param {MultipleParams.shape} [shape]
 * @param {MultipleParams.p} [p]
 *   *) [p.wrapperClass]
 * @param {MultipleParams.style} [style]
 */
- block index->column(l = 2, shape = 'rect', p = {}, style = {})
	? Object.assign(p, { &
		wrapperClass: 'column-default'
	}) .

	< ?.${self.name()}
		< .&__column[.&__${p.wrapperClass}]
			+= self.multiple(l, shape, p, style)

/**
 * Generates a skeleton row
 * @param {MultipleParams.l} [l]
 * @param {MultipleParams.shape} [shape]
 * @param {MultipleParams.p} [p]
 * @param {MultipleParams.style} [style]
 */
- block index->row(l = 2, shape = 'rect', p = {}, style = {})
	? Object.assign(p, { &
		wrapperClass: 'row-default'
	}) .

	< ?.${self.name()}
		< .&__column[.&__${p.wrapperClass}]
			+= self.multiple(l, shape, p, style)