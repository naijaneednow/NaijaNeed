import { Request, Response } from 'express';
import { db } from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { sendSMS } from '../utils/sms';

// In-memory store for OTPs (for production, use a database table or Redis)
const otpStore = new Map<string, { code: string; expires: number }>();

export const registerOrLoginCandidate = async (req: Request, res: Response) => {
  const { phone, name, email, stateId, lgaId, area } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  try {
    // 1. Check if user already exists
    const findResult = await db.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
    const existingUser = findResult.rows[0];

    let user;
    let deviceToken;

    if (existingUser) {
      // If user has a password, they should use the login path
      if (existingUser.password) {
        return res.status(401).json({ 
          error: 'This phone number is registered with a password. Please sign in instead.',
          requiresPassword: true 
        });
      }

      user = existingUser;
      deviceToken = user.device_token || uuidv4();

      // Update existing user profile if info exists
      const updateQuery = `
        UPDATE users 
        SET name = COALESCE($1, name), 
            email = COALESCE($2, email), 
            state_id = COALESCE($3, state_id), 
            lga_id = COALESCE($4, lga_id), 
            area = COALESCE($5, area),
            device_token = $6
        WHERE id = $7
        RETURNING *
      `;
      const updateResult = await db.query(updateQuery, [name, email, stateId, lgaId, area, deviceToken, user.id]);
      user = updateResult.rows[0];
    } else {
      // 2. Create new user
      deviceToken = uuidv4();
      const insertQuery = `
        INSERT INTO users (phone, name, email, state_id, lga_id, area, device_token)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const insertValues = [phone, name, email, stateId, lgaId, area, deviceToken];
      const insertResult = await db.query(insertQuery, insertValues);
      user = insertResult.rows[0];
    }

    // 3. Set standard cookie
    res.cookie('nn_device', deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    });

    return res.status(200).json({
      message: 'Authenticated successfully.',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        stateId: user.state_id,
        lgaId: user.lga_id,
        area: user.area
      }
    });
  } catch (error) {
    console.error('Registration/Login error:', error);
    return res.status(500).json({ error: 'Failed to authenticate.' });
  }
};

export const loginCandidate = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required.' });
  }

  try {
    const findResult = await db.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
    const user = findResult.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'Account not found. Please register first.' });
    }

    const { password } = req.body;

    // If user has a password set, they MUST provide it
    if (user.password) {
      if (!password) {
        return res.status(401).json({ 
          error: 'Password required.', 
          requiresPassword: true 
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password.' });
      }
    }

    const deviceToken = user.device_token || uuidv4();
    
    // Update device token if it was missing
    if (!user.device_token) {
      await db.query('UPDATE users SET device_token = $1 WHERE id = $2', [deviceToken, user.id]);
    }

    res.cookie('nn_device', deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000 // 1 year
    });

    return res.status(200).json({
      message: 'Logged in successfully.',
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        stateId: user.state_id,
        lgaId: user.lga_id,
        area: user.area,
        hasPassword: !!user.password
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login.' });
  }
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  return res.status(200).json({
    ...req.user,
    hasPassword: !!(req.user as any).password
  });
};

export const updateUserPassword = async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  const userId = (req.user as any).id;

  if (!newPassword || newPassword.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, userId]);

    return res.status(200).json({ message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Update password error:', error);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
};

export const requestPasswordReset = async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required.' });

  try {
    const findResult = await db.query('SELECT * FROM users WHERE phone = $1 LIMIT 1', [phone]);
    if (!findResult.rows[0]) {
      return res.status(404).json({ error: 'Account not found.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(phone, { code: otp, expires });

    await sendSMS(phone, `Your NaijaNeed password reset code is: ${otp}. Valid for 10 minutes.`);

    return res.status(200).json({ message: 'Reset code sent to your phone.' });
  } catch (error) {
    console.error('Request password reset error:', error);
    return res.status(500).json({ error: 'Failed to send reset code.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { phone, otp, newPassword } = req.body;

  if (!phone || !otp || !newPassword) {
    return res.status(400).json({ error: 'Phone, OTP, and new password are required.' });
  }

  const stored = otpStore.get(phone);
  if (!stored || stored.code !== otp || Date.now() > stored.expires) {
    return res.status(400).json({ error: 'Invalid or expired OTP.' });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const deviceToken = uuidv4();
    
    await db.query('UPDATE users SET password = $1, device_token = $2 WHERE phone = $3', [hashedPassword, deviceToken, phone]);
    otpStore.delete(phone);

    // Auto login
    res.cookie('nn_device', deviceToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 365 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({ message: 'Password reset successfully. You are now logged in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password.' });
  }
};
