import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

import { SupabaseAuthGuard } from './supabase-auth.guard';

describe('SupabaseAuthGuard', () => {
  const getContext = (request: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    }) as unknown as ExecutionContext;

  it('throws when authorization header missing', async () => {
    const supabaseServiceMock = {
      supabase: {
        auth: {
          getUser: jest.fn(),
        },
      },
    };

    const guard = new SupabaseAuthGuard(supabaseServiceMock as never);

    await expect(
      guard.canActivate(getContext({ headers: {} })),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('attaches supabase user on success', async () => {
    const supabaseServiceMock = {
      supabase: {
        auth: {
          getUser: jest
            .fn()
            .mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
        },
      },
    };

    const request: Record<string, unknown> = {
      headers: {
        authorization: 'Bearer test-token',
      },
    };

    const guard = new SupabaseAuthGuard(supabaseServiceMock as never);

    const result = await guard.canActivate(getContext(request));

    expect(result).toBe(true);
    expect(request.user).toEqual({ id: '123' });
    expect(request.accessToken).toBe('test-token');
  });
});
