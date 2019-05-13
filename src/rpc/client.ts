import {AxiosStatic} from 'axios';
import {IJsonRpcRequest, IJsonRpcResponse} from '../iJsonRpc';

export class Client {

    private static axios: AxiosStatic;
    private static clients: { [url: string]: Client } = {};

    public static get(tag: string) {
        if (!tag) {
            throw new Error(`rpc target of tag ${tag} are not exist, call Client.listen to register the target`);
        }
        return this.clients[tag];
    }

    public static listen(tag: string, url: string) {
        return this.clients[tag] = new Client(url);
    }

    private static loadAxios() {
        if (!require) {
            throw new Error('Cannot load mongoose. Try to install all required dependencies.');
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

    async request(method: string, params: any): Promise<IJsonRpcResponse> {
        const request: IJsonRpcRequest = {
            jsonrpc: '2.0',
            method,
            params,
            id: Date.now()
        };
        console.log('> SEND REQUEST :', this.url, method, request);

        const rsp = await this.axios.post(
            this.url,
            request,
            {
                headers: {Accept: 'application/json'}
            });

        console.log('response : ', rsp.data);
        return rsp.data as IJsonRpcResponse;
    }
}
