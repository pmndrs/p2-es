module.exports = {
    root: true,
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
        'plugin:prettier/recommended',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:storybook/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            tsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    rules: {
        'import/no-extraneous-dependencies': [
            'off',
            { devDependencies: ['**/*.spec.ts', '**/*.js', '**/*.config.js'] },
        ],
        '@typescript-eslint/no-non-null-assertion': 'off',
        'import/prefer-default-export': 'off',
        indent: 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'off',
            },
        ],
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error'],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'no-underscore-dangle': 'off',
        'array-callback-return': 'off',
        'import/no-cycle': 'off',
        'no-plusplus': 'off',
        'no-param-reassign': 'off',
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            },
        ],
        'class-methods-use-this': 'off',
        'no-restricted-syntax': [
            'off',
            'ForInStatement',
            'LabeledStatement',
            'WithStatement',
        ],
        '@typescript-eslint/no-empty-function': 'off',
        'max-classes-per-file': 'off',
        'consistent-return': 'off',
    },
    settings: {
        'import/resolver': {
            typescript: {},
        },
    },
}
