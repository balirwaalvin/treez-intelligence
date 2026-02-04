export const usageService = {
  getDailyPromptCount: (): number => {
    const today = new Date().toISOString().split('T')[0];
    const key = `treez_usage_${today}`;
    return parseInt(localStorage.getItem(key) || '0', 10);
  },

  incrementPromptCount: (): void => {
    const today = new Date().toISOString().split('T')[0];
    const key = `treez_usage_${today}`;
    const current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, (current + 1).toString());
  },

  canSendMessage: (isGuest: boolean): boolean => {
    if (!isGuest) return true; // Signed-in users have no limit for now
    
    const count = usageService.getDailyPromptCount();
    return count < 3;
  },

  getRemainingPrompts: (): number => {
    const count = usageService.getDailyPromptCount();
    return Math.max(0, 3 - count);
  }
};
