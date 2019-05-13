import {CMethod, Param, Target} from '../../src';

@Target('game_server', 'math')
export class MathController {

    @CMethod()
    add(a: number, b: number) {}

    @CMethod()
    add2(@Param('first') a: number, @Param('second') b: any) {}

}
