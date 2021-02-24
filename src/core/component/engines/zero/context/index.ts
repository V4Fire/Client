/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import { VNodeData } from 'vue';
import { identity } from 'core/functools/helpers';

import config from 'core/component/engines/zero/config';

import { document } from 'core/component/engines/zero/const';
import { warn } from 'core/component/engines/zero/helpers';

import { reservedAttrs } from 'core/component/engines/zero/context/const';
import { KeyCode } from 'core/component/engines/zero/context/interface';

export * from 'core/component/engines/zero/context/const';

export default {
	_o: identity,

	_q: Object.fastCompare.bind(Object),
	_s: Object.fastHash.bind(Object),

	_v(value: string): Text {
		return document.createTextNode(value);
	},

	_e(value: Nullable<string>): Comment {
		return document.createComment(value == null ? '' : value);
	},

	_f(id: string): Function {
		return resolveAsset(this.$options, 'filters', id, true) ?? identity;
	},

	_n(value: string): number | string {
		const n = parseFloat(value);
		return isNaN(n) ? value : n;
	},

	_i(arr: unknown[], value: unknown): number {
		for (let i = 0; i < arr.length; i++) {
			if (this._q(arr[i], value) === true) {
				return i;
			}
		}

		return -1;
	},

	_m(index: number, isInFor: boolean): Node {
		const
			cached = this._staticTrees ?? (this._staticTrees = []);

		let
			tree = cached[index];

		if (tree == null && !isInFor) {
			return tree;
		}

		tree = this.$options.staticRenderFns[index]
			.call(this._renderProxy, null, this);

		cached[index] = tree;
		return tree;
	},

	_l(value: unknown, render: Function): unknown[] {
		let
			res;

		if (Object.isArray(value) || Object.isString(value)) {
			res = new Array(value.length);

			for (let i = 0, l = value.length; i < l; i++) {
				res[i] = render(value[i], i);
			}

		} else if (Object.isNumber(value)) {
			res = new Array(value);

			for (let i = 0; i < value; i++) {
				res[i] = render(i + 1, i);
			}

		} else if (value != null && typeof value === 'object') {
			const keys = Object.keys(value!);
			res = new Array(keys.length);

			for (let i = 0, l = keys.length; i < l; i++) {
				const key = keys[i];
				res[i] = render(value![key], key, i);
			}
		}

		if (res != null) {
			(res)._isVList = true;
		}

		return res;
	},

	_g(data: VNodeData, value?: Dictionary<CanArray<Function>>): VNodeData {
		if (Object.isDictionary(value)) {
			const on = data.on != null ? {...data.on} : {};
			data.on = on;

			// eslint-disable-next-line guard-for-in
			for (const key in value) {
				const
					ours = value[key],
					existing = on[key];

				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				on[key] = existing != null ? Array.concat([], existing, ours) : ours ?? [];
			}

		} else {
			warn('v-on without argument expects an Object value', this);
		}

		return data;
	},

	_k(
		eventKeyCode: string,
		key: KeyCode,
		builtInKeyCode?: Nullable<KeyCode>,
		eventKeyName?: string,
		builtInKeyName?: Nullable<KeyCode>
	): boolean {
		const
			configCodes = config.keyCodes[key],

			// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
			mappedKeyCode = configCodes ?? builtInKeyCode;

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (builtInKeyName != null && eventKeyName != null && configCodes == null) {
			return isKeyNotMatch(builtInKeyName, eventKeyName);
		}

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		if (mappedKeyCode != null) {
			return isKeyNotMatch(mappedKeyCode, eventKeyCode);
		}

		if (eventKeyName != null) {
			return eventKeyName.dasherize() !== key;
		}

		return false;
	},

	_b(data: VNodeData, tag: string, value: unknown, asProp: boolean, isSync: boolean): VNodeData {
		if (value != null && typeof value === 'object') {
			const
				obj = Object.isArray(value) ? Object.assign({}, ...value) : value;

			let hash;
			const loop = (key) => {
				if (key === 'class' || key === 'style' || reservedAttrs[key] === true) {
					hash = data;

				} else {
					hash = asProp ? data.domProps ?? (data.domProps = {}) : data.attrs ?? (data.attrs = {});
				}

				if (!(key in hash)) {
					hash[key] = obj[key];

					if (isSync) {
						const on = data.on ?? (data.on = {});
						on[`update:${key}`] = ($event) => {
							obj[key] = $event;
						};
					}
				}
			};

			// eslint-disable-next-line guard-for-in
			for (const key in obj) {
				loop(key);
			}

		} else {
			warn('v-bind without argument expects an Object or Array value', this);
		}

		return data;
	},

	_t(name: string, fallback: CanArray<Element>, props?: Dictionary, bindObject?: Dictionary): Element[] {
		const
			scopedSlotFn = this.$scopedSlots[name];

		let
			nodes;

		if (scopedSlotFn != null) {
			props = props ?? {};

			if (bindObject) {
				if (typeof bindObject !== 'object') {
					warn('slot v-bind without argument expects an Object', this);
				}

				props = {...bindObject, ...props};
			}

			nodes = scopedSlotFn(props) ?? fallback;

		} else {
			const
				slotNodes = this.$slots[name];

			if (slotNodes != null) {
				slotNodes._rendered = true;
			}

			nodes = slotNodes ?? fallback;
		}

		const
			target = props?.slot;

		if (target != null) {
			return this.$createElement('template', {slot: target}, nodes);
		}

		return nodes;
	},

	_u(
		fns: Array<CanArray<CanUndef<{
			key: string;
			fn: Function;
			proxy?: boolean;
		}>>>,

		res: CanUndef<Dictionary>,
		hasDynamicKeys: boolean,
		contentHashKey?: string
	): Dictionary {
		res = res ?? {$stable: !hasDynamicKeys};

		for (let i = 0; i < fns.length; i++) {
			const
				slot = fns[i];

			if (Array.isArray(slot)) {
				this._u(slot, res, hasDynamicKeys);

			} else if (slot != null) {
				if (slot.proxy) {
					// @ts-ignore (access)
					slot.fn.proxy = true;
				}

				res[slot.key] = slot.fn;
			}
		}

		if (contentHashKey != null) {
			res.$key = contentHashKey;
		}

		return res;
	}
};

function resolveAsset(opts: Dictionary<any>, type: string, id: string, warnMissing: boolean): CanUndef<Function> {
	if (!Object.isString(id)) {
		return;
	}

	const
		assets = opts[type];

	if (assets == null) {
		return;
	}

	if (Object.hasOwnProperty(assets, id)) {
		return assets[id];
	}

	const
		camelizedId = id.camelize(false);

	if (Object.hasOwnProperty(assets, camelizedId)) {
		return assets[camelizedId];
	}

	const
		PascalCaseId = id.camelize();

	if (Object.hasOwnProperty(assets, PascalCaseId)) {
		return assets[PascalCaseId];
	}

	const
		res = assets[id] ?? assets[camelizedId] ?? assets[PascalCaseId];

	if (warnMissing && res == null) {
		warn(`Failed to resolve ${type.slice(0, -1)}: ${id}`, opts);
	}

	return res;
}

function isKeyNotMatch(expect: CanArray<KeyCode>, actual: KeyCode): boolean {
	if (Object.isArray(expect)) {
		return !expect.includes(actual);
	}

	return expect !== actual;
}
