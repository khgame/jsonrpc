import {Client} from '../../src';
import { MathController} from './controller'

Client.listen('game_server', 'http://localhost:8001');

const instance = new MathController();

instance.add(1,2);

instance.add2(1,2);


