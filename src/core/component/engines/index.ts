/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/engines/README.md]]
 * @packageDocumentation
 */

export * from 'core/component/engines/const';

//#if runtime.engine = vue
export * from 'core/component/engines/vue';
//#endif

//#if runtime.engine = zero
// @ts-ignore
export * from 'core/component/engines/zero';
//#endif
