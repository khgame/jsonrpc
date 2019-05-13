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
server.listen();
