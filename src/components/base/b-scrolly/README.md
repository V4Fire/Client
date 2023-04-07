## TODO:

1. Бенчмарк подходов

## Идеи

1. При скролле брать оффсет скролла и бинарным поиском искать элементы которые сейчас на экране должны быть и отображать их

```typescript
		const vdomCreate: typeof this['vdom']['create'] = this.vdom.create.bind(this.vdom);
		const self = this;

		setNodes.forEach((node) => node.remove());

		if (!vueInstance) {
			vueInstance = new Vue({
				render: function () {
					const nodes = getArray(count).map((data: DummyUser) => vdomCreate('b-dummy-user', {
						attrs: {
							dummyData: data,
							key: data.userId,
						}
					}));

					// const nodes = vdomCreate('keep-alive', {
					// 	attrs: {},
					// 	children: {
					// 		default: () => getArray(count).map((data) => ({
					// 			type: 'b-dummy-user',
					// 			attrs: {
					// 				dummyData: data,
					// 				key: data.userId,
					// 			}
					// 		}))
					// 	}
					// })

					return nodes;
				},

				beforeCreate() {
					let parent = self;
					if (parent != null) {
						const
							root = Object.create(parent.$root);

						Object.defineProperty(root, '$remoteParent', {
							configurable: true,
							enumerable: true,
							writable: true,
							value: parent
						});

						Object.defineProperty(this, 'unsafe', {
							configurable: true,
							enumerable: true,
							writable: true,
							value: root
						});
					}
				}
			});

			const
				container = document.createElement('div');

			mountResult = vueInstance.mount(container);

			const
				el = this.block?.element('container');
				el?.append(container);

		} else {
			mountResult.$forceUpdate();
		}

		debugger;

		this.nextTick(() => {
			Array.from(document.querySelectorAll('.b-dummy-user')).forEach((el) => {
				if (setNodes.has(el)) {
					return;
				}

				setNodes.add(el);
				el.component._forkDestroy = el.component.$destroy;

				Object.defineProperty(el.component, '$destroy', {
					configurable: true,
					enumerable: false,
					writable: true,
					value: () => {
						debugger;
						return false;
					}
				});

			});
		});

		console.log(setNodes);
```