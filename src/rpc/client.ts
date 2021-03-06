import {AxiosStatic} from 'axios';
import {IJsonRpcRequest, IJsonRpcResponse} from '../iJsonRpc';

export class Client {

    private static axios: AxiosStatic;
    private static clients: { [tag: string]: Client } = {};
    private static backup: { [url: string]: Client } = {};

    public static get(tag: string) {
        if (!tag) {
            throw new Error(`rpc target of tag ${tag} are not exist, call Client.listen to register the target`);
        }
        return this.clients[tag];
    }

    public static listen(tag: string, url: string) {
        return this.clients[tag] = this.backup[url] || new Client(url);
    }

    public static singleRPC<T>(tag: string, url: string, cb: () => Promise<T>): Promise<T> {
        this.listen(tag, url);
        const promise = cb();
        this.unlisten(tag);
        return promise;
    }

    public static unlisten(tag: string) {
        this.backup[this.clients[tag].url] = this.clients[tag];
        this.clients[tag] = undefined; // todo: temprary
    }

    public static targetExist(tag: string) {
        return !!this.clients[tag];
    }

    private static loadAxios() {
        if (!require) {
            throw new Error('Cannot load axios. Try to install all required dependencies.');
        }
        if (!this.axios) {
            try {
                this.axios = require('axios');
            } catch (e) {
                throw new Error('axios package was not found installed. Try to install it: npm install axios --save');
            }
        }
        return this.axios;
    }

    protected axios: AxiosStatic;

    constructor(public url: string) {
        this.axios = Client.loadAxios();
        Client.clients[this.url] = this;
    }

    async request(method: string, params: any, moduleName?: string): Promise<IJsonRpcResponse> {
        if (!!moduleName) {
            method = `${moduleName}.${method}`
        }
        const request: IJsonRpcRequest = {
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now()
        };
        console.log('jsonRpc-client> SEND REQUEST :', this.url, method, JSON.stringify(request));

        const rsp = await this.axios.post(
            this.url,
            request,
            {
                headers: {Accept: 'application/json'}
            });

        console.log('jsonRpc-client> GET RESPONSE : ', rsp.data);
        return rsp.data as IJsonRpcResponse;
    }


}
