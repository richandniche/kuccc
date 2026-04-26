import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CompanionClient } from "./client";

export const dynamic = "force-dynamic";

export default async function CompanionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const [call] = await db
    .select()
    .from(schema.calls)
    .where(and(eq(schema.calls.id, id), eq(schema.calls.callerId, user.id)))
    .limit(1);

  if (!call) notFound();

  // If the call already has an outcome, redirect to review
  if (call.outcome) {
    redirect(`/calls/${id}`);
  }

  return (
    <CompanionClient
      callId={call.id}
      prospectName={call.prospectName}
      prospectEmail={call.prospectEmail}
      prospectPhone={call.prospectPhone}
      programInterest={call.programInterest}
    />
  );
}
