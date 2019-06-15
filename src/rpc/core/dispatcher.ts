import {JsonRpcErrorCode} from '../../errorCode';
import {IJsonRpcRequest, IJsonRpcResponse} from '../../iJsonRpc';
import {MethodMeta} from '../metas/methodMeta';
import {TargetMeta} from '../metas/targetMeta';

type MethodMap = { [route: string]: (...args: any[]) => Promise<any> };

export class Dispatcher {

    requests: { [route: string]: MethodMap } = {};

    constructor(targetConstructors: Function[]) {
        targetConstructors
            .map(c => TargetMeta.find(c))
            .filter(c => c)
            .map(tmi => MethodMeta.list(tmi.targetClass))
            .reduce((prev: MethodMeta[], mms: MethodMeta[]) => prev.concat(mms), [])
            .forEach(methodMeta => {
                const tmi = methodMeta.getTargetMeta();
                const alias = methodMeta.alias;
                const requestMethodName = tmi.prefix ? `${tmi.prefix}.${alias}` : alias;
                this.requests[tmi.tag] = this.requests[tmi.tag] || {};
                this.requests[tmi.tag][requestMethodName] =
                    async (param: any) => {
                        // console.log('call Method : ', tmi, alias, methodMeta.methodName, param);
                        return await methodMeta.localCall(param);
                    }
            });
    }

    assert(condition: any, code: number, message: string | (() => string)) {
        if (!!condition) return;
        if (message instanceof Function) {
            message = message()
        }
        if (!condition) {
            throw {code, message};
        }
    }

    async exec(handlerTag: string, json: IJsonRpcRequest): Promise<IJsonRpcResponse> {
        try {
            this.assert(json, JsonRpcErrorCode.INVALID_REQUEST, 'data must be a json');
            this.assert(json.jsonrpc === '2.0', JsonRpcErrorCode.INVALID_REQUEST, 'jsonrpc version must be 2.0');
            this.assert(json.method, JsonRpcErrorCode.INVALID_REQUEST, 'the Method must exist');
            const params = json.params;
            const method = this.requests[handlerTag][json.method];
            this.assert(method, JsonRpcErrorCode.METHOD_NOT_FOUND, () => `cannot find method ${json.method}`);

            return {
                jsonrpc: '2.0',
                result: await method(params)
            }
        } catch (e) {
            if (!e) {
                return {
                    jsonrpc: '2.0',
                    error: {code: JsonRpcErrorCode.INTERNAL_ERROR, message: '__SYSTEM__: empty error'}
                }
            }
            if (e.code) {
                return {
                    jsonrpc: '2.0',
                    error: e
                }
            }
            const message = (e instanceof Error) ? `${e.message} => ${e.stack}` : e;
            return {
                jsonrpc: '2.0',
                error: {
                    code: JsonRpcErrorCode.INTERNAL_ERROR,
                    message
                }
            }
        }
    }


}
