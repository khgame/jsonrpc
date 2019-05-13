# jsonrpc

toolkits of jsonrpc

> [specification of jsonrpc](http://www.jsonrpc.org/specification)

## usage

### install 

`npm i --save @khgame/jsonrpc` 

### import / require

```js
import { 
    IJsonRpcRequest,
    IJsonRpcResponse,
    IJsonRpcNotification,
    IJsonRpcBatch,
    IJsonRpc, // means IJsonRpcRequest | IJsonRpcBatch
    JsonRpcErrorCode
    } from '@khgame/jsonrpc' // or `= require('@khgame/jsonrpc')`
```
