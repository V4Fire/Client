/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

module.exports = [
	{
		attrs: {
			get ':options'() {
				const
					options = [];

				for (let i = 0; i < 50; i++) {
					options.push({
						value: i,
						label: String(i),
					});
				}

				return JSON.stringify(options);
			}
		}
	}
];
