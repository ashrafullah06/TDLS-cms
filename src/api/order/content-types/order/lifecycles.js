// src/api/order/content-types/order/lifecycles.js

module.exports = {
  async afterCreate(event) {
    const order = event.result;
    if (order.status !== "completed") return;

    const userId = order.user.id;

    // Check if first order
    const userOrders = await strapi.db.query('api::order.order').findMany({ where: { user: userId, status: "completed" } });
    if (userOrders.length !== 1) return;

    // Find referral record
    const referral = await strapi.db.query('api::referral.referral').findOne({ where: { referred: userId, isRedeemed: false } });
    if (!referral) return;

    // Award points to referrer (update referrer's loyalty and add to LoyaltyPointHistory)
    const referrerId = referral.referrer.id;
    await strapi.db.query('api::loyaltypointhistory.loyaltypointhistory').create({
      data: {
        user: referrerId,
        points: 500,
        activity: "Referral reward: friend's first order",
        date: new Date()
      }
    });

    // Mark referral as redeemed
    await strapi.db.query('api::referral.referral').update({
      where: { id: referral.id },
      data: { isRedeemed: true, activatedAt: new Date() }
    });
  }
};
