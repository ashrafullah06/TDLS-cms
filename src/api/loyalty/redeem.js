// Receives: { userId, amount }
import { getTier } from "@/lib/loyalty-tiers";
export default async function handler(req, res) {
  const { userId, amount } = req.body;
  // 1. Fetch user's lifetime points and current points
  const user = await getUser(userId);
  const tier = getTier(user.lifetime_points);

  // 2. Check minimums and multiples
  if (amount < tier.pts || amount % tier.pts !== 0)
    return res.status(400).json({ error: `Redeem in multiples of ${tier.pts}` });

  if (amount > user.current_points)
    return res.status(400).json({ error: "Not enough points." });

  const blocks = Math.floor(amount / tier.pts);
  const walletCredit = blocks * tier.tk;

  // 3. Update user: subtract points, add to wallet, add LoyaltyPointHistory
  await user.deductPoints(blocks * tier.pts);
  await user.addToWallet(walletCredit);
  await addRedemptionHistory(userId, blocks * tier.pts, walletCredit, new Date());

  res.json({ walletCredit });
}
