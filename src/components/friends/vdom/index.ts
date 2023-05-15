/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/vdom/README.md]]
 * @packageDocumentation
 */

export { default } from 'components/friends/vdom/class';

export * from 'components/friends/vdom/api';
export * from 'components/friends/vdom/interface';

//#if runtime has prelude/test-env
import('components/friends/vdom/test/b-friends-vdom-dummy');
//#endif
