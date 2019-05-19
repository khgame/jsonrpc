import {Client} from '../client';

export class TargetMeta {

    static targetMetas: Array<TargetMeta> = [];

    static create(
        targetClass: Function,
        tag: string,
        prefix?: string,
    ) {
        this.targetMetas.push(new TargetMeta(targetClass, tag, prefix));
    }

    static find(targetClass: Function) {
        return this.targetMetas.find(tm => tm.targetClass === targetClass); // todo: refine indexing
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

