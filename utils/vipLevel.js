// ==========================================
// 🎖️ VIP Level Configuration
// ==========================================

export const VIP_LEVELS = [
  { level: 'diamond', minDeposit: 1000000, label: '💎 Diamond', color: 'cyan' },
  { level: 'gold',    minDeposit: 200000,  label: '🥇 Gold',    color: 'amber' },
  { level: 'silver',  minDeposit: 50000,   label: '🥈 Silver',  color: 'gray' },
  { level: 'bronze',  minDeposit: 10000,   label: '🥉 Bronze',  color: 'orange' },
  { level: 'none',    minDeposit: 0,       label: '—',          color: 'slate' },
];

// ==========================================
// Calculate VIP level from totalDeposit
// ==========================================
export function calculateVipLevel(totalDeposit = 0) {
  for (const tier of VIP_LEVELS) {
    if (totalDeposit >= tier.minDeposit) {
      return tier.level;
    }
  }
  return 'none';
}

// ==========================================
// Get VIP Level Info (label, color)
// ==========================================
export function getVipInfo(level = 'none') {
  const tier = VIP_LEVELS.find(t => t.level === level);
  return tier || VIP_LEVELS[VIP_LEVELS.length - 1];
}

// ==========================================
// Get all levels (UI-র জন্য)
// ==========================================
export function getAllVipLevels() {
  return VIP_LEVELS;
}