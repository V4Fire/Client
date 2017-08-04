'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import VueInterface from './vue';
import { staticComponents } from 'core/component';
import { mixins } from './decorators';
import './vue.directives';

export const
	mods = new WeakMap(),
	PARENT = {};

const whitelist = {
	beforeCreate: true,
	created: true,
	beforeDestroy: true,
	destroyed: true,
	beforeMount: true,
	mounted: true,
	beforeUpdate: true,
	updated: true,
	activated: true,
	deactivated: true,
	render: true,
	staticRenderFns: true,
	template: true,
	data: true,
	directives: true,
	components: true,
	transitions: true,
	filters: true,
	functional: true,
	delimiters: true,
	parent: true,
	extends: true,
	propsData: true,
	provide: true,
	inject: true,
	model: true,
	with: true,
	inheritAttrs: true,
	comments: true
};

const blacklist = {
	selfName: true,
	instance: true,
	...Object.fromArray(Object.getOwnPropertyNames(VueInterface.prototype))
};

export default class BlockConstructor extends VueInterface {
	/**
	 * @param name - component name
	 * @param opts - component options
	 * @param props - component properties
	 * @param fields - component fields
	 * @param parent - parent component constructor
	 */
	constructor({name, opts, props, fields, parent}: {
		name: string,
		opts: Object,
		model: Object,
		props: Object,
		fields: Object,
		parent?: Object
	}) {
		super(...arguments);

		const component = {
			props,
			selfName: name,
			instance: this,
			...opts
		};

		if (opts.functional) {
			component.render = this.render;
			component.props.componentName = {
				type: String,
				default: name
			};

			return component;
		}

		/* eslint-disable consistent-this */

		const
			ctx = this,
			constr = this.constructor;

		/* eslint-enable consistent-this */

		let beforeCreate;
		Object.assign(component, {
			watch: {},
			methods: {},
			mixins: [],
			computed: {},

			// Predefine base properties
			beforeCreate() {
				this.instance = ctx;
				this.componentName = name;
				this.component = component;
				this.parentComponent = component.parentComponent;
				beforeCreate && beforeCreate.call(this);
			},

			data() {
				const
					data = {},
					keys = Object.keys(fields);

				for (let i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						el = fields[key];

					let val = el.initializer;
					this._activeField = el.field;
					val = val === undefined ? el.default : val;
					data[key] = Object.isFunction(val) ? val(this, ctx) : val;
				}

				return data;
			}
		});

		const
			proto = Object.getPrototypeOf(this),
			names = Object.getOwnPropertyNames(proto);

		for (let i = 0; i < names.length; i++) {
			const
				prop = names[i];

			if (blacklist[prop]) {
				continue;
			}

			if (whitelist[prop]) {
				if (prop === 'beforeCreate') {
					beforeCreate = this[prop];

				} else {
					component[prop] = this[prop];
				}

				continue;
			}

			const
				{get, set} = Object.getOwnPropertyDescriptor(proto, prop);

			if (get || set) {
				const
					obj = get || set,
					l = staticComponents.get(parent),
					parentProp = l && l.computed && l.computed[prop];

				if (obj.abstract) {
					continue;
				}

				if (get) {
					const key = `${prop}Getter`;
					component.methods[key] = proto[key] = get;
				}

				if (set) {
					const key = `${prop}Setter`;
					component.methods[key] = proto[key] = set;
				}

				if (obj.cache === false && get || parentProp && parentProp.get.cache === false) {
					continue;
				}

				const
					computed = component.computed[prop] = {get, set};

				if (parentProp) {
					component.computed[prop] = {
						get: computed.get || parentProp.get,
						set: computed.set || parentProp.set
					};

					continue;
				}

				continue;
			}

			const
				val = this[prop];

			if (val && val.abstract) {
				continue;
			}

			if (prop.slice(0, 2) === '$$') {
				component.watch[prop.slice(2)] = {
					deep: Boolean(val.deep),
					immediate: Boolean(val.immediate),
					handler: val
				};

				continue;
			}

			component.methods[prop] = val;
		}

		mixins.set(constr, mixins.get(constr) || {});
		mods.set(constr, mods.get(constr) || {});

		const
			statics = this.constructor;

		/* eslint-disable guard-for-in */

		for (const prop in statics) {

		/* eslint-enable guard-for-in */

			let
				el = statics[prop];

			if (prop[0] === '_') {
				continue;
			}

			if (prop === 'mods') {
				const
					parentMods = mods.get(parent);

				if (parentMods) {
					el = Object.mixin(false, {}, parentMods, el);

					const
						keys = Object.keys(el);

					for (let i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							mod = el[key];

						for (let i = 0; i < mod.length; i++) {
							const
								el = mod[i];

							if (el !== PARENT || !parentMods[key]) {
								continue;
							}

							const
								parent = parentMods[key].slice(),
								keys = Object.keys(el);

							let hasDefault = false;
							for (let i = 0; i < keys.length; i++) {
								if (Object.isArray(el[keys[i]])) {
									hasDefault = true;
									break;
								}
							}

							if (hasDefault) {
								for (let i = 0; i < parent.length; i++) {
									const
										el = parent[i];

									if (Object.isArray(el)) {
										parent[i] = el[0];
										break;
									}
								}
							}

							mod.splice(i, 1, ...parent);
							break;
						}
					}
				}

				mods.set(constr, el);

				const
					map = {},
					keys = Object.keys(el);

				for (let i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						arr = el[key];

					let def;
					if (arr) {
						for (let i = 0; i < arr.length; i++) {
							const
								el = arr[i];

							if (Object.isArray(el)) {
								def = el;
								break;
							}
						}
					}

					map[key] = def ? def[0] : undefined;
				}

				component[prop] = map;
				component[`${prop}Key`] = JSON.stringify(component[prop]);
				continue;
			}

			const
				mx = mixins.get(constr);

			let
				mixin = mx[prop];

			if (mixin && parent && !Object.isFunction(mixin)) {
				const
					parentProp = mixins.get(parent)[prop];

				if (parentProp) {
					if (Object.isArray(parentProp) && Object.isArray(mixin)) {
						mixin = parentProp.union(mixin);

					} else {
						mixin = Object.mixin({deep: true, concatArray: true}, {}, parentProp, mixin);
					}
				}
			}

			mx[prop] = component[prop] = this.constructor[prop] = mixin || el;
		}

		return component;
	}
}
