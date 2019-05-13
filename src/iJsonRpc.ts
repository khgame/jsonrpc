export interface IJsonRpcBase {
    jsonrpc: '2.0';
}

export interface IJsonRpcError {
    code: number,
    message: string,
    data?: any
}

export interface IJsonRpcNotification extends IJsonRpcBase {
    method: string;
    params?: any[];
}

export interface IJsonRpcRequest extends IJsonRpcNotification {
    id: number;
}

export interface IJsonRpcResponse extends IJsonRpcBase {
    result?: any;
    error?: IJsonRpcError
}

export interface IJsonRpcBatch extends Array<IJsonRpcRequest> {
}


export type IJsonRpc = IJsonRpcRequest | IJsonRpcBatch;

