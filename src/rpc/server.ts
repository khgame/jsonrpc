import {createServer, IncomingMessage, ServerResponse} from 'http';
import {IJsonRpcRequest} from '../iJsonRpc';
import {Dispatcher} from './core/dispatcher';
import {TargetMeta} from './metas/targetMeta';

export class Server {

    dispatcher: Dispatcher;

    prefix: string;

    public listen(port?: number): any {
        const server = createServer(this.callback());
        port = port || 8001;
        const ret = server.listen(port);
        // console.log(`start listen at http://localhost:${port}`);
        return ret;
    }

    callback() {
        return (request: IncomingMessage, response: ServerResponse) => {
            if (request.method !== 'POST') {
                response.writeHead(405);
                response.end();
                return;
            }

            let content = '';
            request.setEncoding('utf8');
            // console.log(request.url);
            request.on('data', function (chunk: string) {
                content += chunk;
            });
            request.on('end', async () => {
                await this.exec(content, request, response);
            });
        }
    }


    rsp(response: ServerResponse, content: any) {
        const data = JSON.stringify(content);
        response.writeHead(200, {'Content-Type': 'text/json', 'Content-Length': data.length});
        response.write(data);
        response.end();
    }

    async exec(data: any, request: IncomingMessage, response: ServerResponse) {
        if (!this.dispatcher) {
            throw new Error('the dispatcher haven\'t been created, try to call init befor the exec method');
        }

        if (process.env.NODE_ENV !== 'production') {
            console.log('jsonRpc-svr> REQUEST RECEIVED :', request.url, data);
        }
        const json: IJsonRpcRequest = JSON.parse(data);
        const head = this.prefix ? this.prefix + '/' : '/';
        if(!this.prefix || !request.url.startsWith(head)) {
            response.writeHead(404, {'Content-Type': 'text/json', 'Content-Length': data.length});
            response.end();
            return;
        }
        const target = request.url.slice(head.length)
        const rsp = await this.dispatcher.exec(target, json);
        this.rsp(response, rsp);
    }

    getTarget(targetClass: Function) {
        const targetMeta = TargetMeta.find(targetClass);
        if (!targetMeta) {
            console.error(`cannot find the target : ${targetClass}, is it initialized?`);
            return undefined;
        }
        return targetMeta.instance;
    }


    public init(constructors: Function[], options?: {
        prefix?: string
    }) {
        options = options || {};
        this.prefix = options.prefix;
        this.dispatcher = new Dispatcher(constructors);
    }

}
