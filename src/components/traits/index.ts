/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

/**
 * [[include:components/traits/README.md]]
 * @packageDocumentation
 */

import { initEmitter, ComponentDescriptor } from 'core/component';

import { registeredComponent } from 'core/component/decorators';
import { regMethod, MethodType } from 'core/component/decorators/method';

/**
 * Derives the provided traits to a component.
 * The function is used to organize multiple implementing interfaces with the support of default methods.
 *
 * @decorator
 * @param traits
 *
 * @example
 * ```typescript
 * import { derive } from 'components/traits';
 * import iBlock, { component } from 'components/super/i-block/i-block';
 *
 * abstract class iOpen {
 *   /**
 *    * This method has a default implementation.
 *    * The implementation is provided as a static method.
 *    *\/
 *   open(): void {
 *     return Object.throw();
 *   };
 *
 *   /**
 *    * The default implementation for iOpen.open.
 *    * The method takes a context as its first parameter.
 *    *
 *    * @see iOpen['open']
 *    *\/
 *   static open: AddSelf<iOpen['open'], iBlock> = (self) => {
 *     self.setMod('opened', true);
 *   };
 * }
 *
 * abstract class iSize {
 *   abstract sizes(): string[];
 * }
 *
 * interface bExample extends Trait<typeof iFoo>, Trait<typeof iFoo2> {
 *
 * }
 *
 * @component()
 * @derive(iOpen, iSize)
 * class bExample extends iBlock implements iOpen, iSize {
 *   sizes() {
 *     return ['xs', 's', 'm', 'l', 'xl'];
 *   }
 * }
 *
 * console.log(new bExample().open());
 * ```
 */
export function derive(...traits: Function[]) {
	return (target: Function): void => {
		if (registeredComponent.event == null) {
			return;
		}

		initEmitter.once(registeredComponent.event, ({meta}: ComponentDescriptor) => {
			const proto = target.prototype;

			for (let i = 0; i < traits.length; i++) {
				const
					originalTrait = traits[i],
					chain = getTraitChain(originalTrait);

				for (let i = 0; i < chain.length; i++) {
					const [trait, keys] = chain[i];

					for (let i = 0; i < keys.length; i++) {
						const
							key = keys[i],
							defMethod = Object.getOwnPropertyDescriptor(trait, key),
							traitMethod = Object.getOwnPropertyDescriptor(trait.prototype, key);

						const canDerive =
							defMethod != null &&
							traitMethod != null &&
							!(key in proto) &&

							Object.isFunction(defMethod.value) && (
								Object.isFunction(traitMethod.value) ||

								// eslint-disable-next-line @v4fire/unbound-method
								Object.isFunction(traitMethod.get) || Object.isFunction(traitMethod.set)
							);

						if (canDerive) {
							let type: MethodType;

							const newDescriptor: PropertyDescriptor = {
								enumerable: false,
								configurable: true
							};

							if (Object.isFunction(traitMethod.value)) {
								Object.assign(newDescriptor, {
									writable: true,

									// eslint-disable-next-line func-name-matching
									value: function defaultMethod(...args: unknown[]) {
										return originalTrait[key](this, ...args);
									}
								});

								type = 'method';

							} else {
								Object.assign(newDescriptor, {
									get() {
										return originalTrait[key](this);
									},

									set(value: unknown) {
										originalTrait[key](this, value);
									}
								});

								type = 'accessor';
							}

							Object.defineProperty(proto, key, newDescriptor);
							regMethod(key, type, meta, proto);
						}
					}
				}
			}

			function getTraitChain<T extends Array<[Function, string[]]>>(
				trait: Nullable<object>,
				methods: T = Object.cast([])
			): T {
				if (!Object.isFunction(trait) || trait === Function.prototype) {
					return methods;
				}

				methods.push([trait, Object.getOwnPropertyNames(trait)]);
				return getTraitChain(Object.getPrototypeOf(trait), methods);
			}
		});
	};
}
