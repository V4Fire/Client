/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export {};

declare global {
	namespace PlaywrightTest {
		interface Matchers<R> {
			toBeResolved(): R;
			toBeResolvedTo(val: any): R;
			toBeRejected(): R;
			toBeRejectedWith(val: any): R;
			toBePending(): R;
		}
	}
}
