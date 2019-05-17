import {createServer, IncomingMessage, ServerResponse} from 'http';
import {JsonRpcErrorCode} from '../errorCode';
import {IJsonRpcRequest, IJsonRpcResponse} from '../iJsonRpc';
import {disassambleParams, methodMetas, targetMetas} from './decorator';

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
        console.log('=== request : path ==-', request.url);
        console.log('=== request : data ==-', data);
        try {
            const json: IJsonRpcRequest = JSON.parse(data);
            assert(json, JsonRpcErrorCode.INVALID_REQUEST, 'data must be a json');
            assert(json.jsonrpc === '2.0', JsonRpcErrorCode.INVALID_REQUEST, 'jsonrpc version must be 2.0');
            assert(json.method, JsonRpcErrorCode.INVALID_REQUEST, 'the CMethod must be exist');
            const params = json.params;

            console.log('=== CMethod ==-', this.requests, json.method);
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

    targets: Map<Function, any> = new Map<Function, any>();

    public init(constructors: Function[]) {
        const targets =targetMetas
            .filter(tm => constructors.indexOf(tm.constructor) > -1)
            .map(tmi => ({...tmi, instance: new (tmi.constructor as any)()}));

        targets.map(tmi => methodMetas
                .filter(mm => mm.object.constructor === tmi.constructor)
                .map(mm => ({...mm, targetMeta: tmi}))
            )
            .reduce((prev, mms) => prev.concat(mms), [])
            .forEach(method => {
                const requestMethodName = method.targetMeta.prefix ? `${method.targetMeta.prefix}.${method.alias}` : method.alias;
                this.requests[requestMethodName] =
                    async (param: any) => {
                        console.log('call CMethod : ', method.alias, method.methodName, param);
                        console.log('method.object', method.object);
                        return await Promise.resolve(
                            method.targetMeta.instance[method.methodName](
                                ...disassambleParams(
                                    method.object,
                                    method.methodName,
                                    param)
                            )
                        );
                    }
            });
        console.log('server initiated', this.requests);
        targets.forEach(c => {
            this.targets.set(c.constructor, c.instance);
        });

        return this.targets;
    }

}
