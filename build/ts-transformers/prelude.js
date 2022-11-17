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
 * A TypeScript converter to replace ...
 *
 * @param {Context} context
 * @returns {Transformer}
 * @example
 * ```typescript
 * ```
 */

const preludeMethods = require('./prelude-methods.json');

const primitives = ['Number', 'Array', 'Date', 'Object', 'String', 'RegExp', 'Function'];
const primitiveConstructors = primitives.map((item) => `${item}Constructor`);
const primitiveTypes = [...primitiveConstructors, 'AnyFunction', 'number', 'string', 'Date'].map((item) => item.toLowerCase());

const isTypePrimitive = (type) => primitiveTypes.includes(type.toLowerCase());

const normalizePrimitiveType = (
	primitiveType
) => primitives.find((item) => primitiveType.toLowerCase().includes(item.toLowerCase()));

const SAFE_METHOD_SUFFIX = '_prelude';
const getSafeMethodName = (methodName) => `${methodName}${SAFE_METHOD_SUFFIX}`;

const getTypeOfCallExpression = (
	node, typeChecker
) => {
	if (!node.expression || !node.expression.expression) {
		return;
	}

	const tsType = typeChecker.typeToString(typeChecker.getTypeAtLocation(node.expression.expression));

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
};

const createCallExpression = ({factory}, originalCallExpression, methodName, methodType, args) => {
	const {isProto} = preludeMethods[methodType][methodName];
	const callExpressionArguments = [...args];

	if (isProto) {
		const
			parent = originalCallExpression.expression && originalCallExpression.expression.expression,
			parentName = parent.escapedText || parent.name && parent.name.escapedText;

		if (parentName === undefined || !primitives.includes(parentName)) {
				callExpressionArguments.unshift(ts.getLeftmostExpression(originalCallExpression));
		}
	}

	return factory.createCallExpression(
		factory.createIdentifier(getSafeMethodName(methodName)),
		undefined,
		callExpressionArguments
	);
};

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

const preludeTransformer = (program) => (context) => {
	const sourceUsedMethods = {};

	/**
	 * @param {Node} node
	 * @returns {VisitResult}
	 */
	function visitor(node) {
		const typeChecker = program.getTypeChecker();

		// Todo transform access expressions like Object.isString;
		// Ищем вызовы функции
		if (ts.isCallExpression(node)) {
			const
				expression = ts.getInvokedExpression(node),
				methodName = expression.name && expression.name.text,
				callExpressionType = getTypeOfCallExpression(node, typeChecker);

			if (
				methodName &&
				isTypePrimitive(callExpressionType) &&
				isMethodBelongsType(methodName, callExpressionType)
			) {
				const
					sourceFile = node.getSourceFile(),
					methodType = normalizePrimitiveType(callExpressionType);

				// Запоминаем какие методы мы использовали в файле
				if (!Object.hasOwnProperty.call(sourceUsedMethods[sourceFile.path], methodName)) {
					sourceUsedMethods[sourceFile.path][methodName] = {type: methodType};
				}

				return createCallExpression(context, node, methodName, methodType, node.arguments.map((item) => item));
			}
		}

		return ts.visitEachChild(node, visitor, context);
	}

	function sourceFileVisitor(sourceFile) {
		if (/\/@v4fire\/core\/prelude\//.test(sourceFile.path)) {
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
