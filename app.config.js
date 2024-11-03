export default {
  // ...existing config
  plugins: [
    // ...other plugins
    [
      'expo-notifications',
      {
        icon: './assets/notification-icon.png',
        color: '#ffffff',
        sounds: ['./assets/notification-sound.wav']
      }
    ]
  ],
  // ...rest of config
};
