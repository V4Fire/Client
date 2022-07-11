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
 * @typedef {import('typescript').Transformer} Transformer
 */

/**
 * A TypeScript converter to replace RegExp literals
 * with modern flags in a constructor-generated form so that polyfills can be used.
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

module.exports = modernRegExpFlagsTransformer;
