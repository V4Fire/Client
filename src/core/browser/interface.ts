/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export type Pattern = string | RegExp | PatternFn;

export type PatternFn = (userAgent: string) => [CanUndef<string>, CanUndef<string>] | null;

