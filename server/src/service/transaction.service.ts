import prisma from "../lib/prisma.js";

interface CreateTransactionInput {
  accountId: string;
  marketAssetId?: string |  undefined;
  type: "BUY" | "SELL" | "DEPOSIT" | "WITHDRAWAL" | "DIVIDEND" | "INTEREST" | "TRANSFER";
  quantity?: number | undefined;
  price?: number | undefined;
  amount?: number | undefined;
  fees?: number | undefined;
  currency: string;
  executedAt: string;
}

export const createTransactionService = async (
  clerkUserId: string,
  data: CreateTransactionInput
) => {
  // Resolve user
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify account belongs to this user
  const account = await prisma.account.findFirst({
    where: { id: data.accountId, userId: user.id },
  });
  if (!account)
    throw new Error("Account not found or does not belong to user");

  if((data.type == "BUY" || data.type == "SELL") && ( !data.quantity || !data.price || !data.marketAssetId)){
    throw new Error("BUY AND SELL transactions require marketAssetId, quantity and price.")
  }

  if(["DEPOSIT","WITHDRAWAL","DIVIDEND","INTEREST"].includes(data.type) && !data.amount
  ){
    throw new Error(`${data.type} transaction requires amount`);
  }


  // If marketAssetId provided, verify it exists
  if (data.marketAssetId) {
    const marketAsset = await prisma.marketAsset.findUnique({
      where: { id: data.marketAssetId },
    });
    if (!marketAsset) throw new Error("Market asset not found");
  }

  return prisma.$transaction(
    async (tx)=>{
      const transactionAmount = data.amount ?? ((data.quantity ?? 0)*(data.price??0));
      const fees = data.fees ?? 0;
      let currentBalance = Number(account.currentBalance ?? 0);

      switch(data.type){
        case "DEPOSIT":
        case "DIVIDEND":
        case "INTEREST":
          currentBalance += transactionAmount;
          break;
        case "WITHDRAWAL":
          currentBalance -= transactionAmount;
          if(currentBalance < 0){
            throw new Error("Insufficient Balance");
          }
          break;
        case "BUY":
          currentBalance -= transactionAmount+fees;
          if(currentBalance < 0){
            throw new Error("Insufficient Balance");
          }
          break;
        case "SELL":
          currentBalance += transactionAmount - fees;
          break;
      }
      if(data.type == "BUY"){
        const holding= await tx.userMarketAsset.findFirst({
          where:{
            userId: user.id,
            marketAssetId: data.marketAssetId!,
          }
        });

        if(!holding){
          await tx.userMarketAsset.create({
            data:{
              userId: user.id,
              marketAssetId: data.marketAssetId!,
              quantity: data.quantity!,
              averageCost: data.price!,
            },
          });
        }else{
          const oldQty = Number(holding.quantity);
          const oldCost = Number(holding.averageCost);
          const newQty = oldQty + data.quantity!;
          const avgCost = (oldQty*oldCost + data.quantity!*data.price!)/newQty;

          await tx.userMarketAsset.update({
            where:{
              id: holding.id,
            },
            data:{
              quantity: newQty,
              averageCost: avgCost,
            }
          })
        }
      }

      if(data.type=="SELL"){
        const holding = await tx.userMarketAsset.findFirst({
          where:{
            userId: user.id,
            marketAssetId: data.marketAssetId!
          }
        });

        if(!holding){
          throw new Error("User don't own this asset");
        }

        const remaining = Number(holding.quantity)- data.quantity!;
        if(remaining <0){
          throw new Error("Cannot sell more than owned");
        }

        if(remaining === 0){
          await tx.userMarketAsset.delete({
            where:{
              id: holding.id,
            }
          })
        }else{
          await tx.userMarketAsset.update({
            where:{
              id: holding.id,
            },
            data:{
              quantity: remaining,
            }
          })
        }

      }

      await tx.account.update({
        where:{
          id:account.id
        },
        data:{
          currentBalance,
        }
      })

      const transaction = await tx.transaction.create({
        data:{
          userId: user.id,
          accountId: data.accountId,
          marketAssetId: data.marketAssetId ?? null,
          type: data.type,
          quantity: data.quantity ?? null,
          price: data.price ?? null,
          amount: transactionAmount,
          fees,
          currency: data.currency,
          executedAt: new Date(data.executedAt)

        },
        include:{
          marketAsset: true,
          account: true,
        }
      })
      return transaction;
    }
  )
};

export const getUserTransactionsService = async (clerkUserId: string) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    include: {
      marketAsset: true,
      account: true,
    },
    orderBy: { executedAt: "desc" },
  });

  return transactions;
};

export const getAccountTransactionsService = async (
  clerkUserId: string,
  accountId: string
) => {
  const user = await prisma.user.findUnique({ where: { clerkUserId } });
  if (!user) throw new Error("User not found");

  // Verify account belongs to user
  const account = await prisma.account.findFirst({
    where: { id: accountId, userId: user.id },
  });
  if (!account)
    throw new Error("Account not found or does not belong to user");

  const transactions = await prisma.transaction.findMany({
    where: { accountId },
    include: {
      marketAsset: true,
      account: true,
    },
    orderBy: { executedAt: "desc" },
  });

  return transactions;
};