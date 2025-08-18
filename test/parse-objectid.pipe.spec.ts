import { ParseObjectIdPipe } from '../src/common/pipes/objectid.pipe';

describe('ParseObjectIdPipe', () => {
  const pipe = new ParseObjectIdPipe();

  it('passes valid ObjectId', () => {
    const valid = '64d1a47f3d6e2a001f8a1e2c';
    expect(pipe.transform(valid)).toBe(valid);
  });

  it('throws on invalid ObjectId', () => {
    expect(() => pipe.transform('not-an-id')).toThrow();
  });
});
