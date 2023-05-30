/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/async-render/README.md]]
 * @packageDocumentation
 */

export { default } from 'components/friends/async-render/class';

export * from 'components/friends/async-render/api';

//#if runtime has prelude/test-env
import('components/friends/async-render/test/b-friends-async-render-dummy');
//#endif
