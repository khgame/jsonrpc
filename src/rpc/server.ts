import {createServer, IncomingMessage, ServerResponse} from 'http';
import {JsonRpcErrorCode} from '../errorCode';
import {IJsonRpcRequest, IJsonRpcResponse} from '../iJsonRpc';
import {disassambleParams, methodMetas, targetMetas} from './decorator';

export class Server {

    listen(port?: number) {
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
            request.on('data', function (chunk) {
                content += chunk;
            });
            request.on('end', async () => {
                await this.exec(content, response);
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
        response.writeHead(200, {'Content-Type': 'text/json'});
        response.write(JSON.stringify(content));
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

    async exec(data: any, response: ServerResponse) {
        const assert = this.assert(response);
        console.log('=== response ==-', data);
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

    init(constructors: Function[]) {
        targetMetas
            .filter(tm => constructors.indexOf(tm.target) > -1)
            .map(tmi => ({...tmi, instance: new (tmi.target as any)()}))
            .map(tmi => methodMetas
                .filter(mm => mm.object.constructor === tmi.target)
                .map(mm => ({...mm, targetMeta: tmi}))
            )
            .reduce((prev, mms) => prev.concat(mms), [])
            .forEach(method =>
                this.requests[method.targetMeta.prefix ? `${method.targetMeta.prefix}.${method.alias}` : method.alias] =
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
                    });
        console.log('server initiated', this.requests);
    }

}
