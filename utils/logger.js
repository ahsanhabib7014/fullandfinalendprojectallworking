import AuditLog from '@/models/AuditLog';

export async function logAdminAction(req, decodedToken, action, targetUser, details) {
  try {
    // IP Address বের করা
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // টোকেন থেকে আইডি ও ফোন ডায়নামিকভাবে নেওয়া
    const adminId = decodedToken?.userId || decodedToken?.id || decodedToken?._id;
    const adminPhone = decodedToken?.phone || decodedToken?.email || decodedToken?.username || 'Admin';

    if (!adminId) {
      console.error('AuditLog Error: Admin ID not found in decoded token');
      return;
    }

    await AuditLog.create({
      adminId,
      adminPhone,
      action,
      targetUser: targetUser ? String(targetUser) : 'N/A',
      details: details || '',
      ipAddress: ip
    });

    console.log('✅ Audit Log Saved Successfully!');
  } catch (err) {
    console.error('❌ Audit log creation failed:', err);
  }
}