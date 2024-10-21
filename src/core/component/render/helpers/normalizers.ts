/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { isPropGetter } from 'core/component/reflect';
import type { ComponentMeta } from 'core/component/meta';

/**
 * Normalizes the provided CSS classes and returns the resulting output
 * @param classes
 */
export function normalizeClass(classes: CanArray<string | Dictionary>): string {
	let classesStr = '';

	if (Object.isString(classes)) {
		classesStr = classes;

	} else if (Object.isArray(classes)) {
		for (let i = 0; i < classes.length; i += 1) {
			const
				className = classes[i],
				normalizedClass = normalizeClass(className);

			if (normalizedClass !== '') {
				classesStr += `${normalizedClass} `;
			}
		}

	} else if (Object.isDictionary(classes)) {
		const keys = Object.keys(classes);

		for (let i = 0; i < keys.length; i++) {
			const className = keys[i];

			if (Object.isTruly(classes[className])) {
				classesStr += `${className} `;
			}
		}
	}

	return classesStr.trim();
}

/**
 * Normalizes the provided CSS styles and returns the resulting output
 * @param styles
 */
export function normalizeStyle(styles: CanArray<string | Dictionary<string>>): string | Dictionary<string> {
	if (Object.isArray(styles)) {
		const normalizedStyles = {};

		for (let i = 0; i < styles.length; i++) {
			const style = styles[i];

			const normalizedStyle = Object.isString(style) ?
				parseStringStyle(style) :
				normalizeStyle(style);

			if (Object.isDictionary(normalizedStyle)) {
				const keys = Object.keys(normalizedStyle);

				for (let i = 0; i < keys.length; i++) {
					const name = keys[i];
					normalizedStyles[name] = normalizedStyle[name];
				}
			}
		}

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
	listDelimiterRgxp = /;(?![^(]*\))/g,
	propertyDelimiterRgxp = /:(.+)/;

/**
 * Analyzes the given CSS style string and returns a dictionary containing the parsed rules
 * @param style
 */
export function parseStringStyle(style: string): Dictionary<string> {
	const styles = {};

	const styleRules = style.split(listDelimiterRgxp);

	for (let i = 0; i < styleRules.length; i++) {
		const style = styleRules[i].trim();

		if (style !== '') {
			const chunks = style.split(propertyDelimiterRgxp, 2);

			if (chunks.length > 1) {
				styles[chunks[0].trim()] = chunks[1].trim();
			}
		}
	}

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
		params: {deprecatedProps, functional}
	} = component;

	if (attrs == null) {
		return null;
	}

	let dynamicPropsPatches: CanNull<Map<string, string>> = null;

	const normalizedAttrs = {...attrs};

	if (Object.isDictionary(normalizedAttrs['v-attrs'])) {
		normalizedAttrs['v-attrs'] = normalizeComponentAttrs(normalizedAttrs['v-attrs'], dynamicProps, component);
	}

	const attrNames = Object.keys(normalizedAttrs);

	for (let i = 0; i < attrNames.length; i++) {
		const attrName = attrNames[i];
		normalizeAttr(attrName, normalizedAttrs[attrName]);
	}

	modifyDynamicPath();

	return normalizedAttrs;

	function normalizeAttr(attrName: string, value: unknown) {
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

		const needSetAdditionalProp =
			functional === true && dynamicProps != null &&
			isPropGetter.test(attrName) && Object.isFunction(value);

		// For correct operation in functional components, we need to additionally duplicate such props
		if (needSetAdditionalProp) {
			const
				tiedPropName = isPropGetter.replace(attrName),
				tiedPropValue = value()[0];

			normalizedAttrs[tiedPropName] = tiedPropValue;
			normalizeAttr(tiedPropName, tiedPropValue);
			dynamicProps.push(tiedPropName);
		}

		if (propName in props || isPropGetter.replace(propName) in props) {
			changeAttrName(attrName, propName);

		} else {
			patchDynamicProps(attrName);
		}
	}

	function changeAttrName(name: string, newName: string) {
		normalizedAttrs[newName] = normalizedAttrs[name];
		delete normalizedAttrs[name];

		if (dynamicProps == null) {
			return;
		}

		dynamicPropsPatches ??= new Map();
		dynamicPropsPatches.set(name, newName);

		patchDynamicProps(newName);
	}

	function patchDynamicProps(propName: string) {
		if (functional !== true && component.props[propName]?.forceUpdate === false) {
			dynamicPropsPatches ??= new Map();
			dynamicPropsPatches.set(propName, '');
		}
	}

	function modifyDynamicPath() {
		if (dynamicProps == null || dynamicPropsPatches == null) {
			return;
		}

		for (let i = dynamicProps.length - 1; i >= 0; i--) {
			const
				prop = dynamicProps[i],
				path = dynamicPropsPatches.get(prop);

			if (path == null) {
				continue;
			}

			if (path !== '' && dynamicPropsPatches.get(path) !== '') {
				dynamicProps[i] = path;

			} else {
				dynamicProps.splice(i, 1);
			}
		}
	}
}
