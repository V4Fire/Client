/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export default {
	GET: [
		{
			response(_: any, res: any): string {
				res.status = 400;
				return JSON.stringify({
					error: {
						code: 400,
						message: 'test message',
						description: 'test desc',
						title: 'test tile'
					}
				});
			}
		}
	]
};
