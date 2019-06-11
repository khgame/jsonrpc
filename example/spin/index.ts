import {Client, Method, Param, Target} from '../../src';
import {Server} from '../../src'

@Target('game', 'math')
class MathController {

    @Method()
    public add(a: number, b: number) {
        // console.log('add', a, b)
        return a + b;
    }

    @Method('add2')
    public async anotherAdd(@Param('first') a: number, @Param('second')b: number): Promise<number> {
        // console.log('add2', a, b)
        return a + b;
    }
}

async function go() {
    const server = new Server();
    server.init([MathController]);
    server.listen();

    const math = server.getTarget(MathController);

// local call
    console.log('==== locale call 1');
    console.log('=>', await math.add(1, 2));
    console.log('=>', await math.anotherAdd(1, 2));

// remote call
    console.log('==== remote call 1');
    Client.listen('game', 'http://localhost:8001/game');
    console.log('=>', await math.add(1, 2));
    console.log('=>', await math.anotherAdd(1, 2));

// local call
    console.log('==== locale call 2');
    Client.unlisten('game');
    console.log('=>', await math.add(1, 2));
    console.log('=>', await math.anotherAdd(1, 2));

    // console.log(server);
}
go()
