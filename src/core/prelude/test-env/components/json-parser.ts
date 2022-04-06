/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export const
	fnAlias = 'FN__',
	regExpAlias = 'REGEX__';

/**
 * @param obj
 */
export function zipJson(obj: Dictionary<any>): string {
	return JSON.stringify(obj, (_key, val) => {
		if (Object.isFunction(val)) {
			return `${fnAlias}${val.toString()}`;
		}

		if (Object.isRegExp(val)) {
			return `${regExpAlias}${JSON.stringify({source: val.source, flags: val.flags})}`;
		}

		return val;
	});
}

/**
 * @param obj
 */
export function unzipJson(obj: string): Dictionary<any> {
	return JSON.parse(obj, (_key, val) => {
		if (Object.isString(val)) {
			if (val.startsWith(fnAlias)) {
				// eslint-disable-next-line no-eval
				return eval(val.replace(fnAlias, ''));
			}

			if (val.startsWith(regExpAlias)) {
				const obj = JSON.parse(val.replace(regExpAlias, ''));
				return new RegExp(obj.source, obj.flags);
			}
		}

		return val;
	});
}
