import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export interface TierSlots {
  tierId: string;
  maxSlots: number;
  usedSlots: number;
  remainingSlots: number;
}

export async function getCurrentAmount() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT current_amount FROM campaign_progress 
        ORDER BY last_updated DESC LIMIT 1
      `);
      return result.rows[0]?.current_amount || 400;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return 400;
  }
}

export async function getTierSlots(): Promise<TierSlots[]> {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT 
          tier_id as "tierId",
          max_slots as "maxSlots",
          used_slots as "usedSlots",
          max_slots - used_slots as "remainingSlots"
        FROM tier_slots
        ORDER BY tier_id
      `);
      return result.rows;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

export async function addDeposit(tierId: string, amount: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Check if slots are available
    const slotsResult = await client.query(`
      SELECT used_slots, max_slots
      FROM tier_slots
      WHERE tier_id = $1
      FOR UPDATE
    `, [tierId]);

    if (slotsResult.rows.length === 0) {
      throw new Error('Tier not found');
    }

    const { used_slots, max_slots } = slotsResult.rows[0];
    if (used_slots >= max_slots) {
      throw new Error('No slots available');
    }

    // Update slots
    await client.query(`
      UPDATE tier_slots
      SET used_slots = used_slots + 1,
          last_updated = CURRENT_TIMESTAMP
      WHERE tier_id = $1
    `, [tierId]);

    // Add deposit record
    await client.query(`
      INSERT INTO campaign_deposits (tier_id, amount)
      VALUES ($1, $2)
    `, [tierId, amount]);

    // Update progress
    await client.query(`
      INSERT INTO campaign_progress (current_amount, last_updated)
      SELECT 
        COALESCE(
          (SELECT current_amount FROM campaign_progress ORDER BY last_updated DESC LIMIT 1),
          0
        ) + $1,
        CURRENT_TIMESTAMP
    `, [amount]);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    return false;
  } finally {
    client.release();
  }
}
