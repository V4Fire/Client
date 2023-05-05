/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/provide/README.md]]
 * @packageDocumentation
 */

export { default } from 'components/friends/provide/class';

export * from 'components/friends/provide/api';
export * from 'components/friends/provide/interface';

//#if runtime has prelude/test-env
import('components/friends/provide/test/b-friends-provide-dummy');
//#endif
