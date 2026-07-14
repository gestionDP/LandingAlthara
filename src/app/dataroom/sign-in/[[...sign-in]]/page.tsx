import { SignIn } from '@clerk/nextjs';

export default function DataroomSignInPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
      <p className="max-w-md text-center text-sm text-[#1c3742]/70">
        Acceso exclusivo por invitación. Si aún no tiene cuenta, utilice el enlace de
        activación que le enviamos por email o contacte con su gestor en Althara.
      </p>
      <SignIn forceRedirectUrl="/dataroom" />
    </div>
  );
}
