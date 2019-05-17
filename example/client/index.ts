import {Client} from '../../src';
import { MathController} from './controller'

Client.listen('game', 'http://localhost:8001');

const instance = new MathController();

console.log('call add');
instance.add(1,2);
console.log('call add2');
instance.add2(1,2);


