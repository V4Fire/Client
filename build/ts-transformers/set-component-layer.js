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
const {validators} = require('@pzlr/build-core');

const componentRegExp = new RegExp(`(${path.sep}|\\|)(${validators.blockTypeList.join('|')})-.+?(${path.sep}|\\|)?`);
const prefixPathRegExp = new RegExp(`.+(${path.sep}|\\|)src`);

function getLayerName(filePath) {
	const prefixPath = filePath.match(prefixPathRegExp)[0];
	const packageJson = require(`${prefixPath}/../package.json`);
	return packageJson.name;
}

function isComponent(filePath) {
	return componentRegExp.test(filePath);
}

/**
 *
 * @param context
 */
const setComponentLayerTransformer = (context) => (sourceFile) => {

	const layer = getLayerName(sourceFile.path);

	const visitor = (node) => {
		if (node.kind === ts.SyntaxKind.CallExpression &&
		node.parent?.kind === ts.SyntaxKind.Decorator &&
		node.expression?.escapedText === 'component') {

			if (node.arguments.length === 0) {

				const newNode = context.factory.createCallExpression(
					context.factory.createIdentifier('component'),
					undefined,
					[
						context.factory.createObjectLiteralExpression(
							[
								context.factory.createPropertyAssignment(
									context.factory.createIdentifier('layer'),
									context.factory.createStringLiteral(layer)
								)
							],
							false
						)
					]
				);

				return newNode;
			}
		}

		return ts.visitEachChild(node, visitor, context);
	};

	return ts.visitNode(sourceFile, visitor);
};

/**
 *
 */
module.exports = () => setComponentLayerTransformer;
