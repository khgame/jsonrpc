import {Method, Param, Target} from '../../src';
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
// console.log(targets);
