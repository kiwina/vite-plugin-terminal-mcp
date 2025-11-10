import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  ignores: [
    'dist',
    'node_modules',
    '*.d.ts',
    'playground',
    '*.md',
    'nuxt-mcp',
  ],
  rules: {
    'no-undef': 'off',
    'import/named': 'off',
    'no-console': 'off',
    'ts/ban-ts-comment': 'off',
    'ts/explicit-function-return-type': 'off',
    'antfu/top-level-function': 'off',
    'node/prefer-global/process': 'off',
    'unused-imports/no-unused-vars': 'warn',
  },
})
