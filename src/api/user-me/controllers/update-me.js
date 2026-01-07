'use strict';

const SYNC_SECRET = process.env.USER_SYNC_SECRET;

// Minimal BD normalizer; you can extend with libphonenumber later
function normalizePhone(input, countryHint = 'BD') {
  if (!input) return '';
  let p = String(input).trim().replace(/[^\d+]/g, '');
  if (countryHint === 'BD') {
    if (p.startsWith('+880')) return '+880' + p.slice(4);
    if (p.startsWith('880')) return '+880' + p.slice(3);
    if (p.startsWith('0') && p.length === 11) return '+880' + p.slice(1);
  }
  if (!p.startsWith('+')) p = '+' + p;
  return p;
}

async function findUserByEmail(email) {
  if (!email) return null;
  const res = await strapi.entityService.findMany('plugin::users-permissions.user', {
    filters: { email },
    limit: 1,
  });
  return res?.[0] || null;
}

async function findUserByPhone(phone) {
  if (!phone) return null;
  const res = await strapi.entityService.findMany('plugin::users-permissions.user', {
    filters: { phone_number: phone },
    limit: 1,
  });
  return res?.[0] || null;
}

module.exports = {
  async update(ctx) {
    try {
      const hdr =
        ctx.request.header['x-app-secret'] || ctx.request.header['x-user-sync-secret'];
      if (!SYNC_SECRET || hdr !== SYNC_SECRET) {
        return ctx.unauthorized('Invalid sync secret');
      }

      const body = ctx.request.body || {};
      const {
        // identifiers (at least one must be present)
        phone_number,
        email,

        // optional updates (only these fields are allowed)
        name,
        date_of_birth,
        gender,
        // NOTE: avatar is a Media field; proper upload is a separate flow. Skip here.
      } = body;

      const phoneNorm = normalizePhone(phone_number, 'BD');

      // 1) Find target (phone first, fallback email)
      const byPhone = await findUserByPhone(phoneNorm);
      const byEmail = await findUserByEmail(email);

      // if neither found, we don't create here (this is "update me")
      const target = byPhone || byEmail;
      if (!target) {
        ctx.status = 404;
        ctx.body = { ok: false, message: 'User not found (by phone/email)' };
        return;
      }

      // 2) If changing phone, ensure uniqueness
      if (phoneNorm && (!target.phone_number || target.phone_number !== phoneNorm)) {
        const someoneElse = await findUserByPhone(phoneNorm);
        if (someoneElse && someoneElse.id !== target.id) {
          ctx.status = 409;
          ctx.body = { ok: false, message: 'Phone already in use by another account' };
          return;
        }
      }

      // 3) Prepare safe update data
      const data = {
        last_login: new Date(),
      };
      if (typeof name === 'string' && name.trim()) data.username = name.trim();
      if (typeof date_of_birth === 'string' && date_of_birth) data.date_of_birth = date_of_birth;
      if (typeof gender === 'string' && gender) data.gender = gender;
      if (phoneNorm) data.phone_number = phoneNorm;
      if (email && !target.email) data.email = email; // do not freely change email here

      // 4) Update
      const uid = 'plugin::users-permissions.user';
      const updated = await strapi.entityService.update(uid, target.id, { data });

      // 5) Return minimal safe payload
      ctx.body = {
        ok: true,
        user: {
          id: updated.id,
          email: updated.email,
          username: updated.username,
          phone_number: updated.phone_number,
          date_of_birth: updated.date_of_birth,
          gender: updated.gender,
          last_login: updated.last_login,
        },
      };
    } catch (e) {
      strapi.log.error('[user-update-me] error', e);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'server_error' };
    }
  },
};
