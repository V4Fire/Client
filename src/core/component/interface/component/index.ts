/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export * from 'core/component/interface/component/types';
export * from 'core/component/interface/component/component';
export * from 'core/component/interface/component/unsafe';

//#if runtime has dummyComponents
import('core/component/interface/component/test/b-component-interface-dummy');
//#endif
