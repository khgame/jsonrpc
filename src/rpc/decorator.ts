import {Client} from './client';

type TargetMetaType = {
    prefix: string,
    target: Function,
    client?: () => Client,
    instance?: any
}
export const targetMetas: Array<TargetMetaType> = [];

type ParamMetaType = { object: Object, methodName: string, index: number, paramName: string }
export const paramMetas: Array<ParamMetaType> = [];
export function assembleParams(object: Object, methodName: string, args: any[]) {
    const matchedArgs = paramMetas.filter(arg => arg.object === object && arg.methodName === methodName); // refine index
    if (matchedArgs.length > 0) { // using map
        const data: any = {};
        matchedArgs.forEach(arg => data[arg.paramName] = args[arg.index]);
        return data;
    } else { // using array
        return args;
    }
}

export function disassambleParams(object: Object, methodName: string, params: any): any[] {
    const matchedArgs = paramMetas.filter(arg => arg.object === object && arg.methodName === methodName); // refine index
    if (matchedArgs.length > 0) { // using map
        const args: any[] = [];
        matchedArgs.forEach(arg => args[arg.index] = params[arg.paramName]);
        return args;
    } else { // using array
        return params as any[];
    }
}

export type MethodMetaType = { object: Object, methodName: string, alias: string, targetMeta?: TargetMetaType }
export const methodMetas: Array<MethodMetaType> = [];

export function STarget(prefix?: string) {
    return (target: Function) => {
        targetMetas.push({target, prefix})
    }
}

export function SMethod(name?: string) {
    return (object: Object, methodName: string) => {
        methodMetas.push({object, methodName, alias: name || methodName});
    }
}

export function Param(paramName: string) {
    return function (object: Object, methodName: string, index: number) {
        paramMetas.push({object, methodName, index, paramName})
    };
}

export function Target(tag: string, prefix?: string) {
    return (target: Function) => {
        console.log('Target', target);
        targetMetas.push({target, prefix, client: () => Client.get(tag)})
    }
}

export function CMethod(name?: string) {
    return (object: Object, methodName: string, descriptor: TypedPropertyDescriptor<Function>) => {
        const method = name || methodName;
        console.log('CMethod', method);
        descriptor.value = async (...args: any[]) => {
            const targetMeta = targetMetas.find(tm => tm.target === object.constructor); // refine indexing
            const methodPath = targetMeta.prefix ? `${targetMeta.prefix}.${method}` : method;
            return await targetMeta.client().request(methodPath, assembleParams(object, methodName, args));
        }
    }
}
