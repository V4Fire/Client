/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/* eslint-disable capitalized-comments */

'use strict';

const ts = require('typescript');
const {validators} = require('@pzlr/build-core');
const {
	getLayerName,
	getOriginLayerFromPath
} = include('build/helpers');

/**
 * @typedef {import('typescript').TransformationContext} Context
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').VisitResult} VisitResult
 * @typedef {import('typescript').Transformer} Transformer
 */

const
	isComponentPath = new RegExp(`\\/(${validators.blockTypeList.join('|')})-.+?\\/?`);

/**
 * The transformer that adds the "layer" property to component-meta objects
 * to indicate the name of the package in which it is defined
 *
 * @param {Context} context
 * @returns {Transformer}
 * @example
 * ```typescript
 * @component()
 * class bExample {}
 *
 * // Becomes
 * @component({ layer: '@v4fire/client' })
 * class bExample {}
 * ```
 *
 * ```
 * @component({functional: true})
 * class bExample {}
 *
 * // Becomes
 * @component({
 *   functional: true,
 *   layer: '@v4fire/client'
 * })
 * class bExample {}
 * ```
 */
const setComponentLayerTransformer = (context) => (sourceFile) => {
	const
		{factory} = context,
		isInitAppFile = sourceFile.path.endsWith('core/init/index.ts');

	if (!isInsideComponent(sourceFile.path) && !isInitAppFile) {
		return sourceFile;
	}

	let layer = getLayerName(sourceFile.path);

	if (isInitAppFile) {
		layer = getOriginLayerFromPath(sourceFile.path);
	}

	/**
	 * A visitor for the AST node
	 *
	 * @param {Node} node
	 * @returns {Node}
	 */
	const visitor = (node) => {
		const
			expr = node?.expression;

		if (
				ts.isCallExpression(node) &&
				isInitAppFile &&
				expr.escapedText === 'createApp'
			) {

			const updatedCallExpression = factory.createCallExpression(
				factory.createIdentifier(expr.escapedText),
				undefined,
				[
					...node.arguments,
					factory.createStringLiteral(layer)
				]
			);

			return updatedCallExpression;
		} else if (ts.isDecorator(node) && isComponentCallExpression(node)) {
			if (!ts.isCallExpression(expr)) {
				return node;
			}

			// noinspection JSAnnotator
			const properties = expr.arguments?.[0]?.properties ?? [];

			const updatedCallExpression = factory.updateCallExpression(
				expr,
				expr.expression,
				expr.typeArguments,

				[
					factory.createObjectLiteralExpression(
						[
							...properties,
							factory.createPropertyAssignment(
								factory.createIdentifier('layer'),
								factory.createStringLiteral(layer)
							)
						],

						false
					)
				]
			);

			return factory.updateDecorator(node, updatedCallExpression);
		}

		return ts.visitEachChild(node, visitor, context);
	};

	return ts.visitNode(sourceFile, visitor);
};

// eslint-disable-next-line @v4fire/require-jsdoc
module.exports = () => setComponentLayerTransformer;

/**
 * Returns true if the specified path is within the context of the component
 *
 * @param {string} filePath
 * @returns {boolean}
 */
function isInsideComponent(filePath) {
	return isComponentPath.test(filePath);
}

/**
 * Returns true if the specified call expression is `component()`
 *
 * @param {Node} node
 * @returns {boolean}
 */
function isComponentCallExpression(node) {
	const expr = node.expression;

	if (Boolean(expr) && !ts.isCallExpression(expr) || !ts.isIdentifier(expr?.expression)) {
		return false;
	}

	return expr.expression.escapedText === 'component';
}
