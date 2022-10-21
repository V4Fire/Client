/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/form/b-icon-button/README.md]]
 * @packageDocumentation
 */

import bButton, { component } from 'components/form/b-button/b-button';

export * from 'components/form/b-button/b-button';

/**
 * Component to create a button based on icon
 */
@component()
export default class bIconButton extends bButton {}
