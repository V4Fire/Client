/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/meta';

/**
 * Normalizes the passed CSS classes and returns the result
 * @param classes
 */
export function normalizeClass(classes: CanArray<string | Dictionary>): string {
	let
		res = '';

	if (Object.isString(classes)) {
		res = classes;

	} else if (Object.isArray(classes)) {
		for (let i = 0; i < classes.length; i++) {
			const
				normalizedClass = normalizeClass(classes[i]);

			if (normalizedClass !== '') {
				res += `${normalizedClass} `;
			}
		}

	} else if (Object.isDictionary(classes)) {
		Object.entries(classes).forEach(([className, has]) => {
			if (Object.isTruly(has)) {
				res += `${className} `;
			}
		});
	}

	return res.trim();
}

/**
 * Normalizes the passed CSS styles and returns the result
 * @param styles
 */
export function normalizeStyle(styles: CanArray<string | Dictionary<string>>): string | Dictionary<string> {
	if (Object.isArray(styles)) {
		const
			res = {};

		for (let i = 0; i < styles.length; i++) {
			const
				style = styles[i],
				normalizedStyle = Object.isString(style) ? parseStringStyle(style) : normalizeStyle(style);

			if (Object.size(normalizedStyle) > 0) {
				Object.entries(normalizedStyle).forEach(([key, val]) => res[key] = val);
			}
		}

		return res;
	}

	if (Object.isString(styles)) {
		return styles.trim();
	}

	if (Object.isDictionary(styles)) {
		return styles;
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

	Object.keys(attrs).forEach((key) => {
		let
			propKey = `${key}Prop`;

		if (key === 'ref' || key === 'ref_for') {
			return;
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
	});
}
