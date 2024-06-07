/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { ComponentMeta } from 'core/component/meta';

/**
 * Normalizes the provided CSS classes and returns the resulting output
 * @param classes
 */
export function normalizeClass(classes: CanArray<string | Dictionary>): string {
	let
		res = '';

	if (Object.isString(classes)) {
		res = classes;

	} else if (Object.isArray(classes)) {
		classes.forEach((className) => {
			const
				normalizedClass = normalizeClass(className);

			if (normalizedClass !== '') {
				res += `${normalizedClass} `;
			}
		});

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
 * Normalizes the provided CSS styles and returns the resulting output
 * @param styles
 */
export function normalizeStyle(styles: CanArray<string | Dictionary<string>>): string | Dictionary<string> {
	if (Object.isArray(styles)) {
		const
			normalizedStyles = {};

		styles.forEach((style) => {
			const normalizedStyle = Object.isString(style) ?
				parseStringStyle(style) :
				normalizeStyle(style);

			if (Object.size(normalizedStyle) > 0) {
				Object.entries(normalizedStyle).forEach(([name, style]) => normalizedStyles[name] = style);
			}
		});

		return normalizedStyles;
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
 * Analyzes the given CSS style string and returns a dictionary containing the parsed rules
 * @param style
 */
export function parseStringStyle(style: string): Dictionary<string> {
	const
		styles = {};

	style.split(listDelimiterRE).forEach((singleStyle) => {
		singleStyle = singleStyle.trim();

		if (singleStyle !== '') {
			const
				chunks = singleStyle.split(propertyDelimiterRE);

			if (chunks.length > 1) {
				styles[chunks[0].trim()] = chunks[1].trim();
			}
		}
	});

	return styles;
}

/**
 * Normalizes the passed VNode's attributes using the specified component metaobject and returns a new object
 *
 * @param attrs
 * @param dynamicProps
 * @param component
 */
export function normalizeComponentAttrs(
	attrs: Nullable<Dictionary>,
	dynamicProps: Nullable<string[]>,
	component: ComponentMeta
): CanNull<Dictionary> {
	const {
		props,
		// eslint-disable-next-line deprecation/deprecation
		params: {deprecatedProps}
	} = component;

	if (attrs == null) {
		return null;
	}

	const
		dynamicPropsPatches = {},
		normalizedAttrs = {...attrs};

	if (Object.isDictionary(normalizedAttrs['v-attrs'])) {
		normalizedAttrs['v-attrs'] = normalizeComponentAttrs(normalizedAttrs['v-attrs'], dynamicProps, component);
	}

	Object.keys(normalizedAttrs).forEach((attrName) => {
		let propName = `${attrName}Prop`.camelize(false);

		if (attrName === 'ref' || attrName === 'ref_for') {
			return;
		}

		if (deprecatedProps != null) {
			const alternativeName =
				deprecatedProps[attrName] ??
				deprecatedProps[propName];

			if (alternativeName != null) {
				changeAttrName(attrName, alternativeName);
				attrName = alternativeName;
				propName = `${alternativeName}Prop`;
			}
		}

		if (propName in props) {
			changeAttrName(attrName, propName);

		} else {
			patchDynamicProps(attrName);
		}
	});

	if (dynamicProps != null && Object.keys(dynamicPropsPatches).length > 0) {
		for (let i = 0; i < dynamicProps.length; i++) {
			const
				prop = dynamicProps[i],
				path = dynamicPropsPatches[prop];

			if (path != null) {
				if (path !== '') {
					dynamicProps[i] = path;

				} else {
					dynamicProps.slice(i, 1);
					i--;
				}
			}
		}
	}

	return normalizedAttrs;

	function changeAttrName(name: string, newName: string) {
		normalizedAttrs[newName] = normalizedAttrs[name];
		delete normalizedAttrs[name];

		if (dynamicProps == null) {
			return;
		}

		dynamicPropsPatches[name] = newName;
		patchDynamicProps(newName);
	}

	function patchDynamicProps(propName: string) {
		if (component.props[propName]?.forceUpdate === false) {
			dynamicPropsPatches[propName] = '';
		}
	}
}
