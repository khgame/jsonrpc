# jsonrpc

toolkits of jsonrpc

> [specification of jsonrpc](http://www.jsonrpc.org/specification)

## usage

### install 

`npm i --save @khgame/jsonrpc` 

### use interfaces

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

### use rpc client

```js
import {CMethod, Param, Target} from '@khgame/jsonrpc';

@Target('game_server', 'math')
export class MathController {

    @CMethod()
    add(a: number, b: number) {} 

    @CMethod()
    add2(@Param('first') a: number, @Param('second') b: any) {}
}

Client.listen('game_server', 'http://localhost:8001');
const instance = new MathController();
instance.add(1,2);  // the request will be 
                    // { jsonrpc: '2.0', method: 'math.add', params: [ 1, 2 ], id: ... }
instance.add2(1,2); // the request will be 
                    // { jsonrpc: '2.0', method: 'math.add2', params: { second: 2, first: 1 }, id: ... }

// response add :  { jsonrpc: '2.0', result: 3 }
// response add2 :  { jsonrpc: '2.0', result: 3 }
```

### create rpc server
```js
import {Param, SMethod, STarget} from '../../src';
import {Server} from '../../src'

@STarget('math')
class MathController {

    @SMethod()
    public add(a: number, b: number) {
        console.log('add', a, b)
        return a + b;
    }

    @SMethod('add2')
    public anotherAdd(@Param('first') a: number, @Param('second')b: number) {
        console.log('add2', a, b)
        return a + b;
    }
}

const server = new Server();
server.init([MathController]);
server.listen(8001);
```


