/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

export * from 'core/component/render/helpers/normalizers';
export * from 'core/component/render/helpers/props';
export * from 'core/component/render/helpers/attrs';
export * from 'core/component/render/helpers/flags';

//#if runtime has dummyComponents
import('core/component/render/helpers/test/b-component-render-flags-dummy');
//#endif
