export class MITable<TScope, TKey, TValue>  {

    protected map : Map<TScope, Map<TKey, TValue>> = new Map<TScope, Map<TKey, TValue>>();

    public hSet(hKey: TScope, key: TKey, value: TValue) {
        if (this.map.has(hKey)) {
            this.map.get(hKey).set(key, value);
        } else {
            const scope = new Map<TKey, TValue>();
            scope.set(key, value);
            this.map.set(hKey, scope);
        }
    }

    public has(hKey: TScope) {
        return this.map.has(hKey);
    }

    public hHas(hKey: TScope, key: TKey) {
        return this.map.has(hKey) && this.map.get(hKey).has(key);
    }

    public hGet(hKey: TScope, key: TKey) {
        if (!this.map.has(hKey)) {
            return undefined;
        }

        return this.map.get(hKey).get(key);
    }

    public hDel(hKey: TScope, key: TKey) {
        if (this.hHas(hKey, key)) {
            return this.map.get(hKey).delete(key);
        }
        return false;
    }


}
