import {Client} from '../client';

export class TargetMeta {

    static targetTable: Map<Function, TargetMeta> = new Map<Function, TargetMeta>();

    static create(
        targetClass: Function,
        tag: string,
        prefix?: string,
    ) {
        const targetMeta = new TargetMeta(targetClass, tag, prefix);
        this.targetTable.set(targetClass, targetMeta);
    }

    static find(targetClass: Function) {
        return this.targetTable.get(targetClass);
    }

    static exist(targetClass: Function) {
        return this.targetTable.has(targetClass);
    }

    constructor(
        public targetClass: Function,
        public tag: string,
        public prefix?: string,
    ) {

    }

    get client() {
        return Client.get(this.tag);
    }

    get instance() {
        if (!this._instance) {
            this._instance = new (this.targetClass as any)();
        }
        return this._instance;
    };

    private _instance: any;
}

