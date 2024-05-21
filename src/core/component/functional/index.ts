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

export * from 'core/component/functional/context';
export * from 'core/component/functional/interface';

//#if runtime has dummyComponents
import('core/component/functional/test/b-functional-dummy');
import('core/component/functional/test/b-functional-button-dummy');
//#endif
