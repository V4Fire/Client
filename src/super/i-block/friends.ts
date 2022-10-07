/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import * as helpers from 'core/helpers';
import * as browser from 'core/browser';

import Daemons, { DaemonsDict } from 'friends/daemons';
import Analytics from 'friends/analytics';

import DOM from 'friends/dom';
import VDOM from 'friends/vdom';
import Opt from 'super/i-block/modules/opt';

import AsyncRender from 'friends/async-render';
import ModuleLoader from 'friends/module-loader';
import Sync from 'friends/sync';

import Field from 'friends/field';
import Provide from 'friends/provide';
import type Block from 'friends/block';

import Lfc from 'super/i-block/modules/lfc';
import State from 'friends/state';
import Storage from 'friends/storage';

import { component } from 'core/component';
import { system } from 'super/i-block/modules/decorators';

import iBlockProps from 'super/i-block/props';

@component()
export default abstract class iBlockFriends extends iBlockProps {
	/**
	 * A class with methods to provide component classes/styles to another component, etc
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Provide(Object.cast(ctx))
	})

	readonly provide!: Provide;

	/**
	 * A class with helper methods for safely accessing component/object properties
	 *
	 * @example
	 * ```js
	 * this.field.get('foo.bar.bla')
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Field(Object.cast(ctx))
	})

	readonly field!: Field;

	/**
	 * A class to send component analytic events
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Analytics(Object.cast(ctx))
	})

	readonly analytics!: Analytics;

	/**
	 * An API to synchronize fields and props of the component
	 *
	 * @example
	 * ```typescript
	 * @component()
	 * class Foo {
	 *   @prop()
	 *   blaProp: string;
	 *
	 *   @field((ctx) => ctx.sync.link('blaProp'))
	 *   bla: string;
	 * }
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Sync(Object.cast(ctx))
	})

	readonly sync!: Sync;

	/**
	 * A class to render component fragments asynchronously
	 *
	 * @example
	 * ```
	 * < .bla v-for = el in asyncRender.iterate(veryBigList, 10)
	 *   {{ el }}
	 * ```
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new AsyncRender(Object.cast(ctx))
	})

	readonly asyncRender!: AsyncRender;

	/**
	 * A class for low-level working with a component VDOM tree
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new VDOM(Object.cast(ctx))
	})

	readonly vdom!: VDOM;

	/**
	 * A class with helper methods to work with the component life cycle
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Lfc(Object.cast(ctx))
	})

	readonly lfc!: Lfc;

	/**
	 * A dictionary with component daemons
	 */
	static readonly daemons: DaemonsDict = {};

	/**
	 * A class to create daemons associated with a component
	 */
	@system({
		unique: true,
		init: (ctx) => new Daemons(Object.cast(ctx))
	})

	protected readonly daemons!: Daemons;

	/**
	 * A class for persistent storage of component data
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Storage(Object.cast(ctx))
	})

	protected readonly storage!: Storage;

	/**
	 * A class with methods to initialize a component state from various related sources
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new State(Object.cast(ctx))
	})

	protected readonly state!: State;

	/**
	 * A class for low-level working with a component DOM tree.
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new DOM(Object.cast(ctx))
	})

	protected readonly dom!: DOM;

	/**
	 * An API to work with a component in terms of [BEM](https://en.bem.info/methodology/quick-start/)
	 */
	@system({unique: true})
	protected block?: Block;

	/**
	 * A class with helper methods to optimize component rendering
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new Opt(Object.cast(ctx))
	})

	protected readonly opt!: Opt;

	/**
	 * A class to manage dynamically loaded modules
	 */
	@system({
		atom: true,
		unique: true,
		init: (ctx) => new ModuleLoader(Object.cast(ctx))
	})

	protected readonly moduleLoader!: ModuleLoader;

	/**
	 * A dictionary with some helper functions.
	 * These helpers are used to provide additional functionality within the component template.
	 */
	@system({
		atom: true,
		unique: true
	})

	protected readonly h: typeof helpers = helpers;

	/**
	 * An API to determine the current browser name/version.
	 */
	@system({
		atom: true,
		unique: true
	})

	protected readonly browser: typeof browser = browser;

	/**
	 * A link to the `globalThis.l` function
	 */
	@system({
		atom: true,
		unique: true
	})

	protected readonly l: typeof l = globalThis.l;

	/**
	 * A link to the `console` API
	 */
	@system({
		atom: true,
		unique: true,
		init: () => console
	})

	protected readonly console!: Console;

	/**
	 * A link to the `location` API
	 */
	@system({
		atom: true,
		unique: true,
		init: () => location
	})

	protected readonly location!: Location;

	/**
	 * A link to the global object
	 */
	@system({
		atom: true,
		unique: true,
		init: () => globalThis
	})

	protected readonly global!: Window;
}
