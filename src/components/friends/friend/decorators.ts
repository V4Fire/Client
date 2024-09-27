/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * Adds the specified fake methods to a class
 *
 * @decorator
 * @param methods - methods to fake
 */
export function fakeMethods(...methods: string[]): ClassDecorator {
	return (target) => {
		const {prototype} = target;

		methods.forEach((method) => {
			if (!Object.isFunction(prototype[method])) {
				prototype[method] = function fake() {
					Object.throw(
						`This is a loopback method. To use the real \`${method}\` method, register it to the \`${target.name}\` class.`
					);
				};
			}
		});
	};
}
