/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:core/component/decorators/prop/README.md]]
 * @packageDocumentation
 */

//#if runtime has dummyComponents
import('core/component/decorators/prop/test/b-effect-prop-wrapper-dummy');
import('core/component/decorators/prop/test/b-effect-prop-dummy');
import('core/component/decorators/prop/test/b-non-effect-prop-dummy');
//#endif

export * from 'core/component/decorators/prop/decorator';
export * from 'core/component/decorators/prop/interface';
