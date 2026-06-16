export const getDonorStats = (donorId) => {
  if (!donorId) return {
    donations: 0,
    isVerified: false,
    isEmergencyReady: false,
    lastDonationDate: null,
    memberSince: 'N/A'
  };

  const idStr = donorId.toString();
  let hash = 0;
  for (let i = 0; i < idStr.length; i++) {
    hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const donations = Math.abs(hash % 14) + 1; // 1 to 14 donations
  const isVerified = Math.abs(hash % 3) > 0; // 66% verified
  const isEmergencyReady = Math.abs(hash % 2) === 0; // 50% emergency ready
  
  // Last donation date within the last 180 days
  const daysAgo = Math.abs(hash % 150) + 10; // 10 to 160 days ago
  const lastDonationDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  // Member since (1.5 to 3 years ago)
  const memberDaysAgo = Math.abs(hash % 600) + 400;
  const memberSince = new Date(Date.now() - memberDaysAgo * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return {
    donations,
    isVerified,
    isEmergencyReady,
    lastDonationDate,
    memberSince,
  };
};
