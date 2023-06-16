/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/state/README.md]]
 * @packageDocumentation
 */

export { default } from 'components/friends/state/class';

export * from 'components/friends/state/api';
export * from 'components/friends/state/interface';

//#if runtime has prelude/test-env
import('components/friends/state/test/b-friends-state-dummy');
//#endif
