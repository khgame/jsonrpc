import {Method, Param, Target} from '../../src';

@Target('game', 'math')
export class MathController {

    @Method()
    add(a: number, b: number) {}

    @Method()
    add2(@Param('first') a: number, @Param('second') b: any) {}

}
