import { redirect } from "next/navigation";

export default async function ListeningReviewRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/reviews/speaking/${id}`);
}
