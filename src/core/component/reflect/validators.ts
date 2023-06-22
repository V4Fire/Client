/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * This regular expression can be used to determine whether a component is a "smart" component based on its name
 */
export const isSmartComponent = /-functional$/;

/**
 * This regular expression allows you to determine if a component is abstract based on its name
 */
export const isAbstractComponent = /^[iv]-/;
