/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

import iBlock from 'super/i-block/i-block';
import Block from 'super/i-block/modules/block';

import symbolGenerator from 'core/symbol';
import Async from 'core/async';

export type StyleValue = string | number;
export type StyleDictionary = Dictionary<StyleValue>;
export type TransitionMode = 'sequence' | 'parallel';
export type VisibilityMode = 'visible' | 'hidden';

export const NON_ANIMATED_PROPERTIES = {
	transition: true,
	display: true,
	pointerEvents: true
};

export const
	$$ = symbolGenerator();

export const
	CONTROLLER_GROUP = '[[TRANSITION_CONTROLLER]]',
	TRANSITION_GROUP = '[[TRANSITION]]';

export enum TRANSITION_STATES {
	initial = 0,
	run = 1,
	end = 2
}

export interface TransitionCtx {
	ctx: iBlock;
	label: Label;
	transition: Transition;
}

export interface TransitionInfo {
	state: TRANSITION_STATES;
	props: StyleDictionary;
	node: HTMLElement;
	duration?: number;
	delay?: number;
	promise?: Promise<unknown>;
	resolver(res: Function, rej: Function): unknown;
}

export interface TransitionParams {
	node: HTMLElement;
	props: StyleDictionary;
	duration?: number;
	delay?: number;
}

export interface TransitionReverseOptions {
	onDone?: boolean;
	then?: boolean;
}

export interface TransitionCreateParams {
	useGPU?: boolean;
}

export type TransitionDirection = 'forward' | 'revers';
export type Target = HTMLElement | string;
export type NonAnimatedProperties = typeof NON_ANIMATED_PROPERTIES;

/**
 * @see https://github.com/microsoft/TypeScript/issues/1863
 */
export type Label = any;

export interface AbstractTransitionController {
	sequence(label: Label): Transition;
	parallel(label: Label): Transition;
	reverse(label: Label): CanUndef<Transition>;

	stop(label: Label): void;
	stopAll(): void;

	kill(label: Label): void;
	killAll(): void;
}

export class Transition {
	/**
	 * Transition label
	 */
	protected label: Label;

	/**
	 * Link to component
	 */
	protected component: iBlock;

	/**
	 * Transition mode
	 */
	protected mode: TransitionMode;

	/**
	 * Transition direction
	 */
	protected direction: TransitionDirection;

	/**
	 * Transition params
	 */
	protected params: TransitionCreateParams;

	/**
	 * Stack of transitions
	 */
	protected stack: TransitionInfo[] = [];

	/**
	 * List of subscribers
	 */
	protected subscribers: Function[] = [];

	/**
	 * State of transition
	 */
	protected state: TRANSITION_STATES;

	/**
	 * Link to current transition
	 */
	protected current: CanUndef<TransitionInfo>;

	/**
	 * Resolver
	 */
	protected resolver: CanUndef<Function>;

	/**
	 * Link to component async module
	 */
	protected get async(): Async {
		// @ts-ignore
		return this.component.async;
	}

	/**
	 * Link to component block module
	 */
	protected get block(): Block {
		// @ts-ignore
		return this.component.block;
	}

	/**
	 * True, if transitions finished
	 */
	get isFulfilled(): boolean {
		return this.stack.every((info) => info.state === TRANSITION_STATES.end);
	}

	/**
	 * Next transition
	 */
	get next(): CanUndef<TransitionInfo> {
		const
			{stack} = this;

		for (let i = 0; i < stack.length; i++) {
			const
				transition = stack[i];

			if (transition.state === TRANSITION_STATES.initial) {
				return transition;
			}
		}
	}

	/**
	 * Property for visible elements
	 */
	get visibleProps(): StyleDictionary {
		return {
			visibility: 'visible',
			pointerEvents: 'auto'
		};
	}

	/**
	 * Property for hidden elements
	 */
	get hiddenProps(): StyleDictionary {
		return {
			visibility: 'hidden',
			pointerEvents: 'none'
		};
	}

	/**
	 * @param ctx
	 * @param label
	 * @param mode
	 */
	constructor(component: iBlock, label: Label, mode: TransitionMode, params: TransitionCreateParams = {}) {
		this.state = TRANSITION_STATES.initial;
		this.component = component;
		this.direction = 'forward';
		this.label = label;
		this.mode = mode;
		this.params  = params;
	}

	/**
	 * Runs a transition
	 *
	 * @param el
	 * @param props
	 * @param duration - transition time in seconds
	 * @param [delay] - delay before transition start in seconds
	 */
	run(el: Target, props: StyleDictionary, duration: number, delay?: number): Transition {
		const
			{async: $a} = this,
			node = this.getNode(el);

		if (!node) {
			return this;
		}

		const
			nonAnimatedProperties = Object.select(props, NON_ANIMATED_PROPERTIES),
			animatedProperties = Object.reject(props, NON_ANIMATED_PROPERTIES),

			uniqId = Math.random(),
			keys = Object.keys(animatedProperties);

		const resolver = (resolve) => {
			let doneCounter = 0;
			Object.assign(node.style, nonAnimatedProperties);

			new Promise((res, rej) => {
				$a.requestAnimationFrame(res, {group: TRANSITION_GROUP});

			}).then(() => {
				$a.on(node, 'transitionend', (e: TransitionEvent) => {
					if (e.target !== node || !animatedProperties[e.propertyName]) {
						return;
					}

					if (doneCounter++ === keys.length) {
						$a.off({label: uniqId, group: TRANSITION_GROUP});
						resolve();
					}

				}, {label: uniqId, group: TRANSITION_GROUP});

			}).catch((err) => {
				stderr(err);
				resolve();

			});

		};

		this.append({node, props}, resolver);
		return this;
	}

	/**
	 * Makes an element visible
	 *
	 * @param el
	 * @param [props]
	 */
	visible(el: Target, props?: StyleDictionary): Transition {
		return this.toggleVisibility(el, 'visible', props);
	}

	/**
	 * Makes an element hidden
	 *
	 * @param el
	 * @param [props]
	 */
	hidden(el: Target, props?: StyleDictionary): Transition {
		return this.toggleVisibility(el, 'hidden', props);
	}

	/**
	 * Repeats transition specified times
	 *
	 * @param el
	 * @param props
	 * @param duration
	 * @param [delay]
	 * @param [repeat]
	 */
	repeat(el: Target, props: StyleDictionary, duration: number, delay?: number, repeat?: number): Transition {
		return this;
	}

	/**
	 * Revers a transition
	 */
	reverse(): Transition {
		return this;
	}

	/**
	 * Kills a transition
	 */
	kill(): void {
		//..
	}

	/**
	 * Creates a sequence
	 */
	sequence(): void {
		//...
	}

	/**
	 * Creates a parallel
	 */
	parallel(): void {
		//...
	}

	/**
	 * @param resolve
	 * @param reject
	 */
	then(resolve: Function): Transition {
		if (this.isFulfilled) {
			Promise.resolve().then(() => resolve(this));
			return this;
		}

		// Возможно стоит биндить каждый then к определенной transition
		// Точно стоит

		this.subscribers.push(resolve);
		return this;
	}

	/**
	 * Change elements visibility
	 *
	 * @param el
	 * @param mode
	 * @param [props]
	 */
	protected toggleVisibility(el: Target, mode: VisibilityMode, props?: StyleDictionary): Transition {
		props = {
			...(mode === 'visible' ? this.visibleProps : this.hiddenProps),
			...props
		};

		const
			{async: $a} = this,
			node = this.getNode(el);

		if (!node) {
			return this;
		}

		const resolver = (resolve) => {
			Object.assign(node.style, props);

			$a.requestAnimationFrame(() => {
				resolve();

			}, {group: TRANSITION_GROUP});
		};

		this.append({node, props}, resolver);
		return this;
	}

	/**
	 * Initializes an animation
	 */
	protected play(): void {
		if (this.isFulfilled && this.resolver) {
			this.resolver();
			return;
		}

		const
			{async: $a, mode} = this;

		if (mode === 'sequence') {
			const
				{next} = this;

			if (!next) {
				return;
			}

			next.promise = $a.promise(new Promise(next.resolver)).catch(stderr);
			next.promise.then(this.play);

		} else {
			const
				{stack} = this;

			for (let i = 0; i < stack.length; i++) {
				const
					transition = stack[i];

				if (transition.promise) {
					continue;
				}

				transition.promise = $a.promise(new Promise(transition.resolver)).catch(stderr);
			}
		}
	}

	/**
	 * Appends transition into stack
	 * @param info
	 */
	protected append(info: TransitionParams, executor: (resolve: Function, reject: Function) => unknown): TransitionInfo {
		if (!this.stack.length) {
			this.state = TRANSITION_STATES.run;
		}

		const transition = {
			...info,
			state: TRANSITION_STATES.initial,
			resolver: executor
		};

		this.stack.push(transition);
		this.play();

		return transition;
	}

	/**
	 * Returns a DOM node by selector
	 * @param node
	 */
	protected getNode(node: HTMLElement | string): CanUndef<HTMLElement> {
		return node instanceof HTMLElement ? node : this.block.element(node);
	}

	/**
	 * Generates a will-change and transform for element
	 * @param [props]
	 */
	protected generateGPU(props?: StyleDictionary): StyleDictionary {
		return {};
	}

	/**
	 * Handler: transition is finished
	 */
	protected onDone(): void {
		// ..
	}
}

export class TransitionController {
	/**
	 * Stores a transition links
	 */
	protected store: Dictionary<TransitionCtx> = {};

	/**
	 * Creates a new parallel transition timeline
	 */
	parallel(ctx: iBlock, label: Label, params: TransitionCreateParams = {}): Transition {
		this.kill(label);

		const
			{store} = this,
			transitionCtx = store[label] = this.buildContext(ctx, label, 'parallel', params);

		return transitionCtx.transition;
	}

	/**
	 * Creates a new transition sequence
	 * @param ctx
	 * @param label
	 */
	sequence(ctx: iBlock, label: Label, params: TransitionCreateParams = {}): Transition {
		this.kill(label);

		const
			{store} = this,
			transitionCtx = store[label] = this.buildContext(ctx, label, 'sequence', params);

		return transitionCtx.transition;
	}

	/**
	 * Reverse a transition
	 *
	 * @param ctx
	 * @param label
	 */
	reverse(label: Label): CanUndef<Transition> {
		const
			transition = this.getTransition(label);

		if (transition) {
			return transition;
		}
	}

	/**
	 * Stops a transition
	 * @param label
	 */
	stop(label: Label): void {
		//..
	}

	/**
	 * Stops all transitions
	 */
	stopAll(): void {
		//..
	}

	/**
	 * Removes a transition
	 * @param label
	 */
	kill(label: Label): void {
		const
			transition = this.getTransition(label);

		if (transition) {
			transition.kill();
			delete this.store[label];
		}
	}

	/**
	 * Removes all transitions
	 */
	killAll(): void {
		//..
	}

	/**
	 * Returns a transition
	 * @param label
	 */
	getTransition(label: Label): CanUndef<Transition> {
		const
			quota = this.store[label];

		if (quota) {
			return quota.transition;
		}
	}

	/**
	 * Returns a transition context
	 * @param label
	 */
	protected getTransitionCtx(label: Label): CanUndef<TransitionCtx> {
		return this.store[label];
	}

	/**
	 * Returns link to component async module
	 * @param ctx
	 */
	protected getAsync(ctx: iBlock): Async {
		// @ts-ignore
		return ctx.async;
	}

	/**
	 * Builds a new transition context
	 *
	 * @param ctx
	 * @param label
	 */
	protected buildContext(
		ctx: iBlock,
		label: Label,
		mode: TransitionMode,
		params: TransitionCreateParams
	): TransitionCtx {
		const
			$a = this.getAsync(ctx),
			group = {group: CONTROLLER_GROUP};

		$a.worker(() => {
			// should kill transition?
			delete this.store[label];
		}, group);

		return {
			ctx,
			label,
			transition: new Transition(ctx, label, mode, params)
		};
	}
}

const Controller = new TransitionController();
export default Controller;

/**
 * Proposal:
 *
 * @example
 * const
 * 	timeline = this.transition.sequence($$.label);
 *
 * timeline
 * 	.run('root-wrapper', {opacity: 1}, 800)
 * 	.then((a) => new Promise((res, rej) => {
 * 		return fetch(url).then((r) => r.json());
 * 	}))
 * 	.then((a, res) => {
 * 		// a - instanceof transition
 * 		// res - response from server
 * 	})
 * 	.run('root-wrapper', {opacity: 0}, 800)
 * 	.done(() => alert('done'));
 *
 *
 * await timeline;
 *
 * @example
 * this.transition.sequence($$.label)
 * 	.visible('root-wrapper')
 * 	.run()
 *
 */

/**
 * @example
 * timeline.parallel($$.label)
 * 	.run('root-wrapper', {opacity: 1}, 800)
 * 	.run('root-wrapper', {opacity: 1}, 400)
 * 	.then((a) => {...})
 *
 * timeline.parallel($$.label)
 * 	.run('root-wrapper1', {opacity: 1}, 800)
 * 	.run('root-wrapper2', {opacity: 1}, 400)
 * 	.run('root-wrapper2', {opacity: [1, 400]}, 900) // Если не в один чанк значит
 * 	// будет значение установлено после выполнение первого чанка (то есть работать как sequence like)
 * 	.sequence((a) => {
 * 		return a.run('root-wrapper3', {height: '120px'}, 800)
 * 			.run('root-wrapper3', {height: '100px', 400});
 * 	})
 * 	.run()
 *
 * timeline.sequence($$.label)
 * 	.run('root-wrapper', {opacity:})
 */
