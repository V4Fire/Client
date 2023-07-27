/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/sync/README.md]]
 * @packageDocumentation
 */

export { default } from 'components/friends/sync/class';

export * from 'components/friends/sync/api';
export * from 'components/friends/sync/interface';

//#if runtime has dummyComponents
import('components/friends/sync/test/b-friends-sync-dummy');
//#endif
