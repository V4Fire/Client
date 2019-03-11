/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';

import { ComponentInterface } from 'core/component/interface';
import { VNode } from 'core/component/engines';
import { constructors, components } from 'core/component/const';
import {

	NULL,
	initDataObject,
	initPropsObject,
	addEventAPI,
	addMethodsFromMeta,
	addElAccessor,
	getNormalParent

} from 'core/component/create/helpers';

const
	$$ = symbolGenerator();

const defProp = {
	configurable: true,
	enumerable: true,
	writable: true,
	value: undefined
};

const defField = {
	...defProp,
	value: NULL
};

/**
 * Builds a composite virtual tree
 *
 * @param vnode
 * @param ctx - component context
 */
export function buildComposite(vnode: VNode, ctx: ComponentInterface): void {
	// @ts-ignore
	if (!ctx.$compositeI) {
		return;
	}

	const search = (vnode, parent?, pos?) => {
		const
			vData = vnode.data,
			attrs = vData && vData.attrs || {},
			composite = attrs['v4-composite'];

		if (parent && composite) {
			const
				vCtx = vnode.context,
				constr = constructors[composite],
				meta = constr && components.get(constr);

			if (constr && meta) {
				const
					nodeAttrs = vnode.data && vnode.data.attrs,
					propsObj = meta.component.props;

				const
					attrs = {},
					props = {};

				for (let keys = Object.keys(propsObj), i = 0; i < keys.length; i++) {
					props[keys[i]] = undefined;
				}

				if (nodeAttrs) {
					for (let keys = Object.keys(nodeAttrs), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							prop = key.camelize(false),
							val = nodeAttrs[key];

						if (propsObj[prop]) {
							props[prop] = val;
							delete nodeAttrs[key];

						} else {
							attrs[key] = val;
						}
					}
				}

				const
					proto = constr.prototype,
					tpl = TPLS[composite] || proto.render;

				const fakeCtx = Object.assign(Object.create(ctx), {
					meta,
					hook: 'beforeDataCreate',
					componentStatusStore: 'unloaded',
					instance: meta.instance,
					componentName: meta.componentName,
					$isFlyweight: true,
					$compositeI: 0
				});

				addEventAPI(fakeCtx);
				addElAccessor($$.el, fakeCtx);

				Object.defineProperty(fakeCtx, '$props', {value: {}});
				Object.defineProperty(fakeCtx, '$data', {value: {}});
				Object.defineProperty(fakeCtx, '$$data', {writable: true, value: fakeCtx.$data});
				Object.defineProperty(fakeCtx, '$attrs', {value: attrs});
				Object.defineProperty(fakeCtx, '$slots', {value: {default: vnode.children, ...vCtx.$slots}});
				Object.defineProperty(fakeCtx, '$scopedSlots', {value: {...vData && vData.scopedSlots}});
				Object.defineProperty(fakeCtx, '$parent', {value: ctx});
				Object.defineProperty(fakeCtx, '$normalParent', {value: getNormalParent(fakeCtx)});
				Object.defineProperty(fakeCtx, '$children', {value: vnode.children});

				for (let keys = Object.keys(props), i = 0; i < keys.length; i++) {
					const
						key = keys[i],
						value = props[key];

					Object.defineProperty(fakeCtx, key, value !== undefined ? {...defProp, value} : defProp);
					fakeCtx.$props[key] = value;
				}

				const
					{systemFields, fields} = meta;

				for (let list = [systemFields, fields], i = 0; i < list.length; i++) {
					const
						fields = list[i];

					for (let keys = Object.keys(fields), i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							val = fields[key];

						if (val && (val.replace !== true && (val.unique || val.src === meta.componentName) || val.replace === false)) {
							Object.defineProperty(fakeCtx, key, defField);
						}
					}
				}

				addMethodsFromMeta(meta, fakeCtx, true);
				initPropsObject(propsObj, fakeCtx, meta.instance, fakeCtx, true);
				initDataObject(systemFields, fakeCtx, meta.instance, fakeCtx);
				initDataObject(fields, fakeCtx, meta.instance, fakeCtx);

				fakeCtx.$$data = fakeCtx;
				fakeCtx.hook = 'created';
				fakeCtx.componentStatus = 'ready';

				const
					newVNode = fakeCtx.vdom.execRenderObject(tpl.index(), [fakeCtx]),
					newVData = newVNode.data = newVNode.data || {};

				if (fakeCtx.$compositeI) {
					buildComposite(newVNode, fakeCtx);
					fakeCtx.$compositeI = 0;
				}

				if (vData.on) {
					for (let o = vData.on, keys = Object.keys(o), i = 0; i < keys.length; i++) {
						const key = keys[i];
						fakeCtx.on(key, o[key]);
					}
				}

				if (vData.nativeOn) {
					const
						on = newVData.on = newVData.on || {};

					for (let o = vData.nativeOn, keys = Object.keys(o), i = 0; i < keys.length; i++) {
						const key = keys[i];
						on[key] = o[key];
					}
				}

				if (vData.staticClass) {
					newVData.staticClass = [].concat(newVData.staticClass || [], vData.staticClass).join(' ');
				}

				if (vData.class) {
					newVData.class = [].concat(newVData.class || [], vData.class);
				}

				newVData.directives = vData.directives;
				parent.children[pos] = newVNode;
			}

			// @ts-ignore
			if (!--ctx.$compositeI) {
				return;
			}
		}

		const
			{children} = vnode;

		if (children) {
			for (let i = 0; i < children.length; i++) {
				search(children[i], vnode, i);

				// @ts-ignore
				if (!ctx.$compositeI) {
					return;
				}
			}
		}
	};

	search(vnode);
}
