/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export interface DecoratorFunctionalOptions {
	/**
	 * If false, this value can't be used with a functional component
	 * @default `true`
	 */
	functional?: boolean;
}

export interface ParamsFactoryTransformer {
	(params: object, cluster: string): Dictionary<any>;
}

export interface FactoryTransformer<T = object> {
	(params?: T): Function;
}
