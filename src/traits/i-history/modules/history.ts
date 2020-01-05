/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock, { ModsDecl } from 'super/i-block/i-block';
import iHistory from 'traits/i-history/i-history';

export interface Content {
	el: Element;
}

export interface Title {
	el: Element | null;
	initBoundingRect: CanUndef<DOMRect>;
}

export interface HistoryItem {
	stage: string;
	options: CanUndef<Dictionary>;
	content?: Content;
	title?: Title;
}

export default class History<T extends iBlock & iHistory> {
	/**
	 * History modifiers
	 */
	static readonly mods: ModsDecl = {
		turning: [
			'in',
			'out'
		],
		history: [
			'true'
		]
	};

	/**
	 * Context for functions
	 */
	protected readonly component: T;

	/**
	 * Transitions stack
	 */
	protected stackStore: HistoryItem[] = [];

	/**
	 * @param component
	 * @param [stage] - initial page stage
	 * @param [options]
	 */
	constructor(component: T, stage: string = 'index', options?: Dictionary) {
		this.component = component;
		this.stackStore.push({stage, options});

		// @ts-ignore (access)
		this.component.meta.hooks.mounted.push({fn: this.onMounted.bind(this)});
	}

	/**
	 * Current stack position
	 */
	get current(): HistoryItem {
		return this.stackStore[this.stackStore.length - 1];
	}

	/**
	 * Pages stack
	 */
	get stack(): ReadonlyArray<HistoryItem> {
		return Object.freeze(this.stackStore);
	}

	/**
	 * Page count at the history
	 */
	get length(): number {
		return this.stackStore.length;
	}

	/**
	 * Adds the component stage to the pages stack
	 *
	 * @param stage
	 * @param [options]
	 * @emits history:transition(page: HistoryItem)
	 */
	push(stage: string, options?: Dictionary): void {
		const
			currentPage = this.current?.content?.el,
			page = this.component.$el.querySelector(`[data-page=${stage}]`);

		if (page) {
			// @ts-ignore (access)
			this.component.block.setElMod(page, 'page', 'turning', 'in');

			// @ts-ignore (access)
			this.component.block.setElMod(currentPage, 'page', 'below', true);
			this.component.setMod('history', true);

			const
				els = this.initPage();

			this.stackStore.push({stage, options, ...els});
			this.component.emit('history:transition', this.current);
		}
	}

	/**
	 * Navigates back through history
	 * @emits history:back(page: HistoryItem)
	 */
	back(): CanUndef<HistoryItem> {
		if (this.stackStore.length === 1) {
			return;
		}

		const
			current = this.stackStore.pop();

		if (current) {
			if (this.stackStore.length === 1) {
				this.component.removeMod('history');
			}

			const
				{$el} = this.component,
				page = $el.querySelector(`[data-page=${current.stage}]`);

			if (page) {
				// @ts-ignore (access)
				this.component.block.removeElMod(page, 'page', 'turning');

				const
					pageBelow = this.stackStore[this.stackStore.length - 1],
					pageBelowEl = $el.querySelector(`[data-page=${pageBelow.stage}]`);

				// @ts-ignore (access)
				this.component.block.removeElMod(pageBelowEl, 'page', 'below');
			}

			this.component.emit('history:back', current);
		}

		return current;
	}

	/**
	 * Initializes dom for the current page
	 */
	protected initPage(): {content: Content; title: Title} | void {
		const
			// @ts-ignore (access)
			$a = this.component.async,
			{stage} = this.current,
			page = this.component.$el.querySelector(`[data-page=${stage}]`);

		if (!page) {
			return;
		}

		this.current.content = {
			el: page
		};

		const
			title = page.querySelector('[data-title]');

		if (title) {
			$a.on(
				title,
				'click',
				this.onTitleClick.bind(this)
			);
		}

		$a.on(
			page,
			'scroll',
			this.onPageScroll.bind(this).throttle(0.05.seconds())
		);

		return {
			content: {
				el: page
			},

			title: {
				el: title,
				initBoundingRect: title?.getBoundingClientRect()
			}
		};
	}

	/**
	 * Handler: on linked component mounted hook
	 */
	protected onMounted(): void {
		const
			els = this.initPage();

		Object.assign(this.current, els);
		this.initTitleInView();
	}

	/**
	 * Handler: click on a page title
	 */
	protected onTitleClick(): void {
		this.scrollToPageTop();
	}

	/**
	 * Scrolls page container to top
	 */
	protected scrollToPageTop(): void {
		if (this.component.pageContainer) {
			this.component.pageContainer.scrollTo({top: 0, left: 0, behavior: 'smooth'});
		}
	}

	/**
	 * Initializes title in view modifiers
	 * @emits history:titleInView(visible: boolean)
	 */
	protected initTitleInView(): void {
		const
			{current} = this,
			titleH = current?.title?.initBoundingRect?.height || 0,
			scrollTop = current.content?.el?.scrollTop || 0,
			visible = titleH - scrollTop > 0;

		this.component.setMod('title-in-viewport', visible);

		// @ts-ignore (access)
		this.component.block.setElMod(current.title.el, 'title', 'in-view', visible);
		this.component.emit('history:titleInView', visible);
	}

	/**
	 * Handler: on scroll inner page
	 */
	protected onPageScroll(): void {
		if (this.current?.title?.el) {
			this.initTitleInView();
		}
	}
}
