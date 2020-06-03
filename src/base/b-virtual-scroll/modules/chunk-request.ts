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

import { getRequestParams } from 'base/b-virtual-scroll/modules/helpers';
import { RemoteData, RequestMoreParams, LastLoadedChunk } from 'base/b-virtual-scroll/interface';

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
		this.data = [];
		this.lastLoadedChunk = {raw: undefined, normalized: []};
		this.isDone = false;
		this.isLastEmpty = false;
		this.pendingData = [];
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
		const
			{options, chunkSize, dataProvider} = this.ctx;

		this.pendingData = [...options];

		const initChunkRenderer = () => {
			this.chunkRender.initItems(dataProvider ? this.pendingData.splice(0, chunkSize) : this.pendingData);
		};

		if (!dataProvider) {
			this.onRequestsDone();
		}

		if (this.pendingData.length < chunkSize && dataProvider) {
			if (!this.isDone) {
				await this.try();

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

		this.ctx.localState = 'ready';
	}

	/**
	 * Tries to request additional data
	 */
	try(): Promise<CanUndef<RemoteData>> {
		const
			{ctx, chunkRender} = this,
			{chunkSize} = ctx,
			resolved = Promise.resolve(undefined);

		const additionParams = {
			lastLoadedChunk: {
				...this.lastLoadedChunk,
				normalized: this.lastLoadedChunk.normalized.length === 0 ? ctx.options : this.lastLoadedChunk.normalized
			}
		};

		if (this.pendingData.length >= chunkSize) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();
			return resolved;
		}

		const
			shouldRequest = ctx.shouldMakeRequest(getRequestParams(this, chunkRender, additionParams));

		if (this.isDone) {
			this.onRequestsDone();
			return resolved;
		}

		const cantRequest = () =>
			this.isDone ||
			!shouldRequest ||
			!ctx.dataProvider ||
			ctx.mods.progress === 'true';

		if (cantRequest()) {
			return resolved;
		}

		chunkRender.setLoadersVisibility(true);

		return this.load()
			.then((v) => {
				if (!ctx.field.get('data.length', v)) {
					this.isLastEmpty = true;
					this.shouldStopRequest(getRequestParams(this, chunkRender, {lastLoadedData: []}));
					chunkRender.setLoadersVisibility(false);
					return;
				}

				const
					{data} = <RemoteData>v;

				this.page++;
				this.isLastEmpty = false;

				this.data = this.data.concat(data);
				this.lastLoadedChunk.normalized = data;
				this.pendingData = this.pendingData.concat(data);

				this.shouldStopRequest(getRequestParams(this, chunkRender));

				if (this.pendingData.length < ctx.chunkSize) {
					return this.try();
				}

				chunkRender.setLoadersVisibility(false);
				this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
				this.chunkRender.render();

			}).catch((err) => (stderr(err), undefined));
	}

	/**
	 * Checks possibility of another request for data
	 * @param params
	 */
	shouldStopRequest(params: RequestMoreParams): boolean {
		const {ctx} = this;
		this.isDone = ctx.shouldStopRequest(params);

		if (this.isDone) {
			this.onRequestsDone();
		}

		return this.isDone;
	}

	/**
	 * Loads additional data
	 */
	protected load(): Promise<CanUndef<RemoteData>> {
		const {ctx} = this;
		ctx.setMod('progress', true);

		const params = <CanUndef<Dictionary>>(ctx.getDefaultRequestParams('get') || [])[0];
		Object.assign(params, ctx.requestQuery?.(getRequestParams(this, this.chunkRender))?.get);

		return ctx.async.request(ctx.getData(this.component, params), {label: $$.request})
			.then((data) => {
				ctx.removeMod('progress', true);
				this.lastLoadedChunk.raw = data;

				if (!data) {
					this.lastLoadedChunk.normalized = [];
					return;
				}

				const
					converted = ctx.convertDataToDB<CanUndef<RemoteData>>(data);

				if (!converted?.data?.length) {
					this.lastLoadedChunk.normalized = [];
					return;
				}

				return converted;
			})

			.catch((err) => {
				ctx.removeMod('progress', true);
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

		if (this.pendingData.length) {
			this.chunkRender.initItems(this.pendingData.splice(0, chunkSize));
			this.chunkRender.render();

		} else {
			this.chunkRender.setRefVisibility('done', true);
		}

		this.chunkRender.setLoadersVisibility(false);
	}
}
