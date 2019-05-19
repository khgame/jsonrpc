import {MITable} from '../utils/mitable';

export class ParamMeta {

    static paramTable: MITable<Function, string, ParamMeta[]> = new MITable<Function, string, ParamMeta[]>();

    public static find(targetClass: Function, methodName: string): ParamMeta[] {
        return this.paramTable.hGet(targetClass, methodName) || [];
    }

    public targetClass: Function;

    static create(prototype: Object,
                  methodName: string,
                  index: number,
                  paramName: string) {
        const paramMeta = new ParamMeta(prototype, methodName, index, paramName);
        if (this.paramTable.hHas(paramMeta.targetClass, methodName)) {
            this.paramTable.hGet(paramMeta.targetClass, methodName).push(paramMeta);
        } else {
            this.paramTable.hSet(paramMeta.targetClass, methodName, [paramMeta]);
        }
    }

    constructor(
        public prototype: Object,
        public methodName: string,
        public index: number,
        public paramName: string
    ) {
        this.targetClass = prototype.constructor
    }


}
