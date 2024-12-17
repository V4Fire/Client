/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/functional/README.md]]
 * @packageDocumentation
 */

export { createVirtualContext } from 'core/component/functional/context';
export { VHookLifeCycle } from 'core/component/functional/life-cycle';

export * from 'core/component/functional/interface';

//#if runtime has dummyComponents
import('core/component/functional/test/b-functional-dummy');
//#endif
