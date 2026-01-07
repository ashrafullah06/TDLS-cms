// ./src/api/referral/content-types/referral/lifecycles.js

module.exports = {
  /**
   * Check required, uniqueness, and anti-abuse for referrals.
   */
  async beforeCreate(event) {
    const { data } = event.params;
    await validateReferral(data);
  },
  async beforeUpdate(event) {
    const { data } = event.params;
    await validateReferral(data, event.params.where?.id);
  }
};

/**
 * Enforces required fields, uniqueness, and anti-abuse for Referral records.
 * @param {object} data - The Referral data object
 * @param {number} [updatingId] - The ID if updating an existing referral
 */
async function validateReferral(data, updatingId = null) {
  // ---- 1. Required fields ----
  if (!data.referrer) throw new Error("Referrer is required.");
  if (!data.referred) throw new Error("Referred user is required.");
  if (data.referrer === data.referred) throw new Error("Referrer and referred user cannot be the same.");

  // ---- 2. Only one referral per referred user (enforced, including update) ----
  // Check if referred is already used in another referral
  const where = { referred: data.referred };
  if (updatingId) where.id = { $ne: updatingId }; // Exclude self if updating

  const existing = await strapi.db.query('api::referral.referral').findOne({ where });
  if (existing) throw new Error("This user has already been referred.");

  // ---- 3. Anti-abuse: block chains of referrals (prevent loops) ----
  // For example: User A refers B, B refers A (should block if you want)
  // Also blocks circular chains like A->B->C->A
  // (Advanced: Here we only block direct mutual referral)
  const reverse = await strapi.db.query('api::referral.referral').findOne({
    where: { referrer: data.referred, referred: data.referrer }
  });
  if (reverse) throw new Error("Mutual/circular referrals are not allowed.");

  // ---- 4. [Optional] Block duplicate by same referrer to same referred (shouldn't happen if unique above, but double safe) ----
  const dupe = await strapi.db.query('api::referral.referral').findOne({
    where: { referrer: data.referrer, referred: data.referred }
  });
  if (dupe && (!updatingId || dupe.id !== updatingId))
    throw new Error("Duplicate referral not allowed.");

  // ---- 5. [Optional, extend as needed] Block referral for users with existing orders (if you want stricter logic) ----
  // const orders = await strapi.db.query('api::order.order').findOne({ where: { user: data.referred, status: 'completed' } });
  // if (orders) throw new Error("Cannot refer a user who has already placed an order.");
}
