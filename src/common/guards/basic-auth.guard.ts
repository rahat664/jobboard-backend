import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>() as any;
    const header = req.headers['authorization'] as string | undefined;

    if (!header || !header.startsWith('Basic ')) {
      throw new UnauthorizedException('Missing Basic Authorization header');
    }

    const base64 = header.slice('Basic '.length);
    let decoded: string;
    try {
      decoded = Buffer.from(base64, 'base64').toString('utf8');
    } catch {
      throw new UnauthorizedException('Invalid Basic token');
    }

    const [user, pass] = decoded.split(':');
    if (user !== process.env.ADMIN_USER || pass !== process.env.ADMIN_PASS) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return true;
  }
}
