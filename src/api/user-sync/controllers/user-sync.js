'use strict';

const SYNC_SECRET = process.env.USER_SYNC_SECRET;

// Minimal BD-friendly normalizer. Prefer sending normalized from Next (see below).
function normalizePhone(input, countryHint = 'BD') {
  if (!input) return '';
  let p = String(input).trim();
  p = p.replace(/[^\d+]/g, ''); // keep digits and +
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
  async upsert(ctx) {
    try {
      const hdr = ctx.request.header['x-app-secret'] || ctx.request.header['x-user-sync-secret'];
      if (!SYNC_SECRET || hdr !== SYNC_SECRET) return ctx.unauthorized('Invalid sync secret');

      const body = ctx.request.body || {};
      const {
        email,                // optional for phone-only users
        username,             // optional; defaults to email or phone
        provider,             // 'google' | 'facebook' | 'credentials' etc.
        phone_number,         // raw or E.164
        phone_country,        // optional, e.g., 'BD'
        avatar_url,           // optional URL; handling Media upload is out-of-scope here
        date_of_birth,        // optional ISO
        gender,               // optional enum/string
        email_verified_at,    // optional ISO
        phone_verified_at,    // optional ISO
      } = body;

      const phoneNorm = normalizePhone(phone_number, phone_country || 'BD');

      // Lookups (phone first)
      const byPhone = await findUserByPhone(phoneNorm);
      const byEmail = await findUserByEmail(email);

      // Conflict: both exist and are different users
      if (byPhone && byEmail && byPhone.id !== byEmail.id) {
        ctx.status = 409;
        ctx.body = {
          ok: false,
          conflict: true,
          message: 'Phone and email map to different users. Manual merge needed.',
          byPhoneId: byPhone.id,
          byEmailId: byEmail.id,
        };
        return;
      }

      // Choose target: prefer phone hit, else email hit
      const target = byPhone || byEmail;

      const data = {
        // base identity
        email: email || byEmail?.email || byPhone?.email || null,
        username: username || email || phoneNorm || undefined,
        provider: provider || byPhone?.provider || byEmail?.provider || 'credentials',
        last_login: new Date(),

        // phone & email verified flags if you keep them as datetime fields
        ...(phoneNorm ? { phone_number: phoneNorm } : {}),
        ...(email_verified_at ? { email_verified_at } : {}),
        ...(phone_verified_at ? { phone_verified_at } : {}),

        // optional profile fields (only set if provided)
        ...(date_of_birth ? { date_of_birth } : {}),
        ...(gender ? { gender } : {}),
      };

      // NOTE: avatar_url -> you have a Media field 'avatar'.
      // Uploading a remote URL to Media requires /upload multipart flow.
      // We skip here; consider storing avatar_url in a TEXT field or implement upload later.

      const uid = 'plugin::users-permissions.user';
      let id;

      if (target?.id) {
        id = target.id;
        await strapi.entityService.update(uid, id, { data });
      } else {
        const createData = {
          ...data,
          confirmed: true, // auto-confirm OAuth/OTP-created users
          blocked: false,
        };
        const created = await strapi.entityService.create(uid, { data: createData });
        id = created?.id;
      }

      ctx.body = { ok: true, id };
    } catch (e) {
      strapi.log.error('[user-sync] upsert error', e);
      ctx.status = 500;
      ctx.body = { ok: false, error: 'server_error' };
    }
  },
};
