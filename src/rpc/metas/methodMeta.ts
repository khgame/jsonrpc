import {MiTable} from '../utils/miTable';
import {ParamMeta} from './paramMeta';
import {TargetMeta} from './targetMeta';

export class MethodMeta {

    static methodTable: MiTable<Function, string, MethodMeta> = new MiTable<Function, string, MethodMeta>();

    public static find(targetClass: Function, methodName: string): MethodMeta | undefined {
        return this.methodTable.hGet(targetClass, methodName);
    }

    public static list(targetClass: Function): MethodMeta[] {
        return this.methodTable.hGetValues(targetClass);
    }
    static create(prototype: Object,
                  methodName: string,
                  name: string,
                  defaultMethod?: Function) {
        const meta = new MethodMeta(prototype, methodName, name, defaultMethod);
        this.methodTable.hSet(meta.targetClass, methodName, meta);
        return meta;
    }

    public targetClass: Function;

    constructor(
        public prototype: Object,
        public methodName: string,
        public name: string,
        public defaultMethod?: Function
    ) {
        this.targetClass = prototype.constructor
    }

    get alias() {
        return this.methodName;
    }

    getTargetMeta() {
        return TargetMeta.find(this.targetClass);
    }

    getParamMetas() {
        return ParamMeta.find(this.targetClass, this.methodName) || [];
    }

    assembleParams(args: any[]) {
        const matchedArgs = this.getParamMetas(); // refine index
        if ( matchedArgs.length > 0) { // using map
            const data: any = {};
            matchedArgs.forEach(arg => data[arg.paramName] = args[arg.index]);
            return data;
        } else { // using array
            return args;
        }
    }

    disassambleParams(params: any): any[] {
        const matchedArgs = this.getParamMetas();  // refine index
        if (matchedArgs && matchedArgs.length > 0) { // using map
            const args: any[] = [];
            matchedArgs.forEach(arg => args[arg.index] = params[arg.paramName]);
            return args;
        } else { // using array
            return params as any[];
        }
    }

    async call(args: any[]) {
        const targetMeta = this.getTargetMeta();
        const client = targetMeta.client;
        if (!client) {
            return await this.defaultMethod.apply(targetMeta.instance, args);
        } else {
            console.log(`rpc(${targetMeta.tag}).${targetMeta.prefix}.${this.alias}`);
            const rsp = await client.request(this.alias, this.assembleParams(args), targetMeta.prefix);
            return rsp.result; // todo: error check
        }
    }

    async localCall(param: any) {
        const targetMeta = TargetMeta.find(this.targetClass);
        return await this.defaultMethod.apply(targetMeta.instance, this.disassambleParams(param));
    }


}
