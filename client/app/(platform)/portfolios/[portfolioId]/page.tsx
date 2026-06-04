import { PortfolioDetailPage } from "@/components/shared/wealth-pages";

export default async function Page({
  params,
}: {
  params: Promise<{ portfolioId: string }>;
}) {
  const { portfolioId } = await params;
  return <PortfolioDetailPage portfolioId={portfolioId} />;
}
