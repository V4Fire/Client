/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/init/README.md]]
 * @packageDocumentation
 */

export * from 'core/component/init/states';
export * from 'core/component/init/component';
export * from 'core/component/init/interface';

//#if runtime has dummyComponents
import('core/component/init/test/b-deactivation-component');
//#endif
