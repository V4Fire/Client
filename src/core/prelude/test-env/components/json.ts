/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const fnEvalSymbol = Symbol('Function for eval');

export const
	fnAlias = 'FN__',
	fnEvalAlias = 'FNEVAL__',
	fnMockAlias = 'FNMOCK__',
	regExpAlias = 'REGEX__';

export function evalFn<T extends Function>(func: T): T {
	func[fnEvalSymbol] = true;
	return func;
}

/**
 * Overrides the `toJSON` method of the provided object to return the identifier of a mock function
 * within the page context.
 *
 * @example
 * ```
 * const val1 = JSON.stringify({val: 1}); // '{"val": 1}';
 * const val2 = JSON.stringify(setSerializerAsMockFn({val: 1}, 'id')); // '"id"'
 * ```
 *
 * This function is needed in order to extract a previously inserted mock function
 * into the context of a browser page by its ID.
 *
 * @param obj - the object to override the `toJSON` method for.
 * @param id - the identifier of the mock function.
 * @returns The modified object with the overridden `toJSON` method.
 */
export function setSerializerAsMockFn<T extends object>(obj: T, id: string): T {
	Object.assign(obj, {
		toJSON: () => `${fnMockAlias}${id}`
	});

	return obj;
}

export function stringifyFunction(val: Function): string {
	if (val[fnEvalSymbol] != null) {
		return `${fnEvalAlias}${val.toString()}`;
	}

	return `${fnAlias}${val.toString()}`;
}

export function stringifyRegExp(regExp: RegExp): string {
	return `${regExpAlias}${JSON.stringify({source: regExp.source, flags: regExp.flags})}`;
}

/**
 * Stringifies the passed object to a JSON string and returns it.
 * The function also supports serialization of functions and regular expressions.
 *
 * @param obj
 */
export function expandedStringify(obj: object): string {
	return JSON.stringify(obj, (_, val) => {
		if (Object.isFunction(val)) {
			return stringifyFunction(val);
		}

		if (Object.isRegExp(val)) {
			return stringifyRegExp(val);
		}

		return val;
	});
}

/**
 * Parses the specified JSON string into a JS value and returns it.
 * The function also supports parsing of functions and regular expressions.
 *
 * @param str
 */
export function expandedParse<T = JSONLikeValue>(str: string): T {
	return JSON.parse(str, (_, val) => {
		if (Object.isString(val)) {
			if (val.startsWith(fnAlias)) {
				// eslint-disable-next-line no-new-func
				return Function(`return ${val.replace(fnAlias, '')}`)();
			}

			if (val.startsWith(fnEvalAlias)) {
				// eslint-disable-next-line no-new-func
				return Function(`return ${val.replace(fnEvalAlias, '')}`)()();
			}

			if (val.startsWith(fnMockAlias)) {
				const mockId = val.replace(fnMockAlias, '');
				return globalThis[mockId];
			}

			if (val.startsWith(regExpAlias)) {
				const obj = JSON.parse(val.replace(regExpAlias, ''));
				return new RegExp(obj.source, obj.flags);
			}
		}

		return val;
	});
}

globalThis.expandedParse = expandedParse;
