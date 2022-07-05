/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/meta';

/**
 * Normalizes the passed class attribute and returns the result
 * @param classValue
 */
export function normalizeClass(classValue: CanArray<string | Dictionary>): string {
	let
		res = '';

	if (Object.isString(classValue)) {
		res = classValue;

	} else if (Object.isArray(classValue)) {
		for (let i = 0; i < classValue.length; i++) {
			const
				normalizedClass = normalizeClass(classValue[i]);

			if (normalizedClass !== '') {
				res += `${normalizedClass} `;
			}
		}

	} else if (Object.isDictionary(classValue)) {
		for (let keys = Object.keys(classValue), i = 0; i < keys.length; i++) {
			const
				key = keys[i];

			if (Object.isTruly(classValue[key])) {
				res += `${key} `;
			}
		}
	}

	return res.trim();
}

/**
 * Normalizes the passed CSS style value and returns the result
 * @param style
 */
export function normalizeStyle(style: CanArray<string | Dictionary<string>>): string | Dictionary<string> {
	if (Object.isArray(style)) {
		const
			res = {};

		for (let i = 0; i < style.length; i++) {
			const
				el = style[i],
				normalizedStyle = Object.isString(el) ? parseStringStyle(el) : normalizeStyle(el);

			if (Object.size(normalizedStyle) > 0) {
				for (let keys = Object.keys(normalizedStyle), i = keys.length; i < keys.length; i++) {
					const key = keys[i];
					res[key] = normalizedStyle[key];
				}
			}
		}

		return res;
	}

	if (Object.isString(style)) {
		return style.trim();
	}

	if (Object.isDictionary(style)) {
		return style;
	}

	return '';
}

const
	listDelimiterRE = /;(?![^(]*\))/g,
	propertyDelimiterRE = /:(.+)/;

/**
 * Parses the specified CSS style string and returns a dictionary with the parsed rules
 * @param style
 */
export function parseStringStyle(style: string): Dictionary<string> {
	const
		res = {};

	style.split(listDelimiterRE).forEach((singleStyle) => {
		singleStyle = singleStyle.trim();

		if (singleStyle !== '') {
			const
				chunks = singleStyle.split(propertyDelimiterRE);

			if (chunks.length > 1) {
				res[chunks[0].trim()] = chunks[1].trim();
			}
		}
	});

	return res;
}

/**
 * Normalizes the passed attributes using the specified component meta object
 *
 * @param attrs
 * @param component
 */
export function normalizeComponentAttrs(attrs: Nullable<Dictionary>, component: ComponentMeta): void {
	const
		{props, params: {deprecatedProps}} = component;

	if (attrs == null) {
		return;
	}

	for (let keys = Object.keys(attrs), i = 0; i < keys.length; i++) {
		let
			key = keys[i],
			propKey = `${key}Prop`;

		if (key === 'ref' || key === 'ref_for') {
			continue;
		}

		if (deprecatedProps != null) {
			const
				alternativeKey = deprecatedProps[key] ?? deprecatedProps[propKey];

			if (alternativeKey != null) {
				attrs[alternativeKey] = attrs[key];
				delete attrs[key];

				key = alternativeKey;
				propKey = `${alternativeKey}Prop`;
			}
		}

		if (propKey in props) {
			attrs[propKey] = attrs[key];
			delete attrs[key];
		}
	}
}
