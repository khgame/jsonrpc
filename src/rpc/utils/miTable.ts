export class MiTable<TScope, TKey, TValue> {

    protected map: Map<TScope, Map<TKey, TValue>> = new Map<TScope, Map<TKey, TValue>>();

    public has(hKey: TScope) : boolean {
        return this.map.has(hKey);
    }

    public get(hKey: TScope): Map<TKey, TValue> {
        return this.map.get(hKey);
    }

    public hHas(hKey: TScope, key: TKey) : boolean {
        return this.map.has(hKey) && this.map.get(hKey).has(key);
    }

    public hGet(hKey: TScope, key: TKey): TValue | undefined {
        if (!this.map.has(hKey)) {
            return undefined;
        }
        return this.map.get(hKey).get(key);
    }

    public hGetValues(hKey: TScope): TValue[] {
        if (!this.map.has(hKey)) {
            return undefined;
        }
        const map = this.map.get(hKey);
        return Array.from(map.values());
    }

    public hSet(hKey: TScope, key: TKey, value: TValue) : this {
        if (this.map.has(hKey)) {
            this.map.get(hKey).set(key, value);
        } else {
            const scope = new Map<TKey, TValue>();
            scope.set(key, value);
            this.map.set(hKey, scope);
        }
        return this
    }


    public hDel(hKey: TScope, key: TKey) : boolean {
        if (this.hHas(hKey, key)) {
            return this.map.get(hKey).delete(key);
        }
        return false;
    }


}
