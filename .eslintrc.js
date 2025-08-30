// ESLint config using Expo's universe preset
module.exports = {
  root: true,
  extends: ['universe/native'],
  rules: {
    'no-unused-vars': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }]
  }
};
