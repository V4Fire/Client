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

/**
 * @typedef {import('typescript').TransformationContext} Context
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').VisitResult} VisitResult
 * @typedef {import('typescript').Transformer} Transformer
 */

const
	pathToRootRgxp = /(?<path>.+)[/\\]src[/\\]/,
	isComponentPath = new RegExp(`\\/(${validators.blockTypeList.join('|')})-.+?\\/?`);

module.exports = setComponentLayer;

/**
 * Adds the "layer" property to the component declaration parameters
 * to indicate the name of the package in which it is defined
 *
 * @param {Context} context
 * @returns {Transformer}
 *
 * @example
 * ```typescript
 * @component()
 * class bExample extends iBlock {}
 * ```
 *
 * Will transform to
 *
 * ```typescript
 * @component({layer: '@v4fire/client'})
 * class bExample extends iBlock {}
 * ```
 */
function setComponentLayer(context) {
	return (sourceFile) => {
		if (!isInsideComponent(sourceFile.path)) {
			return sourceFile;
		}

		const layer = getLayerName(sourceFile.path);
		const {factory} = context;

		return ts.visitNode(sourceFile, visitor);

		/**
		 * A visitor for the AST node
		 *
		 * @param {Node} node
		 * @returns {Node}
		 */
		function visitor(node) {
			if (ts.isDecorator(node) && isComponentCallExpression(node)) {
				const expr = node.expression;

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
		}
	};
}

/**
 * The function determines the package in which the module is defined and
 * returns the name of that package from the `package.json` file
 *
 * @param {string} filePath
 * @returns {string}
 */
function getLayerName(filePath) {
	const pathToRootDir = filePath.match(pathToRootRgxp).groups.path;
	return require(`${pathToRootDir}/package.json`).name;
}

/**
 * Returns true if the specified path is within the component's context
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
