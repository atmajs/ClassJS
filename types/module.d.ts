declare function Class<T>(prototype:  T & IClassDeclaration)
    : new (...args: any[]) => T;

declare namespace Class {
    
    export class EventEmitter {
        on (name: string, callback: Function)
        once (name: string, callback: Function)
        off (mix: string | Function, callback?: Function)
        emit(...args: any[])
        trigger(...args: any[])
    }
    
    export class Serializable {
        toJSON () 
    }

        
    export type DeferredLike = Deferred | PromiseLike<any>;  
    export class Deferred {
        then(onOk: (...args: any[]) => void | DeferredLike, onFail?: (...args: any[]) => void | DeferredLike)
        done (done: (...args: any[]) => void | DeferredLike): this
        fail (fail: (error: any | Error) => void): this
        reject(error: any | Error) : this
        resolve(...args: any[]): this
        always (always: Function): this

        defer (): this
        isResolved (): boolean
        isRejected (): boolean
        isBusy (): boolean
        resolveDelegate (): (result: any) => void | any
        rejectDelegate (): (result: Error | any) => void | any

        static run (fn: (resolve: Function, reject?: Function) => void | Deferred, ctx?: any): DeferredLike
        static resolve (...args: any[]): DeferredLike
        static reject (...args: any[]): DeferredLike
    } 

    export class Await extends Deferred {
        constructor(...arr: (DeferredLike | any)[])
    }

    export function Collection<T, TColl>(type: new (...args) => T, prototype: IClassDeclaration & TColl): new (...args: any[]) => Array<T> & TColl;

    export function validate(instance: object, validationModel?: object, isStrict?: boolean): void | Error
    export function properties(Ctor: Function | Object): string[]
    export function stringify(instance: Object): string
    export function parse<T>(json: string): T
    
    export namespace Fn {
        export function memoize <T> (fn: T): T & {
            clearArgs: (...args: any[]) => void
            clearAll: () => void
        }
    }

    export function mixin<T1, T2, T3, T4> (
        mix1: new (...args) => T1, 
        mix2?: new (...args) => T2,
        mix3?: new (...args) => T3,
        mix4?: new (...args) => T4,
    ): new (...args) => T1 & T2 & T3 & T4

    export namespace deco {
        export function proto(proto: TAny): (Ctor: Function) => void
        export let memoize: IMethodDecorator
        export let self: IMethodDecorator

        export interface IMethodDecorator {
            (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
        }
    }

    export namespace Store {
        export interface IStoreConstructor {
            new (...args): IStore
        }
        export interface IStore extends Deferred {
            fetch(query: {[key: string]: any}, opts?: {[key: string]: any}): this
            save(query: {[key: string]: any}, opts?: {[key: string]: any}): this
            patch(query: {[key: string]: any}, opts?: {[key: string]: any}): this
            del(): this
        }
        export function Remote(path: string): IStore
        export function LocalStore(path: string): IStore        
    }
    export namespace MongoStore {
        
        export function Single(collName: string | StoreOpts): Store.IStore
        export function Collection(collName: string): Store.IStore
        export function settings(opts: {
            db?: string
            ip?: string
            port?: string | number
            connection?: string
            params?: {
                auto_reconnect?: boolean
                native_parser?: boolean
                w: number
                [key: string]: any
            }
        }): void
        export function resolveDb(): Deferred
        export function resolveCollection(Store: Store.IStoreConstructor): Deferred
        export function ensureIndexesAll(): Deferred
        export function ensureIndexes(Store: Store.IStoreConstructor): Deferred
        export interface StoreOpts {
            collection: string
            indexes?: { [key: string]: number} | ({ [key: string]: number})[]
        }

        export namespace profiler {
            export function toggle(state: boolean)
            /** Gets all slow queries seen so far */
            export function getData(): QueryInfo[]

            export interface ProfilerOptions {
                slowLimit: number
                onDetect: (info: QueryInfo) => void
                detector?: (mongoDbPlanObject: any) => boolean
            }
            export interface QueryInfo {
                coll: string,
                query: string,
                params?: {
                    reason: string
                }
                /* MongoDB Plan */
                plan?: any
            }
        }
    }
}

export declare interface IClassDeclaration {
    Static?: {
        [x: string]: any    
    }
    Construct?: (...args: any[]) => any | void
    Base?: any
    Extends?: any | any[]
    Validate?: any
    Self?: {
        [key: string]: Function
    }
    Store?: Class.Store.IStore[]
    [x: string]: any
}

export default Class;