import {MiTable} from '../utils/miTable';

export class ParamMeta {

    static paramTable: MiTable<Function, string, ParamMeta[]> = new MiTable<Function, string, ParamMeta[]>();

    public static find(targetClass: Function, methodName: string): ParamMeta[] {
        return this.paramTable.hGet(targetClass, methodName) || [];
    }

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

    public targetClass: Function;

    constructor(
        public prototype: Object,
        public methodName: string,
        public index: number,
        public paramName: string
    ) {
        this.targetClass = prototype.constructor
    }


}
