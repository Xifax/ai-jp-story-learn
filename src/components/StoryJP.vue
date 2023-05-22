<script setup>
defineProps({})
</script>

<script>
// Global variables (meh)
let openai;
const prompt = `簡単なストーリーを作成してください。ストーリージャンルは...であるべきです。
N単語以内でお願いします。このストーリーには以下の単語を含める必要があります：`
const examplesPrompt = `という慣用表現を使った例を作成してください。`
const miniStoryPrompt = `"タイトルに「query」を含む短編小説を想像してください。
ストーリーを要約し、要約に「query」を使用してください。
ストーリーのジャンルはgenreである必要があります。
50単語以内でお願いします。`

import { Configuration, OpenAIApi } from 'openai'
// import { isKanji, stripOkurigana } from 'wanakana'
import Kuroshiro from 'kuroshiro'
import * as lindera from 'lindera-js'
export default {
  data() {
    return {
      requiredWords: '',
      story: '',
      storyLength: 50,
      words: [],
      info: {},
      lookupResults: [],
      multiLookupResults: [],
      breadcrumbs: [],
      miniStoryOnClick: false,
      highlightKana: false,
      missingKey: false,
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
      if (!this.highlightKana) {
        return Kuroshiro.Util.hasKanji(word)
      } else {
        return Kuroshiro.Util.isJapanese(word)
      }
    },
    async tokenize(text) {
      let words = []
      let tokens = lindera.tokenize(text)
      for (let token of tokens) {
        this.info[token.surface_form] = token
        words.push(token.surface_form)
      }
      console.log(words)
      return words
    },
    // Return formatted info
    getTokenInfo(surface) {
      // console.log(this.info[surface])
      let token = this.info[surface]
      let info = `${token.pronunciation}, ${token.basic_form}  [${token.pos}: ${token.conjugated_form}]`
      return info
    },
    async newStory() {
      this.words = []
      this.story = ''
      this.loading = true

      if (this.requiredWords.includes("\n")) {
        this.requiredWords = this.requiredWords.replaceAll("\n", ", ");
      }
      let query = prompt + this.requiredWords
      query = query.replace("...", this.storyType)
      if (this.storyLength > 150) {
        this.storyLength = 150
      }
      query = query.replace("N", this.storyLength)
      console.log("Using prompt: " + query)

      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: query}],
      });
      console.log(completion.data.choices[0].message);

      this.story = completion.data.choices[0].message.content
      this.words = await this.tokenize(this.story)

      this.loading = false
    },
    async getExample(word) {
      this.loading = true

      let query = ""
      if (this.miniStoryOnClick) {
        query = miniStoryPrompt
        query = query.replaceAll("query", word)
        query = query.replace("genre", this.storyType)
      } else {
        query = `「${word}」` + examplesPrompt
      }

      console.log("Using prompt: " + query)
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: query}],
      });
      console.log(completion.data.choices[0].message);

      this.loading = false

      let words = await this.tokenize(completion.data.choices[0].message.content)
      return words
    },
    // Generate idiomatic examples OR
    // TODO: story continuation
    async lookup(word) {
      this.lookupResults = []
      this.lookupResults = await this.getExample(word)
      // this.lookupList.push(await this.getExample(word))
      this.breadcrumbs.push(word)
    },
    async multiLookup(word) {
      this.multiLookupResults = []
      this.multiLookupResults = await this.getExample(word)
      this.breadcrumbs.push(word)
    }
  },
  created() {

    if (!import.meta.env.VITE_APP_API_KEY) {
      this.missingKey = true
    }
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

    this.storyType = this.types[Math.floor(Math.random() * this.types.length)]

    console.log("Ready to rumble!")
  }
}
</script>

<template>
  <div class="greetings">

    <article class="message is-danger" v-if="missingKey">
      <div class="message-header">
        <p>STOP</p>
      </div>
      <div class="message-body">
        <p>Couldn't find OpenAI API key in <strong>.env</strong> file, located in project folder.</p>
        <p>If you don't have one, please create API key at https://beta.openai.com/account</p>
        <p>Create .env file and set the VITE_APP_API_KEY environment variable like this:</p>
        <strong>VITE_APP_API_KEY=your-api-key</strong>
      </div>
    </article>

    <div class="columns box">


      <!-- Left side  -->
      <div class="column is-two-thirds">

        <nav v-if="breadcrumbs.length > 0" 
          class="is-small breadcrumb has-succeeds-separator" aria-label="breadcrumbs">
          <ul>
            <li v-for="breadcrumb in breadcrumbs" :key="breadcrumb">
              <a @click="lookup(breadcrumb)" href="#">{{ breadcrumb }}
            </a></li>
          </ul>
        </nav>

        <!-- Filled manually or pre-populated -->
        <label class="label">必要な単語</label>
        <textarea class="textarea" type="text" v-model="requiredWords" rows="2"
          title="Words that must be in the story"
          placeholder="AIは、その言葉をストーリーの中で使っていきます。" />

        <div class="field is-grouped">
        <p class="control">
          <label class="checkbox"
            title="Create mini-story when clicking words, instead of an example">
            <input type="checkbox" v-model="miniStoryOnClick">
              Mini story on click
          </label>
          </p>

        <p class="control">
          <label class="checkbox"
            title="Skip kana-only words, when tokenizing Japanese output">
            <input type="checkbox" v-model="highlightKana">
              Highlight kana
          </label>
        </p>
        </div>

        <div class="field is-grouped">

        <div class="control">
          <div class="select">
            <select v-model="storyType"
                title="Genre of the story">
              <option disabled value="">ジャンルを選択してください</option>
              <option v-for="option in types" :value="option">{{option}}</option>
            </select>
          </div>
        </div>

        <div class="control" style="width: 20%">
          <input v-model="storyLength"
              class="input" type="number" min="50" max="150"
              title="Try to limit resulting story length"
              placeholder="Story length">
        </div>


        <button class="button is-danger is-light"
            title="Query ChatGPT for a story with the given words"
            @click="newStory">新しい物語</button>

        </div>

          <!-- Setup max width (BULMA or TAILWIND) -->
        <div style="max-width: 600px; display: none;">{{ story }}</div>

        <!-- Iterate over all words -->
        <div class="content text">
          <div style="max-width: 600px">
            <span v-for="word in words" :key="word">

              <a v-if="isLink(word)" class="has-text-primary" @click="lookup(word)" 
                :title="getTokenInfo(word)"
                href="#">{{ word }}</a>
              <span v-else>{{ word }}</span>

            </span>
          </div>
        </div>
      </div>

      <!-- Right side  -->
      <!-- TODO: just append more items to the list -->
      <div class="column">

        <div style="height: 15px;">
          <progress 
            v-if="loading"
            class="progress is-danger is-small" max="100">30%</progress>
        </div>

        <div class="content ">
          <div style="max-width: 600px">
            <span v-for="word in lookupResults" :key="word">

              <a v-if="isLink(word)" @click="multiLookup(word)"
                :title="getTokenInfo(word)"
                href="#">{{ word }}</a>
              <span v-else>{{ word }}</span>

            </span>
          </div>
        </div>

        <hr v-if="multiLookupResults.length > 0" />

        <div class="content ">
          <div style="max-width: 600px">
            <span v-for="word in multiLookupResults" :key="word">

              <a v-if="isLink(word)" @click="lookup(word)" 
                :title="getTokenInfo(word)"
                href="#">{{ word }}</a>
              <span v-else>{{ word }}</span>

            </span>
          </div>
        </div>

      </div>

    </div>

    <!-- <div class="box" v-if="loading"> -->
    <!--   <progress class="progress is-danger is-small" max="100">30%</progress> -->
    <!-- </div> -->

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
