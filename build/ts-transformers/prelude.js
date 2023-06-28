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
 * A TypeScript converter to replace ...
 *
 * @param {Context} context
 * @returns {Transformer}
 * @example
 * ```typescript
 * ```
 */

const preludeMethods = require('./prelude-methods.json');

const functionMethods = preludeMethods.Function;

const primitives = ['Number', 'Array', 'Date', 'Object', 'String', 'RegExp', 'Function'];
const primitiveConstructors = primitives.map((item) => `${item}Constructor`);
const primitiveTypes = [...primitiveConstructors, 'AnyFunction', 'number', 'string', 'Date'].map((item) => item.toLowerCase());

const isTypePrimitive = (type) => primitiveTypes.includes(type.toLowerCase());

const normalizePrimitiveType = (
	primitiveType
) => primitives.find((item) => primitiveType.toLowerCase().includes(item.toLowerCase()));

const SAFE_METHOD_SUFFIX = '_prelude';
const getSafeMethodName = (methodName) => `${methodName}${SAFE_METHOD_SUFFIX}`;

function getType(node, typeChecker) {
	const tsType = typeChecker.typeToString(typeChecker.getTypeAtLocation(node));

	if (tsType) {
		if (!Number.isNaN(parseInt(tsType, 10))) {
			return 'Number';
		}

		// Replaces string | undefined => string
		// and AnyFunction<any[], any> => AnyFunction
		return tsType
			.replace('| undefined', '')
			.replace(/<.*>/, '')
			.trim();
	}

	return tsType;
}

function getLeftMostIdentifier(callExpression) {
	const
		leftMostExpression = callExpression.expression.expression,
		nodeName = leftMostExpression.escapedText;

	if (
		primitives.includes(nodeName) ||
		// This keyword
		leftMostExpression.kind === 108
	) {
		return;
	}

	return leftMostExpression;
}

function createCallExpression({factory}, originalCallExpression, methodName, isProto, args) {
	const expressionArgs = [...args];

	if (isProto) {
		const leftMostExpression = getLeftMostIdentifier(originalCallExpression);

		if (leftMostExpression) {
			expressionArgs.unshift(leftMostExpression);
		}

		return factory.createParenthesizedExpression(
			factory.createCallExpression(
				factory.createPropertyAccessExpression(
					factory.createIdentifier(getSafeMethodName(methodName)),
					factory.createIdentifier('call')
				),
				undefined,
				expressionArgs
			)
		);
	}

	// Object.isArray(value); => isArray(value)
	// Array.concat(arr, evt); => concat.call(arr, evt);

	return factory.createParenthesizedExpression(
		factory.createCallExpression(
			factory.createIdentifier(getSafeMethodName(methodName)),
			undefined,
			expressionArgs
		)
	);
}

function createFunctionExpression({factory}, originalCallExpression, methodName, args) {
	const
		leftMostExpression = originalCallExpression.expression.expression,
		expressionArgs = [...args];

	debugger;
	expressionArgs.unshift(leftMostExpression);

	return factory.createParenthesizedExpression(
		factory.createCallExpression(
			factory.createPropertyAccessExpression(
				factory.createIdentifier(getSafeMethodName(methodName)),
				factory.createIdentifier('call')
			),
			undefined,
			expressionArgs
		)
	);
}

function createBindExpression({factory}, methodName, args) {
	return factory.createParenthesizedExpression(factory.createCallExpression(
		factory.createPropertyAccessExpression(
			factory.createIdentifier(getSafeMethodName(methodName)),
			factory.createIdentifier('bind')
		),
		undefined,
		[...args]
	));
}

const createImport = ({factory}, methodName, type) => {
	const {path, name} = preludeMethods[type][methodName];

	return factory.createImportDeclaration(
		undefined,
		undefined,
		factory.createImportClause(
			false,
			undefined,
			factory.createNamedImports([
				factory.createImportSpecifier(
					false,
					factory.createIdentifier(name),
					factory.createIdentifier(getSafeMethodName(methodName))
				)
			])
		),
		factory.createStringLiteral(path),
		undefined
	);
};

const isMethodBelongsType = (methodName, type) => {
	const
		normalizedType = normalizePrimitiveType(type),
		typeMethods = normalizedType && preludeMethods[normalizedType];

	return typeMethods && Object.hasOwnProperty.call(typeMethods, methodName);
};

function getMethodName(expression) {
	return expression.name && expression.name.text;
}

function isExpressionFromPrelude(callExpressionType, methodName) {
	return isTypePrimitive(callExpressionType) && isMethodBelongsType(methodName, callExpressionType);
}

function isMethodNeedsProto(type, methodName) {
	const
		normalizedType = normalizePrimitiveType(type),
		typeMethods = normalizedType && preludeMethods[normalizedType];

	return typeMethods[methodName].isProto;
}

function isExpressionPreludeFunction(methodName) {
	return Object.hasOwnProperty.call(functionMethods, methodName);
}

function getExecutedNode(node) {
	return ts.getInvokedExpression(ts.getInvokedExpression(node));
}

const preludeTransformer = (program) => (context) => {
	const sourceUsedMethods = {};

	function visitor(node) {
		const typeChecker = program.getTypeChecker();

		// Todo transform access expressions like Object.isString;
		// Ищем вызовы функции
		if (ts.isCallExpression(node)) {
			const
				expression = ts.getInvokedExpression(node),
				methodName = getMethodName(expression),
				executedNode = getExecutedNode(node);

			if (methodName) {
				const
					callExpressionType = getType(executedNode, typeChecker);

				if (isExpressionFromPrelude(callExpressionType, methodName)) {
					const
						sourceFile = node.getSourceFile(),
						methodType = normalizePrimitiveType(callExpressionType);

					// Запоминаем какие методы мы использовали в файле
					if (!Object.hasOwnProperty.call(sourceUsedMethods[sourceFile.path], methodName)) {
						sourceUsedMethods[sourceFile.path][methodName] = {type: methodType};
					}

					return createCallExpression(
						context,
						node,
						methodName,
						isMethodNeedsProto(callExpressionType, methodName),
						node.arguments.map((item) => ts.visitEachChild(item, visitor, context))
					);
				}

				if (isExpressionPreludeFunction(methodName)) {
					const
						sourceFile = node.getSourceFile(),
						methodType = 'Function';

					// Запоминаем какие методы мы использовали в файле
					if (!Object.hasOwnProperty.call(sourceUsedMethods[sourceFile.path], methodName)) {
						sourceUsedMethods[sourceFile.path][methodName] = {type: methodType};
					}

					return createFunctionExpression(
						context,
						node,
						methodName,
						node.arguments.map((item) => ts.visitEachChild(item, visitor, context))
					);
				}

				if (methodName === 'bind') {
					const callExpressionType = getType(ts.getLeftmostExpression(node), typeChecker);

					const
						sourceFile = node.getSourceFile(),
						methodType = normalizePrimitiveType(callExpressionType),
						preludeMethodName = getMethodName(executedNode);

					if (isExpressionFromPrelude(callExpressionType, preludeMethodName)) {
						if (!Object.hasOwnProperty.call(sourceUsedMethods[sourceFile.path], preludeMethodName)) {
							sourceUsedMethods[sourceFile.path][preludeMethodName] = {type: methodType};
						}

						return createBindExpression(
							context,
							preludeMethodName,
							node.arguments
						);
					}
				}
			}
		}

		return ts.visitEachChild(node, visitor, context);
	}

	function sourceFileVisitor(sourceFile) {
		if (/@v4fire\/core\/src\/core\/prelude/.test(sourceFile.path)) {
			return sourceFile;
		}

		sourceUsedMethods[sourceFile.path] = {};
		const newSourceFile = ts.visitEachChild(sourceFile, visitor, context);

		const
			usedMethods = sourceUsedMethods[sourceFile.path],
			imports = [];

		if (!Object.keys(usedMethods).length) {
			return sourceFile;
		}

		for (const method in usedMethods) {
			if (Object.hasOwnProperty.call(usedMethods, method)) {
				imports.push(createImport(context, method, usedMethods[method].type));
			}
		}

		const newSource = context.factory.updateSourceFile(
			newSourceFile,
			[
				...imports,
				...newSourceFile.statements
			]
		);

		return newSource;
	}

	return (node) => ts.visitNode(node, sourceFileVisitor);
};

module.exports = preludeTransformer;
