/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface Store {
	data: Dictionary<HydratedValue>;
	store: Dictionary<Dictionary<string>>;
}

export type HydratedValue =
	JSONLikeValue |
	bigint |
	Function |
	Date |
	Map<unknown, unknown> |
	Set<unknown> |
	HydratedValue[] |
	Dictionary<HydratedValue>;

export type HydratedData = Dictionary<HydratedValue>;

export type Environment = 'server' | 'client';
