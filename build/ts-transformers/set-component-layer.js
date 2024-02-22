/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const ts = require('typescript');
const {validators} = require('@pzlr/build-core');

/**
 * @typedef {import('typescript').TransformationContext} Context
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').VisitResult} VisitResult
 * @typedef {import('typescript').Transformer} Transformer
 */

const pathToRootRegExp = /(?<path>.+)[/\\]src[/\\]/;
const componentRegExp = new RegExp(`[\\/](${validators.blockTypeList.join('|')})-.+?[\\/]?`);

function isInsideComponent(path) {
	return componentRegExp.test(path);
}

function getLayerName(filePath) {
	const pathToRootDir = filePath.match(pathToRootRegExp).groups.path;
	return require(`${pathToRootDir}/package.json`).name;
}

/**
 *
 * @param {Context} context
 * @returns {Transformer}
 */
const setComponentLayerTransformer = (context) => (sourceFile) => {
	if (!isInsideComponent(sourceFile.path)) {
		return sourceFile;
	}

	const layer = getLayerName(sourceFile.path);
	const {factory} = context;

	/**
	 * @param {Node} node
	 * @returns {Node}
	 */
	const visitor = (node) => {
		if (node.kind === ts.SyntaxKind.CallExpression &&
				node.parent?.kind === ts.SyntaxKind.Decorator &&
				node.expression?.escapedText === 'component'
		) {

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

/**
 * The transformer that adds the "layer" property to component objects
 * to indicate the name of the package in which it is defined
 */
module.exports = () => setComponentLayerTransformer;
