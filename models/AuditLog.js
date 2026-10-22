import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminPhone: { type: String, required: true },
  action: { type: String, required: true }, // যেমন: 'APPROVE_DEPOSIT', 'BLOCK_USER'
  targetUser: { type: String }, // যার ওপর অ্যাকশন নেওয়া হয়েছে
  
  // ✅ এই দুটি ফিল্ড এখানে যোগ করতে হবে
  oldData: { type: Object, default: null },
  newData: { type: Object, default: null },

  details: { type: String }, // বিস্তারিত বিবরণ
  ipAddress: { type: String }, // কোন আইপি থেকে করা হয়েছে
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);