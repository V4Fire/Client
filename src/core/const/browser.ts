/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

const
	agent = navigator.userAgent;

export const is = {
	Android: agent.match(/Android/i),
	BlackBerry: agent.match(/BlackBerry/i),
	iOS: agent.match(/iPhone|iPad|iPod/i),
	OperaMini: agent.match(/Opera Mini/i),
	WindowsMobile: agent.match(/IEMobile/i),

	/**
	 * True if the current browser is mobile
	 */
	get mobile(): boolean {
		return this.Android || this.BlackBerry || this.iOS || this.OperaMini || this.WindowsMobile;
	}
};
