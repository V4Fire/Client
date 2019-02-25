/**
 * Initializes an update from the parent listener
 */
@hook('created')
function initParentCallEvent(): void {
	this.parentEvent.on('callChild', (component: iBlock, {check, action}: ParentMessage) => {
		if (
			check[0] !== 'instanceOf' && check[1] === this[check[0]] ||
			check[0] === 'instanceOf' && this.instance instanceof <Function>check[1]
		) {
			return action.call(this);
		}
	});
}

/**
 * Initializes global event listeners
 */
@hook('created')
function initGlobalEvents(): void {
	const
		{globalEvent: $e} = this;

	const waitNextTick = (fn) => async () => {
		try {
			await this.nextTick({label: $$.reset});
			await fn();

		} catch (err) {
			stderr(err);
		}
	};

	$e.on('reset.load', waitNextTick(this.initLoad));
	$e.on('reset.load.silence', waitNextTick(this.reload));
	$e.on('reset.router', this.resetRouterState);
	$e.on('reset.storage', this.resetStorageState);

	$e.on('reset', waitNextTick(async () => {
		this.componentStatus = 'loading';

		await Promise.all([
			this.resetRouterState(),
			this.resetStorageState()
		]);

		await this.initLoad();
	}));

	$e.on('reset.silence', waitNextTick(async () => {
		await Promise.all([
			this.resetRouterState(),
			this.resetStorageState()
		]);

		await this.reload();
	}));
}

/**
 * Initializes modifiers event listeners
 */
@hook('beforeCreate')
function initModEvents(): void {
	const
		{localEvent: $e} = this;

	$e.on('block.mod.set.**', (e: ModEvent) => {
		const
			k = e.name,
			v = e.value,
			w = <NonNullable<ModsNTable>>this.field.get('watchModsStore');

		this
			.mods[k] = v;

		if (k in w && w[k] !== v) {
			delete w[k];
			this.field.set(`watchModsStore.${k}`, v);
		}

		this.emit(`mod-set-${k}-${v}`, e);
	});

	$e.on('block.mod.remove.**', (e: ModEvent) => {
		if (e.reason === 'removeMod') {
			const
				k = e.name,
				w = <NonNullable<ModsNTable>>this.field.get('watchModsStore');

			this
				.mods[k] = undefined;

			if (k in w && w[k]) {
				delete w[k];
				this.field.set(`watchModsStore.${k}`, undefined);
			}

			this.emit(`mod-remove-${k}-${e.value}`, e);
		}
	});
}

/**
 * Initializes watchers from .watchProp
 */
@hook('beforeDataCreate')
function initRemoteWatchers(): void {
	const
		w = this.meta.watchers,
		o = this.watchProp;

	if (!o) {
		return;
	}

	const normalizeField = (field) => {
		if (customWatcherRgxp.test(field)) {
			return field.replace(customWatcherRgxp, (str, prfx, emitter, event) =>
				`${prfx + ['$parent'].concat(emitter || []).join('.')}:${event}`);
		}

		return `$parent.${field}`;
	};

	for (let keys = Object.keys(o), i = 0; i < keys.length; i++) {
		const
			method = keys[i],
			watchers = (<Array<string | MethodWatcher>>[]).concat(<CanArray<string | MethodWatcher>>o[method] || []);

		for (let i = 0; i < watchers.length; i++) {
			const
				el = watchers[i];

			if (Object.isString(el)) {
				const
					field = normalizeField(el),
					wList = w[field] = w[field] || [];

				wList.push({
					method,
					handler: method
				});

			} else {
				const
					field = normalizeField(el.field),
					wList = w[field] = w[field] || [];

				wList.push({
					...el,
					args: (<unknown[]>[]).concat(el.args || []),
					method,
					handler: method
				});
			}
		}
	}
}
