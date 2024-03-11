/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

'use strict';

const ts = require('typescript');

/**
 * @typedef {import('typescript').TransformationContext} Context
 * @typedef {import('typescript').Node} Node
 * @typedef {import('typescript').VisitResult} VisitResult
 * @typedef {import('typescript').Transformer} Transformer
 */

/**
 * A TypeScript converter that replaces RegExp literals with a constructor-generated form that supports modern flags,
 * allowing for the use of polyfills
 *
 * @param {Context} context
 * @returns {Transformer}
 * @example
 * ```typescript
 * /\d/y
 * // Becomes
 * new RegExp('\\d', 'y');
 *
 * /\W+/su
 * // Becomes
 * new RegExp('\\W+', 'su');
 * ```
 */
function modernRegExpFlagsTransformer(context) {
	const modernRegExpFlags = ['s', 'y', 'u'];

	/**
	 * A visitor for the AST node
	 *
	 * @param {Node} node
	 * @returns {VisitResult}
	 */
	function visitor(node) {
		if (node.kind === ts.SyntaxKind.RegularExpressionLiteral) {
			const
				lastSlash = node.text.lastIndexOf('/'),
				flags = node.text.slice(lastSlash + 1),
				regExp = node.text.slice(1, lastSlash),
				isModernRegExp = modernRegExpFlags.some((flag) => flags.includes(flag));

			if (isModernRegExp) {
				return context.factory.createNewExpression(
					context.factory.createIdentifier('RegExp'),
					undefined,
					[
						context.factory.createStringLiteral(regExp),
						context.factory.createStringLiteral(flags)
					]
				);
			}
		}

		return ts.visitEachChild(node, visitor, context);
	}

	return (node) => ts.visitNode(node, visitor);
}

// eslint-disable-next-line @v4fire/require-jsdoc
module.exports = () => modernRegExpFlagsTransformer;
