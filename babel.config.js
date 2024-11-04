module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      "nativewind/babel",
      // Remove 'react-native-vector-icons' plugin if not using it
    ],
  };
};
