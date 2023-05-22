# ai-story-learn

Japanese study tool that generates stories with specified words.

By default, it will get random words from 44k most frequent 
(4 words from the first 22k and 4 words from the second half).

By clicking on the highlighted word we can 

---

## Quick setup

Create .env file with your OpenAI API key:

```sh
VITE_APP_API_KEY=your-api-key
```

Install and run:

```sh
npm i

npm run dev
```

---

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### Envs

```
touch .env
VITE_APP_API_KEY=your-api-key
```
