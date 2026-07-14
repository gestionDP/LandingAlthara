/** INVESTOR — envío y estado del KYC (verificación de identidad). */
import { z } from 'zod';
import { requireLinkedInvestor, errorResponse } from '@/dataroom/lib/authz';
import { submitKyc, getKycForInvestor } from '@/dataroom/services/kyc';

export const runtime = 'nodejs';

const Body = z.object({
  documentType: z.enum(['dni', 'nie', 'passport', 'other']),
  documentNumber: z.string().trim().min(3).max(60),
  phone: z.string().trim().min(5).max(40),
  residenceCountry: z.string().trim().length(2),
  investorProfile: z.object({
    investorType: z.string().optional(),
    ticketRange: z.string().optional(),
    experience: z.string().optional(),
  }).passthrough(),
});

export async function GET() {
  try {
    const investor = await requireLinkedInvestor();
    const data = await getKycForInvestor(investor);
    return Response.json(data ?? { submitted: false });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(req: Request) {
  try {
    const investor = await requireLinkedInvestor();
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return Response.json({ error: 'invalid_request' }, { status: 400 });
    await submitKyc(investor.id, parsed.data, { type: 'investor', id: investor.id, email: investor.email });
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
