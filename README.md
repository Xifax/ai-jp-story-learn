# ai-jp-story-learn

![demo](data/mpv.gif)

Japanese study tool that generates stories with specified words.
Uses OpenAI API, so the valid key should be provided.

By default, it will get random words from 44k most frequent 
(4 words from the first 22k and 4 words from the second half).
Will replace newline with commas for pasted strings.

By clicking on the highlighted word we can either generate an example or a short story.
At times, JP tokenizer (kuroshiro) splits phrases incorrectly, maybe should be replaced with someting better.

**NB: This app should be launched locally, otherwise API key will be visible in the query, which is not good.**

---

## Quick setup

Create .env file with your OpenAI API key:

```sh
VITE_APP_API_KEY=your-api-key
```

You'll require node.js and npm.

In project folder, install dependencies and run:

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

### ENVS

```sh
touch .env
VITE_APP_API_KEY=your-api-key
```
