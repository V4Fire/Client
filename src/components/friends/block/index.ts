/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/block/README.md]]
 * @packageDocumentation
 */

export { default } from 'components/friends/block/class';

export * from 'components/friends/block/api';
export * from 'components/friends/block/interface';

//#if runtime has prelude/test-env
import('components/friends/block/test/b-friends-block-dummy');
//#endif
