/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import type iBlock from 'components/super/i-block/i-block';

import type {

	Control,
	ControlEvent,

	ControlActionHandler,
	ControlActionArgsMap

} from 'components/traits/i-control-list/interface';

//#if runtime has dummyComponents
import('components/traits/i-control-list/test/b-traits-i-control-list-dummy');
//#endif

export * from 'components/traits/i-control-list/interface';

export default abstract class iControlList {
	/**
	 * @throws {TypeError} if the action handler is not provided
	 * {@link iControlList.prototype.callControlAction}
	 */
	static callControlAction: AddSelf<iControlList['callControlAction'], iBlock> = (component, opts = {}, ...args) => {
		const
			{action, analytics} = opts;

		if (analytics != null) {
			component.analytics.send(...analytics);
		}

		if (action != null) {
			if (Object.isString(action)) {
				const
					fn = component.field.get<CanPromise<Function>>(action);

				if (fn != null) {
					if (Object.isPromise(fn)) {
						return fn.then((fn) => {
							if (!Object.isFunction(fn)) {
								throw new TypeError(`The action handler "${action}" is not a function`);
							}

							return fn.call(component);
						});
					}

					return fn.call(component);
				}

				throw new TypeError(`The action handler "${action}" is not a function`);
			}

			if (Object.isSimpleFunction(action)) {
				return action.call(component);
			}

			const fullArgs = Array.toArray(action.defArgs ? args : null, action.args);

			const
				{handler, argsMap} = action,
				{field} = component;

			let
				argsMapFn: Nullable<CanPromise<ControlActionArgsMap>>,
				handlerFn: Nullable<CanPromise<ControlActionHandler>>;

			if (Object.isFunction(argsMap)) {
				argsMapFn = argsMap;

			} else {
				argsMapFn = argsMap != null ? field.get(argsMap) : null;
			}

			if (Object.isFunction(handler)) {
				handlerFn = handler;

			} else if (Object.isString(handler)) {
				handlerFn = field.get(handler);
			}

			const callHandler = (methodFn: ControlActionHandler, argsMapFn: Nullable<ControlActionArgsMap>) => {
				const args = argsMapFn != null ? argsMapFn.call(component, fullArgs) ?? [] : fullArgs;
				return methodFn.call(component, ...args);
			};

			if (handlerFn != null) {
				if (Object.isPromise(handlerFn)) {
					return handlerFn.then((methodFn) => {
						if (!Object.isFunction(methodFn)) {
							throw new TypeError('The action handler is not a function');
						}

						if (Object.isPromise(argsMapFn)) {
							return argsMapFn.then((argsMapFn) => callHandler(methodFn, argsMapFn));
						}

						return callHandler(methodFn, argsMapFn);
					});
				}

				if (Object.isPromise(argsMapFn)) {
					return argsMapFn
						.then((argsMapFn) => callHandler(Object.cast(handlerFn), argsMapFn));
				}

				return callHandler(handlerFn, argsMapFn);
			}

			throw new TypeError('The action handler is not a function');
		}
	};

	/**
	 * Returns the listening event name for the specified control
	 * @param opts - the control options
	 */
	abstract getControlEvent(opts: Control): string;

	/**
	 * Calls an event handler for the specified control
	 *
	 * @param [_opts] - the control options
	 * @param [_args] - additional arguments
	 */
	callControlAction<R = unknown>(_opts?: ControlEvent, ..._args: unknown[]): CanPromise<CanUndef<R>> {
		return Object.throw();
	}
}
