/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/render/README.md]]
 * @packageDocumentation
 */

export * from 'core/component/render/wrappers';
export * from 'core/component/render/helpers';

//#if runtime has dummyComponents
import('core/component/render/test/b-reactive-wrapper-dummy');
import('core/component/render/test/b-reactive-prop-dummy');
import('core/component/render/test/b-reactive-prop-disable-dummy');
//#endif
