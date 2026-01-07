// src/api/loyalty/services/loyalty.js

const tierConfig = [
  { name: "VIP", min: 50001, tk: 1.0, pts: 120 },
  { name: "Platinum", min: 20001, tk: 0.9, pts: 130 },
  { name: "Gold", min: 10001, tk: 0.75, pts: 140 },
  { name: "Silver", min: 5001, tk: 0.65, pts: 150 },
  { name: "Bronze", min: 0, tk: 0.5, pts: 150 }
];

function getTier(totalPoints) {
  return tierConfig.find(t => totalPoints >= t.min) || tierConfig[tierConfig.length-1];
}
