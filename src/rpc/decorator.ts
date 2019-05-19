import {MethodMeta} from './metas/methodMeta';
import {ParamMeta} from './metas/paramMeta';
import {TargetMeta} from './metas/targetMeta';

/**
 * Mark a target
 * @param {string} tag - Target name in the rpc cluster
 * @param {string} prefix - Module prefix. If the prefix are set, the real rpc method of this object's methods will be prefix.name
 */
export function Target(tag: string, prefix?: string) {
    return (constructor: Function) => {
        console.log('Target', constructor);
        TargetMeta.create(constructor, tag, prefix);
    }
}

/**
 * Mark a param
 * @param {string} paramName - The param name in rpc call.
 * @summary Only marked params will be set to the rpc msg. If all args are not marked, the params will be the array of args.
 */
export function Param(paramName: string) {
    return function (object: Object, methodName: string, index: number) {
        ParamMeta.create(object, methodName, index, paramName);
    };
}

/**
 * Mark a method
 * todo: this is a bag implementation, cuz the default method are overrided
 * @param {string} name - Rpc name of the method. If left the name empty, the rpc name will be set to the method name.
 */
export function Method(name?: string) {
    return (object: Object, methodName: string, descriptor: TypedPropertyDescriptor<Function>) => {
        const originMethod = descriptor.value;
        const meta = MethodMeta.create(object, methodName, name, originMethod);
        descriptor.value = async function(...args: any[]) {
            return meta.call(args);
        }
    }
}
