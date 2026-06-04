import { AccountDetailPage } from "@/components/shared/wealth-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  return <AccountDetailPage accountId={accountId} />;
}
