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

### server side

Building an rpc server with this lib is very simple

> [example/server](https://github.com/khgame/jsonrpc/blob/master/example/server/index.ts)  
> You can clone the repo, and run `npm run ep:server` to start the example 

```js
import {Param, Server, Method, Target} from '@khgame/jsonrpc';

@Target('game', 'math')
class MathController {

    @Method()
    public add(a: number, b: number) {
        console.log('add', a, b)
        return a + b;
    }

    @Method('add2')
    public anotherAdd(@Param('first') a: number, @Param('second') b: number) {
        console.log('add2', a, b)
        return a + b;
    }
}

const server = new Server();
server.init([MathController]);
server.listen(8001);
```

### client side

With very little configuration, you can create a client that can send jsonrpc messages.

> In this version, you need to install axios package yourself. `npm i --save axios`  
> [example/client](https://github.com/khgame/jsonrpc/blob/master/example/client/index.ts)  
> You can clone the repo, and run `npm run ep:client` to start the example

```js
import {Method, Param, Target} from '@khgame/jsonrpc';

@Target('game', 'math')
export class MathController {

    @Method()
    add(a: number, b: number) {} 

    @Method()
    add2(@Param('first') a: number, @Param('second') b: any) {}
}

Client.listen('game', 'http://localhost:8001/game');
const instance = new MathController();
instance.add(1,2);  // the request will be 
                    // { jsonrpc: '2.0', method: 'math.add', params: [ 1, 2 ], id: ... }
instance.add2(1,2); // the request will be 
                    // { jsonrpc: '2.0', method: 'math.add2', params: { second: 2, first: 1 }, id: ... }

// response add :  { jsonrpc: '2.0', result: 3 }
// response add2 :  { jsonrpc: '2.0', result: 3 }
```

### both

Obviously, the definition of controller on Client and Server is totally same,  
so you can use the method Client.listen to switch the target platform of running codes.

This can be applied to many scenarios, such as load balancing and parallel expansion,   
and there are also many benefits of code version controlling.

> [example/spin](https://github.com/khgame/jsonrpc/blob/master/example/spin/index.ts)  
> You can clone the repo, and run `npm run ep:spin` to start the example

```js
import {Client, Server, Method, Param, Target} from '@khgame/jsonrpc';

@Target('game', 'math')
class MathController {

    @Method()
    public add(a: number, b: number) {
        console.log('add', a, b)
        return a + b;
    }

    @Method('add2')
    public anotherAdd(@Param('first') a: number, @Param('second')b: number) {
        console.log('add2', a, b)
        return a + b;
    }
}

const server = new Server();
const targets = server.init([MathController]);
server.listen();

const math = targets.get(MathController);

// local call
console.log('==== locale call 1');
math.add(1,2);
math.anotherAdd(1,2);

// remote call
console.log('==== remote call 1');
Client.listen('game', 'http://localhost:8001/game');
math.add(1,2);
math.anotherAdd(1,2);

// local call
console.log('==== locale call 2');
Client.unlisten('game');
math.add(1,2);
math.anotherAdd(1,2);
```

