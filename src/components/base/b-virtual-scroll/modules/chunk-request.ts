/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Friend from 'components/friends/friend';

import type bVirtualScroll from 'components/base/b-virtual-scroll/b-virtual-scroll';
import type ChunkRender from 'components/base/b-virtual-scroll/modules/chunk-render';

import { isAsyncClearError } from 'components/base/b-virtual-scroll/modules/helpers';
import type { RemoteData, DataState, LastLoadedChunk } from 'components/base/b-virtual-scroll/interface';

const
	$$ = symbolGenerator();

export default class ChunkRequest extends Friend {
	/** @inheritDoc */
	declare readonly C: bVirtualScroll;

	/**
	 * Current page
	 */
	page: number = 1;

	/**
	 * Total amount of elements being loaded
	 */
	total: number = 0;

	/**
	 * All loaded data
	 */
	data: unknown[] = [];

	/**
	 * Last loaded data chunk that was processed with `dbConverter`
	 *
	 * @deprecated
	 * {@link ChunkRequest.lastLoadedChunk}
	 */
	lastLoadedData: unknown[] = [];

	/**
	 * Last loaded data chunk
	 */
	lastLoadedChunk: LastLoadedChunk = {
		normalized: [],
		raw: undefined
	};

	/**
	 * True if all requests for additional data has been requested
	 */
	isDone: boolean = false;

	/**
	 * True if the last request returned an empty array or undefined
	 */
	isLastEmpty: boolean = false;

	/**
	 * Contains data that pending to be rendered
	 */
	pendingData: object[] = [];

	/**
	 * A buffer to accumulate data from the main request and all additional requests.
	 * Sometimes a data provider can't provide the whole batch of data in one request,
	 * so you need to emit some extra requests till the data batch is filled.
	 */
	currentAccumulatedData: CanUndef<unknown[]> = undefined;

	/**
	 * Contains `currentAccumulatedData` from previous requests cycle
	 */
	previousDataStore: CanUndef<unknown> = undefined;

	/** {@link ChunkRequest.previousDataStore} */
	get previousData(): CanUndef<unknown> {
		return this.previousDataStore;
	}

	/**
	 * @emits dataChange(v: unknown)
	 * {@link ChunkRequest.previousDataStore}
	 */
	set previousData(v: unknown) {
		this.previousDataStore = v;
		this.ctx.emit('dataChange', v);
	}

	/**
	 * API for scroll rendering
	 */
	protected get chunkRender(): ChunkRender {
		return this.ctx.chunkRender;
	}

	/**
	 * Resets the current state
	 */
	reset(): void {
		this.total = 0;
		this.page = 1;

		this.lastLoadedData = [];
		this.data = [];
		this.lastLoadedChunk = {raw: undefined, normalized: []};
		this.pendingData = [];

		this.isDone = false;
		this.isLastEmpty = false;
		this.currentAccumulatedData = undefined;
		this.previousDataStore = undefined;

		this.async.clearTimeout({label: 'chunkRequest.waitForInitCalls'});
		this.async.cancelRequest({label: $$.request});
	}

	/**
	 * Reloads the last request
	 */
	reloadLast(): void {
		this.isDone = false;
		this.isLastEmpty = false;

		this.chunkRender.setRefVisibility('retry', false);
		this.try().catch(stderr);
	}

	/**
	 * Initializes the request module
	 */
	async init(): Promise<void> {
		await this.async.sleep(15, {label: 'chunkRequest.waitForInitCalls'});

		const
			{chunkSize, dataProvider} = this.ctx;

		this.pendingData = [...this.lastLoadedChunk.normalized];

		if (this.pendingData.length < chunkSize && dataProvider != null && !this.isDone) {
			this.currentAccumulatedData = this.ctx.db?.data;
		}

		await this.try(false);

		if (
			this.ctx.localState !== 'error' &&
			this.pendingData.length === 0 &&
			this.chunkRender.itemsCount === 0 &&
			this.isDone
		) {
			this.chunkRender.setRefVisibility('empty', true);
		}

		this.chunkRender.tryShowRenderNextSlot();

		if (this.previousData === undefined && Array.isArray(this.ctx.db?.data)) {
			this.previousData = this.ctx.db!.data;
		}

		this.ctx.localState = 'ready';
	}

	/**
	 * Tries to request additional data
	 *
	 * @param [initialCall]
	 *
	 * @emits `dbChange(data:` [[RemoteData]]`)`
	 * @emits `chunkLoading(page: number)`
	 */
	try(initialCall: boolean = true): Promise<CanUndef<RemoteData>> {
		const
			{ctx, chunkRender} = this,
			{chunkSize, dataProvider} = ctx;

		const
			resolved = Promise.resolve(undefined);

		const additionParams = {
			lastLoadedChunk: {
				...this.lastLoadedChunk,
				normalized: this.lastLoadedChunk.normalized
			}
		};

		if (this.pendingData.length > 0) {
			if (dataProvider == null) {
				chunkRender.initItems(this.pendingData.splice(0, chunkSize));
				chunkRender.render();

				if (this.pendingData.length === 0) {
					this.emitDone();
				}

				return resolved;
			}

			if (this.pendingData.length >= chunkSize) {
				chunkRender.initItems(this.pendingData.splice(0, chunkSize));
				chunkRender.render();

				if (this.isDone && this.pendingData.length === 0) {
					this.emitDone();
				}

				return resolved;
			}
		}

		const updateCurrentData = () => {
			if (this.currentAccumulatedData != null) {
				this.previousData = this.currentAccumulatedData;
				this.currentAccumulatedData = undefined;
			}
		};

		const shouldRequest = ctx.loadStrategy === 'scroll' ?
			ctx.shouldMakeRequest(ctx.getDataStateSnapshot(additionParams, this, chunkRender)) :
			true;

		if (this.isDone) {
			updateCurrentData();
			this.onRequestsDone();
			return resolved;
		}

		const cantRequest = () => this.isDone ||
			!shouldRequest ||
			ctx.dataProvider == null ||
			ctx.mods.progress === 'true';

		if (cantRequest()) {
			return resolved;
		}

		if (initialCall) {
			this.currentAccumulatedData = undefined;
		}

		chunkRender.setLoadersVisibility(true);
		chunkRender.setRefVisibility('renderNext', false);

		ctx.emit('chunkLoading', this.page);

		return this.load()
			.then((v) => {
				if (Object.size(v?.data) === 0) {
					this.isLastEmpty = true;

					this.shouldStopRequest(this.ctx.getDataStateSnapshot({
						lastLoadedData: [],
						lastLoadedChunk: {
							raw: undefined,
							normalized: []
						}
					}, this, chunkRender));

					chunkRender.setLoadersVisibility(false);
					updateCurrentData();

					return;
				}

				const
					data = (<RemoteData>v).data!;

				this.page++;
				this.isLastEmpty = false;

				this.data = this.data.concat(data);
				this.pendingData = this.pendingData.concat(data);
				this.currentAccumulatedData = Array.toArray(this.currentAccumulatedData, data);

				ctx.emit('dbChange', {...v, data: this.data});
				this.shouldStopRequest(this.ctx.getCurrentDataState());

				if (this.pendingData.length < ctx.chunkSize) {
					return this.try(false);
				}

				this.previousData = this.currentAccumulatedData;
				this.currentAccumulatedData = undefined;

				chunkRender.setLoadersVisibility(false);

				if (!this.isDone) {
					chunkRender.initItems(this.pendingData.splice(0, chunkSize));
					chunkRender.render();
				}

				if (!this.isDone || this.pendingData.length > 0) {
					chunkRender.setRefVisibility('renderNext', true);
				}

			}).catch((err) => {
				if (isAsyncClearError(err)) {
					return;
				}

				stderr(err);
				return undefined;
			});
	}

	/**
	 * Checks for the possibility of stopping data requests
	 * @param params
	 */
	shouldStopRequest(params: DataState): boolean {
		const {ctx} = this;
		this.isDone = ctx.shouldStopRequest(params);

		if (this.isDone) {
			this.onRequestsDone();
		}

		return this.isDone;
	}

	/**
	 * Sets `isDone` to `true` and fires `onRequestDone` handler
	 */
	protected emitDone(): void {
		this.isDone = true;
		this.onRequestsDone();
	}

	/**
	 * Loads additional data
	 * @emits `chunkLoaded(lastLoadedChunk:` [[LastLoadedChunk]]`)`
	 */
	protected load(): Promise<CanUndef<RemoteData>> {
		const {
			ctx,
			chunkRender
		} = this;

		void ctx.setMod('progress', true);

		const
			defaultRequestParams = ctx.dataProvider?.getDefaultRequestParams('get'),
			params = <CanUndef<Dictionary>>(defaultRequestParams ?? [])[0];

		Object.assign(params, ctx.requestQuery?.(ctx.getCurrentDataState())?.get);

		return ctx.async.request(ctx.getData(this.component, params), {label: $$.request})
			.then((data) => {
				this.ctx.localState = 'ready';
				void ctx.removeMod('progress', true);
				this.lastLoadedChunk.raw = data;

				const
					converted = data != null ? ctx.convertDataToDB<RemoteData>(<object>data) : undefined;

				this.lastLoadedChunk.normalized = Object.size(converted?.data) <= 0 ?
					this.lastLoadedChunk.normalized = [] :
					this.lastLoadedChunk.normalized = converted!.data!;

				ctx.emit('chunkLoaded', this.lastLoadedChunk, this.page);
				return converted;
			})

			.catch((err) => {
				void ctx.removeMod('progress', true);

				if (isAsyncClearError(err)) {
					return Promise.reject(err);
				}

				chunkRender.setRefVisibility('retry', true);
				chunkRender.setRefVisibility('renderNext', false);

				this.ctx.onRequestError(err, this.ctx.reloadLast.bind(this.ctx));
				stderr(err);

				this.lastLoadedChunk.raw = [];
				this.lastLoadedChunk.normalized = [];

				return undefined;
			});
	}

	/**
	 * Handler: all requests are done
	 */
	protected onRequestsDone(): void {
		const
			{ctx, chunkRender, async: $a} = this,
			{chunkSize} = ctx;

		if (this.pendingData.length > 0) {
			chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			chunkRender.render();
		}

		if (this.pendingData.length === 0) {
			chunkRender.setRefVisibility('done', true);
			chunkRender.setRefVisibility('renderNext', false);
		}

		$a.wait(() => ctx.localState === 'ready', {label: $$.requestDoneWaitForReady})
			.then(() => {
				if (this.pendingData.length === 0) {
					chunkRender.setRefVisibility('done', true);
				}

				chunkRender.setLoadersVisibility(false);
			})
			.catch(stderr);
	}
}
