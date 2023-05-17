<script setup>
defineProps({})
</script>

<script>
// Global variables (meh)
let openai;
const prompt = `簡単なストーリーを作成してください。ストーリージャンルは...であるべきです。
N単語以内でお願いします。このストーリーには以下の単語を含める必要があります：`
const examplesPrompt = ` という慣用表現を使った例を作成してください。`

import { Configuration, OpenAIApi } from 'openai'
// import { isKanji, stripOkurigana } from 'wanakana'
import Kuroshiro from 'kuroshiro'
import * as lindera from 'lindera-js'
export default {
  data() {
    return {
      // requiredWords: 'hollow, majesty, fanatic, precise, balderdash',
      requiredWords: '',
      story: '',
      storyLength: 50,
      words: [],
      lookupResults: [],
      multiLookupResults: [],
      // TODO: implement list
      lookupsList: [],
      loading: false,
      storyType: 'サイエンスフィクション',
      types: ['サイエンスフィクション', 'マジックリアリズム', '異世界', '綺談', '寓話']
    }
  },
  methods: {
    isLink(word) {
      // return isKanji(stripOkurigana(word))
      return Kuroshiro.Util.hasKanji(word)
    },
    checkPaste(event) {
      // let data = event.clipboardData.getData('text/plain')
      // console.log(data)
      // data = data.replaceAll("\n", ", ");
      // console.log(data)
      // this.requiredWords = data
    },
    async tokenize(text) {
      let words = []
      let tokens = lindera.tokenize(text)
      for (let token of tokens) {
        // console.log(token)
        words.push(token.surface_form)
      }
      return words
    },
    async newStory() {
      this.loading = true

      if (this.requiredWords.includes("\n")) {
        this.requiredWords = this.requiredWords.replaceAll("\n", ", ");
      }
      let query = prompt + this.requiredWords
      query = query.replace("...", this.storyType)
      query = query.replace("N", this.storyLength)
      console.log("Using prompt: " + query)

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: query}],
      });
      console.log(completion.data.choices[0].message);

      this.story = completion.data.choices[0].message.content
      this.words = await this.tokenize(completion.data.choices[0].message.content)

      this.loading = false

      /*
      // TODO: simulate answer
      this.story = `
物語の始まりは、宇宙に浮かぶ巨大な宇宙ステーション内部でのことでした。そこでは、様々な研究が行われ、新しい発見が 日々されていました。
ある日、ステーション内の科学者の一人が、宇宙からの信号を受信しました。信号は人工的なもので、翻訳すると「助けてく れ」という内容でした。
科学者たちは、その信号の発信元を特定し、宇宙船を発進させることに決めました。宇宙船には、科学者た科学者たちは、その信号の発信元を特定し、宇宙船を発進させることに決めました。
`
      this.words = await this.tokenize(this.story)
      this.loading = false;
      */
    },
    async getExample(word) {
      this.loading = true

      let query = `「${word}」` + examplesPrompt
      console.log("Using prompt: " + query)
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: query}],
      });
      console.log(completion.data.choices[0].message);

      this.loading = false

      return this.tokenize(completion.data.choices[0].message.content)
    },
    // Generate idiomatic examples OR
    // TODO: story continuation
    async lookup(word) {
      this.lookupResults = await this.getExample(word)
      // this.lookupList.push(await this.getExample(word))
      // this.lookupResults = ["This", "is", "first", "level"]
    },
    async multiLookup(word) {
      this.multiLookupResults = await this.getExample(word)
      // this.multiLookupResults = ["This", "is", "second", "lookup", "level"]
    }
  },
  created() {

    console.log(import.meta.env.VITE_APP_API_KEY)
    const configuration = new Configuration({
      apiKey: import.meta.env.VITE_APP_API_KEY
    });
    openai = new OpenAIApi(configuration);

    // Assets
    let text;
    fetch('./44k_pruned.txt')
      .then(response => response.text())
      .then(data => {
        text = data
        const items = text.split('\n')
        let words = []
        // Hight frequency
        let firstHalf = items.slice(0, items.length / 2)
        for (let i = 0; i < 4; i++) {
          let randomItem = firstHalf[Math.floor(Math.random() * firstHalf.length)];
          words.push(randomItem)
        }
        // Low frequency
        let secondHalf = items.slice(items.length / 2)
        for (let i = 0; i < 4; i++) {
          let randomItem = secondHalf[Math.floor(Math.random() * secondHalf.length)]
          words.push(randomItem)
        }
        this.requiredWords = words.join(", ")
      })

    console.log("Ready to rumble!")
  }
}
</script>

<template>
  <div class="greetings">

    <div class="columns box">


      <!-- Left side  -->
      <div class="column">
        <h1 class="green">{{ msg }}</h1>
        <h3>
        </h3>
        <!-- Filled manually or pre-populated -->
        <label class="label">必要な単語</label>
        <textarea class="textarea" type="text" v-model="requiredWords"
          placeholder="AIは、その言葉をストーリーの中で使っていきます。" />
        <br>

        <div class="field is-grouped">

        <div class="control">
          <div class="select">
            <select v-model="storyType">
              <option disabled value="">ジャンルを選択してください</option>
              <option v-for="option in types" :value="option">{{option}}</option>
            </select>
          </div>
        </div>

        <div class="control" style="width: 20%">
          <input v-model="storyLength"
              class="input" type="number" min="50" max="150"
              placeholder="Story length">
        </div>

        <button class="button is-danger is-light" @click="newStory">新しい物語</button>

        </div>

          <!-- Setup max width (BULMA or TAILWIND) -->
        <div style="max-width: 600px; display: none;">{{ story }}</div>

        <!-- Iterate over all words -->
        <div class="content text">
          <div style="max-width: 600px">
            <span v-for="word in words" :key="word">

              <a v-if="isLink(word)" @click="lookup(word)" href="javascript: void(0);">{{ word }}</a>
              <span v-else>{{ word }}</span>

            </span>
          </div>
        </div>
      </div>

      <!-- Right side  -->
      <!-- TODO: just append more items to the list -->
      <div class="column">

        <div class="content">
          <div style="max-width: 600px">
            <span v-for="word in lookupResults" :key="word">

              <a v-if="isLink(word)" @click="multiLookup(word)" href="javascript: void(0);">{{ word }}</a>
              <span v-else>{{ word }}</span>

            </span>
          </div>
        </div>

        <hr v-if="multiLookupResults.length > 0" />

        <div class="content">
          <div style="max-width: 600px">
            <span v-for="word in multiLookupResults" :key="word">

              <a v-if="isLink(word)" @click="lookup(word)" href="javascript: void(0);">{{ word }}</a>
              <span v-else>{{ word }}</span>

            </span>
          </div>
        </div>

      </div>

    </div>

    <div class="box" v-if="loading">
      <progress class="progress is-danger" max="100">30%</progress>
    </div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Kaisei+HarunoUmi:wght@400;500;700&display=swap');
* {
  font-family: 'Kaisei HarunoUmi', serif;
}
span {
  font-size: 1.1em;
}
.text {
  font-size: 1.12em;
}
a,
.green {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
  transition: 0.4s;
}

@media (hover: hover) {
  a:hover {
    background-color: hsla(160, 100%, 37%, 0.2);
  }
}
</style>
