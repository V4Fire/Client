/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/friends/field/README.md]]
 * @packageDocumentation
 */

export { default } from 'components/friends/field/class';

export * from 'components/friends/field/api';
export * from 'components/friends/field/interface';

//#if runtime has prelude/test-env
import('components/friends/field/test/b-friends-field-dummy');
//#endif
