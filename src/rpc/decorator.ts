import {MethodMeta} from './metas/methodMeta';
import {ParamMeta} from './metas/paramMeta';
import {TargetMeta} from './metas/targetMeta';

export function Target(tag: string, prefix?: string) {
    return (constructor: Function) => {
        console.log('Target', constructor);
        TargetMeta.create(constructor, tag, prefix);
    }
}

export function Param(paramName: string) {
    return function (object: Object, methodName: string, index: number) {
        ParamMeta.create(object, methodName, index, paramName);
    };
}

export function Method(name?: string) {
    return (object: Object, methodName: string, descriptor: TypedPropertyDescriptor<Function>) => {
        const originMethod = descriptor.value;
        const meta = MethodMeta.create(object, methodName, name, originMethod);
        descriptor.value = async function(...args: any[]) {
            return meta.call(args);
        }
    }
}
