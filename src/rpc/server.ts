import {createServer, IncomingMessage, ServerResponse} from 'http';
import {JsonRpcErrorCode} from '../errorCode';
import {IJsonRpcRequest, IJsonRpcResponse} from '../iJsonRpc';
import {TargetMeta} from './metas/targetMeta';
import {MethodMeta} from './metas/methodMeta';

export class Server {

    public listen(port?: number): any {
        const server = createServer(this.callback());
        port = port || 8001;
        const ret = server.listen(port);
        console.log(`start listen at http://localhost:${port}`)
        return ret;
    }

    callback() {
        return (request: IncomingMessage, response: ServerResponse) => {
            if (request.method !== 'POST') {
                response.writeHead(403);
                response.end();
                return;
            }

            let content = '';
            request.setEncoding('utf8');
            // request.url
            request.on('data', function (chunk: string) {
                content += chunk;
            });
            request.on('end', async () => {
                await this.exec(content, request, response);
            });
        }
    }

    rspError(response: ServerResponse, code: number, message: string) {
        const err: IJsonRpcResponse = {
            jsonrpc: '2.0',
            error: {code, message}
        }
        this.rsp(response, err);
    }

    rsp(response: ServerResponse, content: any) {
        const data = JSON.stringify(content);
        response.writeHead(200, {'Content-Type': 'text/json', 'Content-Length': data.length});
        response.write(data);
        response.end();
    }

    assert(response: ServerResponse) {
        return (condition: any, code: number, msg: string | (() => string)) => {
            if (!!condition) return;
            if (msg instanceof Function) {
                msg = msg()
            }
            if (!condition) {
                this.rspError(response, code, msg);
                throw '__ASSERT__';
            }
        }
    }

    async exec(data: any, request: IncomingMessage, response: ServerResponse) {
        const assert = this.assert(response);
        console.log('SERVER> REQUEST RECEIVED :', request.url, data);
        try {
            const json: IJsonRpcRequest = JSON.parse(data);
            assert(json, JsonRpcErrorCode.INVALID_REQUEST, 'data must be a json');
            assert(json.jsonrpc === '2.0', JsonRpcErrorCode.INVALID_REQUEST, 'jsonrpc version must be 2.0');
            assert(json.method, JsonRpcErrorCode.INVALID_REQUEST, 'the Method must exist');
            const params = json.params;
            const method = this.requests[json.method];
            assert(method, JsonRpcErrorCode.METHOD_NOT_FOUND, () => `cannot find method ${json.method}`);

            const rsp: IJsonRpcResponse = {
                jsonrpc: '2.0',
            }
            // console.log('=== CMethod ===', CMethod, params);
            rsp.result = await method(params);
            this.rsp(response, rsp);
        } catch (e) {
            if (e === '__ASSERT__') {
                return;
            }
            this.rspError(response, JsonRpcErrorCode.INTERNAL_ERROR, `${e}`);
        }
    }

    requests: { [route: string]: (...args: any[]) => Promise<any> } = {};

    getTarget(targetClass: Function) {
        const targetMeta = TargetMeta.find(targetClass);
        if(!targetMeta) {
            console.error(`cannot find the target : ${targetClass}, is it initialized?`);
            return undefined;
        }
        return targetMeta.instance;
    }

    targetConstructors: Function[] = [];

    public initialMethods() {
        this.targetConstructors
            .map(c => TargetMeta.find(c))
            .filter(c => c)
            .map(tmi => MethodMeta.list(tmi.targetClass))
            .reduce((prev: MethodMeta[], mms: MethodMeta[]) => prev.concat(mms), [])
            .forEach(methodMeta => {
                const tmi = methodMeta.getTargetMeta();
                const alias = methodMeta.alias;
                const requestMethodName = tmi.prefix ? `${tmi.prefix}.${alias}` : alias;
                this.requests[requestMethodName] =
                    async (param: any) => {
                        // console.log('call Method : ', tmi, alias, methodMeta.methodName, param);
                        return await methodMeta.localCall(param);
                    }
            });
    }


    public init(constructors: Function[]) {
        this.targetConstructors = constructors;
        this.initialMethods();
    }

}
