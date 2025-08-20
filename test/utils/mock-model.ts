// Very small mock helpers to simulate a subset of mongoose Model APIs for unit tests.

export class MockArrayQuery<T extends { _id: any }> {
  constructor(private items: T[]) {}

  skip(n: number) {
    this.items = this.items.slice(n);
    return this;
  }

  limit(n: number) {
    this.items = this.items.slice(0, n);
    return this;
  }

  sort(_: any) {
    return this;
  }

  lean() {
    // In mongoose, calling `.lean()` keeps the query chainable and returns
    // plain objects when the query is executed. Our mock simply returns the
    // query itself to allow further chaining like `.lean().exec()`.
    return this;
  }

  exec() {
    return Promise.resolve(this.items);
  }
}

export function createJobModelMock(initial: any[] = []) {
  const data = [...initial];
  return {
    _data: data,
    create: jest.fn((doc: any) => {
      const _id =
        doc._id ?? `${Math.random().toString(16).slice(2).padEnd(24, '0')}`;
      const created = { ...doc, _id };
      data.push(created);
      return created;
    }),
    find: jest.fn((filter: any = {}) => {
      const items = data.filter((j) => {
        if (!filter) return true;
        if (filter.$or?.length) {
          return filter.$or.some((cond: any) => {
            const [k] = Object.keys(cond);
            const v = cond[k];
            if (v?.$regex)
              return new RegExp(v.$regex, v.$options).test(j[k] ?? '');
            return j[k] === v;
          });
        }
        return true;
      });
      return new MockArrayQuery(items as any);
    }),
    countDocuments: jest.fn(async (filter: any = {}) => {
      return (await createJobModelMock(data).find(filter).exec()).length;
    }),
    findById: jest.fn((id: string) => {
      return data.find((d) => String(d._id) === String(id)) ?? null;
    }),
  };
}

export function createApplicationModelMock(initial: any[] = []) {
  const data = [...initial];
  return {
    _data: data,
    create: jest.fn((doc: any) => {
      const _id = `${Math.random().toString(16).slice(2).padEnd(24, '0')}`;
      const created = { ...doc, _id, createdAt: doc.createdAt ?? new Date() };
      data.push(created);
      return created;
    }),
    find: jest.fn((filter: any = {}) => {
      const items = data.filter((a) => {
        if (!filter) return true;
        if (filter.job && String(a.job) !== String(filter.job)) return false;
        if (filter.$or?.length) {
          return filter.$or.some((cond: any) => {
            const [k] = Object.keys(cond);
            const v = cond[k];
            if (v instanceof RegExp) return v.test(a[k] ?? '');
            if (v?.$regex)
              return new RegExp(v.$regex, v.$options).test(a[k] ?? '');
            return a[k] === v;
          });
        }
        return true;
      });
      return new MockArrayQuery(items as any);
    }),
    countDocuments: jest.fn(async (filter: any = {}) => {
      return (await createApplicationModelMock(data).find(filter).exec()).length;
    }),
  };
}
