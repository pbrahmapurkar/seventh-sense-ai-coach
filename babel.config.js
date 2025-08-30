// Babel config for Expo with cached preset
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: []
  };
};
