import { ethers } from 'ethers';

export const STAKING_CONTRACT_ADDRESS = '0xbC4dBC3964aC18dc7F8Dd270478CdDBAe4462F00';
export const HMMM_TOKEN_ADDRESS = '0x88Cf50037f8069071Cd50f641a81b369a5Fd3a42';
export const BSC_CHAIN_ID = 56;
export const BSC_RPC_URL = 'https://bsc-dataseed.binance.org/';

export const HMMM_TOKEN_ABI = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

export const STAKING_CONTRACT_ABI = [
  'function stake(uint256 amount) external',
  'function unstake(uint256 amount) external',
  'function getRewards() external',
  'function stakedBalance(address account) external view returns (uint256)',
  'function pendingRewards(address account) external view returns (uint256)',
  'function lockPeriod() external view returns (uint256)',
  'function cooldownPeriod() external view returns (uint256)',
  'function apr() external view returns (uint256)',
  'event Staked(address indexed user, uint256 amount)',
  'event Unstaked(address indexed user, uint256 amount)',
  'event RewardsClaimed(address indexed user, uint256 amount)'
];