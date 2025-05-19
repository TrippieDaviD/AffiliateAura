import { User } from '@/api/entities';

export default class SettingsService {
  static async initialize() {
    try {
      const user = await User.me();
      if (!user.dub_integration || !user.dub_integration.enabled) {
        await User.updateMyUserData({
          dub_integration: {
            enabled: true // Auto-enable dub.co integration for all users
          }
        });
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
    }
  }
}