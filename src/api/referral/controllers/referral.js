// createReferral(referrerId, referredId) - check for uniqueness, no self-referral
module.exports = {
  async create(ctx) {
    const { referrer, referred } = ctx.request.body;
    if (!referrer || !referred || referrer === referred)
      return ctx.badRequest("Invalid referrer or referred.");

    // Check referred not already used
    const existing = await strapi.db.query('api::referral.referral').findOne({ where: { referred } });
    if (existing)
      return ctx.badRequest("This user has already been referred.");

    // Create referral
    const record = await strapi.db.query('api::referral.referral').create({
      data: { referrer, referred, isRedeemed: false }
    });
    ctx.send(record);
  }
};
