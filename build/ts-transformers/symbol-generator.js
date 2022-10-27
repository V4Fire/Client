'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const ts = require('typescript');

/**
 * @typedef {import('typescript').TransformationContext} Context
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').VisitResult} VisitResult
 * @typedef {import('typescript').TypeChecker} TypeChecker
 * @typedef {import('typescript').Transformer} Transformer
 * @typedef {import('typescript').CallExpression} CallExpression
 */

/**
 * Checks is type of node equals SymbolGenerator
 *
 * @param {Node} node
 * @param {TypeChecker} checker
 * @returns {boolean}
 */
const isSymbolGenerator = (node, checker) => {
	const symbol = checker.getSymbolAtLocation(node);

	if (!symbol) {
		return false;
	}

	const type = checker.typeToString(
		checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
	);

	return type === 'SymbolGenerator';
};

/**
 * Creates AST for call of __getValue__
 *
 * @param {Context} context
 * @param {String} keyName
 * @returns {CallExpression}
 */
const createProperyAccess = (context, keyName, propName) => context.factory.createCallExpression(
  context.factory.createPropertyAccessExpression(
    context.factory.createIdentifier(keyName),
    context.factory.createIdentifier('__getValue__')
  ),
  undefined,
  [context.factory.createStringLiteral(propName)]
);

/**
 * A TypeScript converter for Symbol expression calls
 * into calls of internal method __getValue__
 *
 * @param {Context} context
 * @returns {Transformer}
 * @example
 * ```typescript
 * symbolGenerator('a')
 * // Becomes
 * symbolGenerator.__getValue__('a');
 * ```
 */
const symbolGeneratorTransformer = (program) => (context) => {
	const typeChecker = program.getTypeChecker();

	/**
	 * @param {Node} node
	 * @returns {VisitResult}
	 */
	function visitor(node) {
		if (
			ts.isPropertyAccessExpression(node) &&
			isSymbolGenerator(ts.getLeftmostExpression(node), typeChecker)
		) {
			const
				propName = ts.getTextOfNode(node.name),
				keyName = ts.getTextOfNode(node.expression);

			return createProperyAccess(context, keyName, propName);
		}

		return ts.visitEachChild(node, visitor, context);
	}

	return (node) => ts.visitNode(node, visitor);
};

module.exports = symbolGeneratorTransformer;
