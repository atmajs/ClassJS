declare function Class (prototype: IClassDeclaration & TAny)
    : new (...args: any[]) => TAny;
declare function Class<T>(prototype: IClassDeclaration & T)
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
    export function properties(Ctor: Function): string[]


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

        export interface IMethodDecorator {
            (target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>): any
        }
    }
}

export declare interface TAny {
    [x: string]: any
}

export declare interface IClassDeclaration {
    Static?: {
        [x: string]: any    
    }
    Construct?: (...args: any[]) => any | void
    Base?: any
    Extends?: any | any[]
    Validation?: any
}

export default Class;