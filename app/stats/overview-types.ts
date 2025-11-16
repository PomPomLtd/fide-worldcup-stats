// Type definitions for overview statistics
export interface AwardFrequencyData {
  totalAwards: number;
  awardsByType: Record<string, number>;
  mostCommon?: {
    award: string;
    displayName: string;
    appearances: number;
    percentage: number;
  };
  leastCommon?: {
    award: string;
    displayName: string;
    appearances: number;
    percentage: number;
  };
  sortedByFrequency: Array<{
    key: string;
    displayName: string;
    appearances: number;
    percentage: number;
  }>;
}
