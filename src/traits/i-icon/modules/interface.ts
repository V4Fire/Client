/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Icon {
	id: string;
	content: string;
	viewBox: string;
	stringify(): string;
	destroy(): void;
}
