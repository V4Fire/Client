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

const prefixPathRegExp = /(?<path>.+)[/\\]src[/\\].*?/;
const componentRegExp = new RegExp(`[\\/](${validators.blockTypeList.join('|')})-.+?[\\/]?`);

function isComponent(path) {
	return componentRegExp.test(path);
}

function getLayerName(filePath) {
	const prefixPath = filePath.match(prefixPathRegExp).groups.path;
	return require(`${prefixPath}/package.json`).name;
}

/**
 *
 * @param {Context} context
 * @returns {Transformer}
 */
const setComponentLayerTransformer = (context) => (sourceFile) => {

	if (!isComponent(sourceFile.path)) {
		return sourceFile;
	}

	const layer = getLayerName(sourceFile.path);
	const {factory} = context;

	/**
	 * @param {Node} node
	 * @returns {VisitResult}
	 */
	const visitor = (node) => {
		if (node.kind === ts.SyntaxKind.CallExpression &&
			node.parent?.kind === ts.SyntaxKind.Decorator &&
			node.expression?.escapedText === 'component') {
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
 *
 */
module.exports = () => setComponentLayerTransformer;
