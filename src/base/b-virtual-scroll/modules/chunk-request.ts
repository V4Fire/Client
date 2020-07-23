/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import symbolGenerator from 'core/symbol';
import Friend from 'super/i-block/modules/friend';

import bVirtualScroll from 'base/b-virtual-scroll/b-virtual-scroll';
import ChunkRender from 'base/b-virtual-scroll/modules/chunk-render';

import { RemoteData, DataState, LastLoadedChunk } from 'base/b-virtual-scroll/interface';

export const
	$$ = symbolGenerator();

export default class ChunkRequest extends Friend {
	/* @override */
	readonly C!: bVirtualScroll;

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
	 * Last uploaded chunk of data that was processed with `dbConverter`
	 *
	 * @deprecated
	 * @see [[ScrollRequest.lastLoadedChunk]]
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
	 * True if all requests for additional data was requested
	 */
	isDone: boolean = false;

	/**
	 * True if the last request returned an empty array or undefined
	 */
	isLastEmpty: boolean = false;

	/**
	 * Contains data that pending to be rendered
	 */
	pendingData: unknown[] = [];

	/**
	 * The object contains data from the main request and from all additional requests.
	 * Sometimes a data provider can't provide the whole batch of data in one request,
	 * so you need to emit some extra requests till the data batch is filled.
	 */
	currentAccumulatedData: CanUndef<unknown[]> = undefined;

	/**
	 * Contains `currentAccumulatedData` from previous requests cycle
	 */
	previousDataStore: CanUndef<unknown> = undefined;

	/** @see [[ChunkRequest.prototype.previousDataStore]] */
	get previousData(): CanUndef<unknown> {
		return this.previousDataStore;
	}

	/**
	 * @emits dataChange(v: unknown)
	 * @see [[ChunkRequest.prototype.previousDataStore]]
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

		// tslint:disable-next-line: deprecation
		this.lastLoadedData = [];
		this.data = [];
		this.lastLoadedChunk = {raw: undefined, normalized: []};
		this.pendingData = [];

		this.isDone = false;
		this.isLastEmpty = false;
		this.currentAccumulatedData = undefined;
		this.previousDataStore = undefined;

		this.async.clearTimeout({label: $$.waitForInitCalls});
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
		await this.async.sleep(50, {label: $$.waitForInitCalls});

		const
			{chunkSize, dataProvider} = this.ctx;

		this.pendingData = [...this.lastLoadedChunk.normalized];

		const initChunkRenderer = () => {
			this.chunkRender.initItems(
				Object.isString(dataProvider) ?
					this.pendingData.splice(0, chunkSize) :
					this.pendingData.splice(0, this.pendingData.length)
			);
		};

		if (dataProvider == null) {
			this.onRequestsDone();
		}

		if (this.pendingData.length < chunkSize && dataProvider != null) {
			if (!this.isDone) {
				this.currentAccumulatedData = this.ctx.db?.data;
				await this.try(false);

			} else {
				initChunkRenderer();
			}

		} else {
			initChunkRenderer();
		}

		if (
			this.ctx.localState !== 'error' &&
			this.pendingData.length === 0 &&
			this.chunkRender.itemsCount === 0 &&
			this.isDone
		) {
			this.chunkRender.setRefVisibility('empty', true);
		}

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
	 * @emits dbChange(data: RemoteData)
	 * @emits chunkLoading(page: number)
	 */
	try(initialCall: boolean = true): Promise<CanUndef<RemoteData>> {
		const
			{ctx, chunkRender} = this,
			{chunkSize} = ctx,
			resolved = Promise.resolve(undefined);

		const additionParams = {
			lastLoadedChunk: {
				...this.lastLoadedChunk,
				normalized: this.lastLoadedChunk.normalized
			}
		};

		if (this.pendingData.length >= chunkSize) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();
			return resolved;
		}

		const updateCurrentData = () => {
			if (this.currentAccumulatedData != null) {
				this.previousData = this.currentAccumulatedData;
				this.currentAccumulatedData = undefined;
			}
		};

		const
			shouldRequest = ctx.shouldMakeRequest(this.ctx.getDataStateSnapshot(additionParams, this, chunkRender));

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
		this.ctx.emit('chunkLoading', this.page);

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
				this.currentAccumulatedData = Array.concat(this.currentAccumulatedData ?? [], data);

				this.ctx.emit('dbChange', {...v, data: this.data});
				this.shouldStopRequest(this.ctx.getCurrentDataState());

				if (this.pendingData.length < ctx.chunkSize) {
					return this.try(false);
				}

				this.previousData = this.currentAccumulatedData;
				this.currentAccumulatedData = undefined;

				chunkRender.setLoadersVisibility(false);
				this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
				this.chunkRender.render();

			}).catch((err) => {
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
	 * Loads additional data
	 * @emits chunkLoaded(lastLoadedChunk: LastLoadedChunk)
	 */
	protected load(): Promise<CanUndef<RemoteData>> {
		const
			{ctx} = this;

		void ctx.setMod('progress', true);

		const
			defaultRequestParams = ctx.getDefaultRequestParams('get'),
			params = <CanUndef<Dictionary>>(defaultRequestParams !== false ? defaultRequestParams : [])[0];

		Object.assign(params, ctx.requestQuery?.(this.ctx.getCurrentDataState())?.get);

		return ctx.async.request(ctx.getData(this.component, params), {label: $$.request})
			.then((data) => {
				void ctx.removeMod('progress', true);
				this.lastLoadedChunk.raw = data;

				const
					converted = data != null ? ctx.convertDataToDB<RemoteData>(data) : undefined;

				this.lastLoadedChunk.normalized = Object.size(converted?.data) < 0 ?
					this.lastLoadedChunk.normalized = [] :
					this.lastLoadedChunk.normalized = converted!.data!;

				this.ctx.emit('chunkLoaded', this.lastLoadedChunk);
				return converted;
			})

			.catch((err) => {
				void ctx.removeMod('progress', true);
				this.chunkRender.setRefVisibility('retry', true);
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
			{chunkSize} = this.ctx;

		if (this.pendingData.length > 0) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();

		} else {
			this.chunkRender.setRefVisibility('done', true);
		}

		this.async.wait(() => this.ctx.localState === 'ready', {label: $$.requestDoneWaitForReady})
			.then(() => {
				if (this.pendingData.length === 0) {
					this.chunkRender.setRefVisibility('done', true);
				}

				this.chunkRender.setLoadersVisibility(false);
			})
			.catch(stderr);
	}
}
