/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const inverseFieldMap = Object.createDict({
	props: ['fields', 'systemFields'],
	fields: ['props', 'systemFields'],
	systemFields: ['props', 'fields']
});

export const tiedFieldMap = Object.createDict({
	fields: true,
	systemFields: true
});
