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
			toBeResolved(): Promise<R>;
			toBeResolvedTo(val: any): Promise<R>;
			toBeRejected(): Promise<R>;
			toBeRejectedWith(val: any): Promise<R>;
			toBePending(): Promise<R>;
		}
	}

	namespace Playwright {
		type Permission = '*' |
			'geolocation' |
			'midi' |
			'midi-sysex' |
			'notifications' |
			'push' |
			'camera' |
			'microphone' |
			'background-sync' |
			'ambient-light-sensor' |
			'accelerometer' |
			'gyroscope' |
			'magnetometer' |
			'accessibility-events' |
			'clipboard-read' |
			'clipboard-write' |
			'payment-handler';

	}
}
