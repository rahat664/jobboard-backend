import { BasicAuthGuard } from '../src/common/guards/basic-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

const makeCtx = (authHeader?: string) => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers: authHeader ? { authorization: authHeader } : {},
      }),
    }),
  } as any;
};

describe('BasicAuthGuard', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...OLD_ENV,
      ADMIN_USER: 'mainAdmin',
      ADMIN_PASS: 'mainPass',
    };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  it('allows with correct credentials', () => {
    const guard = new BasicAuthGuard();
    const token = Buffer.from('mainAdmin:mainPass', 'utf8').toString('base64');
    const ctx = makeCtx(`Basic ${token}`);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('rejects when missing header', () => {
    const guard = new BasicAuthGuard();
    const ctx = makeCtx(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects when invalid scheme', () => {
    const guard = new BasicAuthGuard();
    const ctx = makeCtx('Bearer abc');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects when wrong creds', () => {
    const guard = new BasicAuthGuard();
    const token = Buffer.from('x:y', 'utf8').toString('base64');
    const ctx = makeCtx(`Basic ${token}`);
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });

  it('rejects when invalid base64', () => {
    const guard = new BasicAuthGuard();
    const ctx = makeCtx('Basic !!!notbase64!!!');
    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
  });
});
