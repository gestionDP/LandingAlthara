/**
 * Clerk middleware — ONLY active for the dataroom area. The public landing
 * keeps working untouched (matcher excludes everything else).
 *
 * Public dataroom routes (pre-auth): activation, sign-in, and the two
 * invitation endpoints (which carry their own token validation + rate limit).
 */
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicDataroomRoute = createRouteMatcher([
  '/dataroom/activate(.*)',
  '/dataroom/sign-in(.*)',
  '/api/dataroom/invitations/validate',
  '/api/dataroom/invitations/complete',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicDataroomRoute(req)) return;
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return Response.json({ error: 'unauthenticated' }, { status: 401 });
    }
    return redirectToSignIn({ returnBackUrl: req.url });
  }
});

export const config = {
  matcher: ['/dataroom/:path*', '/api/dataroom/:path*'],
};
