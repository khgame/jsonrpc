import {Client} from './client';
import {TargetMeta} from './meta/TargetMeta';

export type ParamMetaType = {
    object: Object,
    methodName: string,
    index: number,
    paramName: string
}
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

export function disassambleParams(methodMeta: MethodMetaType, params: any): any[] {
    const matchedArgs = paramMetas.filter(
        arg => arg.object === methodMeta.object && arg.methodName === methodMeta.methodName); // refine index
    if (matchedArgs.length > 0) { // using map
        const args: any[] = [];
        matchedArgs.forEach(arg => args[arg.index] = params[arg.paramName]);
        return args;
    } else { // using array
        return params as any[];
    }
}

export type MethodMetaType = {
    object: Object,
    methodName: string,
    alias: string,
    targetMeta?: TargetMeta
    originMethod?: Function
}
export const methodMetas: Array<MethodMetaType> = [];

export function Target(tag: string, prefix?: string) {
    return (constructor: Function) => {
        console.log('Target', constructor);
        TargetMeta.create(constructor, tag, prefix);
    }
}

export function Param(paramName: string) {
    return function (object: Object, methodName: string, index: number) {
        paramMetas.push({object, methodName, index, paramName})
    };
}

export function Method(name?: string) {
    return (object: Object, methodName: string, descriptor: TypedPropertyDescriptor<Function>) => {
        const originMethod = descriptor.value;
        methodMetas.push({object, methodName, alias: name || methodName, originMethod});

        descriptor.value = async function(...args: any[]) {
            const targetMeta = TargetMeta.find(object.constructor); // todo: refine indexing
            const callTag = targetMeta.tag;
            /** if client haven't listen this tag, call directly */
            if(!Client.targetExist(callTag)) {
                // console.log('locale call');
                return await originMethod.apply(this, args);
            }
            /** otherwise, using rpc */
            const method = name || methodName;
            const methodPath = targetMeta.prefix ? `${targetMeta.prefix}.${method}` : method;
            console.log(`rpc(${callTag}).${methodPath}`);
            const rsp = await targetMeta.client.request(methodPath, assembleParams(object, methodName, args));
            return rsp.result; // todo: error check
        }
    }
}
