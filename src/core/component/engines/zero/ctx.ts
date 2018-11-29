/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { ComponentDriver } from 'core/component/engines';

export const reservedAttrs = {
	'is': true,
	'key': true,
	'ref': true,
	'slot': true,
	'slot-scope': true
};

export default {
	_o: (v) => v,
	_q: Object.fastCompare,
	_s: (v) => v == null ? '' : String(v),
	_v: (v) => document.createTextNode(v),
	_e: (v) => document.createComment(v === undefined ? '' : v),

	_f(id: string): Function {
		return resolveAsset(this.$options, 'filters', id) || Any;
	},

	_n: (v) => {
		const n = parseFloat(v);
		return isNaN(n) ? v : n;
	},

	_i: (arr, val) => {
		for (let i = 0; i < arr.length; i++) {
			if (Object.fastCompare(arr[i], val)) {
				return i;
			}
		}

		return -1;
	},

	_m(index: number, isInFor: boolean): Node {
		const
			cached = this._staticTrees || (this._staticTrees = []);

		let
			tree = cached[index];

		if (tree && !isInFor) {
			return tree;
		}

		tree = cached[index] = this.$options.staticRenderFns[index]
			.call(this._renderProxy, null, this);

		return tree;
	},

	_l: (v, render) => {
		let
			res;

		if (Object.isArray(v) || Object.isString(v)) {
			res = new Array(v.length);

			for (let i = 0, l = v.length; i < l; i++) {
				res[i] = render(v[i], i);
			}

		} else if (Object.isNumber(v)) {
			res = new Array(v);

			for (let i = 0; i < v; i++) {
				res[i] = render(i + 1, i);
			}

		} else if (v && typeof v === 'object') {
			const keys = Object.keys(v);
			res = new Array(keys.length);

			for (let i = 0, l = keys.length; i < l; i++) {
				const key = keys[i];
				res[i] = render(v[key], key, i);
			}
		}

		if (res != null) {
			(res)._isVList = true;
		}

		return res;
	},

	_g: (data, val) => {
		if (Object.isObject(val)) {
			const
				on = data.on = data.on ? {...data.on} : {};

			for (const key in val) {
				const
					ours = val[key],
					existing = on[key];

				on[key] = existing ? [].concat(existing, ours) : ours;
			}
		}

		return data;
	},

	_k: (eventKeyCode, key, builtInKeyCode, eventKeyName, builtInKeyName) => {
		const
			config = ComponentDriver.config,
			mappedKeyCode = config.keyCodes[key] || builtInKeyCode;

		if (builtInKeyName && eventKeyName && !config.keyCodes[key]) {
			return isKeyNotMatch(builtInKeyName, eventKeyName);
		}

		if (mappedKeyCode) {
			return isKeyNotMatch(mappedKeyCode, eventKeyCode);
		}

		if (eventKeyName) {
			return eventKeyName.dasherize() !== key;
		}
	},

	_b: (data, tag, val, asProp, isSync) => {
		if (val && typeof val === 'object') {
			if (Object.isArray(val)) {
				val = Object.assign({}, ...val);
			}

			let hash;
			const loop = (key) => {
				// tslint:disable-next-line:prefer-conditional-expression
				if (key === 'class' || key === 'style' || reservedAttrs[key]) {
					hash = data;

				} else {
					hash = asProp ? data.domProps || (data.domProps = {}) : data.attrs || (data.attrs = {});
				}

				if (!(key in hash)) {
					hash[key] = val[key];

					if (isSync) {
						const on = data.on || (data.on = {});
						on[`update:${key}`] = ($event) => {
							val[key] = $event;
						};
					}
				}
			};

			for (const key in val) {
				loop(key);
			}
		}

		return data;
	},

	_t(name: string, fallback: CanArray<Element>, props?: Dictionary, bindObject?: Dictionary): Element[] {
		const
			scopedSlotFn = this.$scopedSlots[name];

		let
			nodes;

		if (scopedSlotFn) {
			props = props || {};

			if (bindObject) {
				props = {...bindObject, ...props};
			}

			nodes = scopedSlotFn(props) || fallback;

		} else {
			const
				slotNodes = this.$slots[name];

			if (slotNodes) {
				slotNodes._rendered = true;
			}

			nodes = slotNodes || fallback;
		}

		const
			target = props && props.slot;

		if (target) {
			return this.$createElement('template', {slot: target}, nodes);
		}

		return nodes;
	},

	_u: (fns, res) => {
		res = res || {};
		for (let i = 0; i < fns.length; i++) {
			if (Array.isArray(fns[i])) {
				this._u(fns[i], res);

			} else {
				res[fns[i].key] = fns[i].fn;
			}
		}

		return res;
	}
};

const
	hasOwnProperty = Object.prototype.hasOwnProperty;

function resolveAsset(options: Dictionary<any>, type: string, id: string): CanUndef<Function> {
	if (Object.isString(id)) {
		return;
	}

	const
		assets = options[type];

	if (!assets) {
		return;
	}

	if (hasOwnProperty.call(assets, id)) {
		return assets[id];
	}

	const
		camelizedId = (<string>id).camelize(false);

	if (hasOwnProperty.call(assets, camelizedId)) {
		return assets[camelizedId];
	}

	const
		PascalCaseId = (<string>id).camelize();

	if (hasOwnProperty.call(assets, PascalCaseId)) {
		return assets[PascalCaseId];
	}

	return assets[id] || assets[camelizedId] || assets[PascalCaseId];
}

function isKeyNotMatch(expect: CanArray<string>, actual: string): boolean {
	if (Object.isArray(expect)) {
		return !expect.includes(actual);
	}

	return expect !== actual;
}
