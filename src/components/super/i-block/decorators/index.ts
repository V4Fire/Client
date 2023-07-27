/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/super/i-block/decorators/README.md]]
 * @packageDocumentation
 */

export { hook, computed } from 'core/component/decorators';

export * from 'components/super/i-block/decorators/wrappers';
export * from 'components/super/i-block/decorators/wait';
export * from 'components/super/i-block/decorators/interface';

//#if runtime has dummyComponents
import('components/super/i-block/decorators/test/b-super-i-block-decorators-dummy');
//#endif
