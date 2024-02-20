/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const ts = require('typescript');
const path = require('upath');

const prefixPathRegExp = new RegExp(`.+(${path.sep}|\\|)src`);

function getLayerName(filePath) {
	const prefixPath = filePath.match(prefixPathRegExp)[0];
	const packageJson = require(`${prefixPath}/../package.json`);
	return packageJson.name;
}

/**
 *
 * @param context
 */
const setComponentLayerTransformer = (context) => (sourceFile) => {

	const layer = getLayerName(sourceFile.path);
	const {factory} = context;

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
