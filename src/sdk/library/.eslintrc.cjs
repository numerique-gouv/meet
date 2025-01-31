module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'main/next',
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.app.json', './tsconfig.node.json'],
  },
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@next/next/no-html-link-for-pages': 'off'
  },
}
