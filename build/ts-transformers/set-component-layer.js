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
	if (!isInsideComponent(sourceFile.path)) {
		return sourceFile;
	}

	const layer = getLayerName(sourceFile.path);
	const {factory} = context;

	/**
	 * A visitor for the AST node
	 *
	 * @param {Node} node
	 * @returns {Node}
	 */
	const visitor = (node) => {
		if (
			node.kind === ts.SyntaxKind.CallExpression &&
			node.parent?.kind === ts.SyntaxKind.Decorator &&
			node.expression?.escapedText === 'component'
		) {
			// noinspection JSAnnotator
			const properties = node.arguments?.[0]?.properties ?? [];

			return factory.createCallExpression(
				factory.createIdentifier('component'),
				undefined,

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
function getLayerName(filePath) {
	const pathToRootDir = filePath.match(pathToRootRgxp).groups.path;
	return require(`${pathToRootDir}/package.json`).name;
}

/**
 * Returns true if the specified path is within the context of the component
 *
 * @param {string} filePath
 * @returns {boolean}
 */
function isInsideComponent(filePath) {
	return isComponentPath.test(filePath);
}
