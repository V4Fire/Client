/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type { VNode } from 'core/component/engines';

import {

	mergeProps,
	setVNodePatchFlags,

	normalizeStyle,
	normalizeClass

} from 'core/component/render';

import { modRgxp, styleAttrs, classAttrs } from 'core/component/directives/attrs/const';

/**
 * Normalizes the property attribute name by removing prefixes and formatting modifiers
 *
 * @param name
 * @throws {SyntaxError} if the `v-bind` modifier is invalid
 */
export function normalizePropertyAttribute(name: string): string {
	let attrName = name.startsWith(':') ? name.slice(1) : name;

	if (modRgxp.test(attrName)) {
		const attrChunks = attrName.split('.');
		attrName = attrName.startsWith('.') ? `.${attrChunks[1]}` : attrChunks[0];

		if (attrChunks.includes('camel')) {
			attrName = attrName.camelize(false);
		}

		if (attrChunks.includes('prop') && !attrName.startsWith('.')) {
			if (attrName.startsWith('^')) {
				throw new SyntaxError('Invalid `v-bind` modifiers');
			}

			attrName = `.${attrName}`;
		}

		if (attrChunks.includes('attr') && !attrName.startsWith('^')) {
			if (attrName.startsWith('.')) {
				throw new SyntaxError('Invalid `v-bind` modifiers');
			}

			attrName = `^${attrName}`;
		}
	}

	return attrName;
}

/**
 * Normalizes a string containing modifiers into a boolean dictionary
 * @param rawModifiers
 */
export function normalizeDirectiveModifiers(rawModifiers: string): Record<string, boolean> {
	const modifiers = {};

	rawModifiers.split('.').forEach((modifier) => {
		modifier = modifier.trim();

		if (modifier !== '') {
			modifiers[modifier] = true;
		}
	});

	return modifiers;
}

/**
 * Patches and formats the provided props according to the attribute
 *
 * @param props
 * @param attrName
 * @param attrVal
 * @param [vnode] - required for client-side rendering.
 */
export function patchProps(props: Dictionary, attrName: string, attrVal: unknown, vnode?: VNode): void {
	if (classAttrs[attrName] != null) {
		attrName = classAttrs[attrName];
		attrVal = normalizeClass(Object.cast(attrVal));

		if (vnode != null) {
			setVNodePatchFlags(vnode, 'classes');
		}

	} else if (styleAttrs[attrName] != null) {
		attrVal = normalizeStyle(Object.cast(attrVal));

		if (vnode != null) {
			setVNodePatchFlags(vnode, 'styles');
		}

	} else {
		if (vnode != null) {
			setVNodePatchFlags(vnode, 'props');
		}

		if (attrName.startsWith('-')) {
			attrName = `data${attrName}`;
		}

		if (vnode != null) {
			const dynamicProps = vnode.dynamicProps ?? [];
			vnode.dynamicProps = dynamicProps;

			if (!dynamicProps.includes(attrName)) {
				dynamicProps.push(attrName);
			}
		}
	}

	if (props[attrName] != null) {
		Object.assign(props, mergeProps({[attrName]: props[attrName]}, {[attrName]: attrVal}));

	} else {
		props[attrName] = attrVal;
	}
}
