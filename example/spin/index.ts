import {Client, Method, Param, Target} from '../../src';
import {Server} from '../../src'

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
