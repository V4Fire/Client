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
const {getLayerName} = include('build/helpers');

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
	const isInitAppFile = sourceFile.path.endsWith('core/init/index.ts');

	if (!isInsideComponent(sourceFile.path) && !isInitAppFile) {
		return sourceFile;
	}

	let layer = getLayerName(sourceFile.path);

	if (isInitAppFile) {
		const pathToRootPackage = sourceFile.path.match(/(?<path>.+)[/\\]node_modules[/\\]/)?.groups?.path;

		layer = pathToRootPackage != null ?
			require(`${pathToRootPackage}/package.json`).name :
			getLayerName(sourceFile.path);
	} else {
		return sourceFile;
	}

	const {factory} = context;

	/**
	 * A visitor for the AST node
	 *
	 * @param {Node} node
	 * @returns {Node}
	 */
	const visitor = (node) => {
		const
			expr = node.expression;

		if (ts.isReturnStatement(node) && isInitAppFile && expr.expression.escapedText === 'createApp') {
			const newArgument = factory.createStringLiteral(layer);

			const updatedCallExpression = factory.createReturnStatement(
				factory.createCallExpression(
					factory.createIdentifier("createApp"),
					undefined,
					[
						...expr.arguments,
						newArgument
					]
				)
			);

			console.log({updatedCallExpression: updatedCallExpression});

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
 * The function determines the package in which the module is defined and
 * returns the name of this package from the `package.json` file
 *
 * @param {string} filePath
 * @returns {string}
 */
// function getLayerName(filePath) {
// 	const pathToRootDir = filePath.match(pathToRootRgxp).groups.path;
// 	return require(`${pathToRootDir}/package.json`).name;
// }

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

function isCreateAppCallExpression(node) {
	const expr = node.expression;

	if (Boolean(expr) && ts.isCallExpression(expr) || !ts.isIdentifier(expr?.expression)) {
		return false;
	}

	return expr.expression.escapedText === 'createApp';
}
