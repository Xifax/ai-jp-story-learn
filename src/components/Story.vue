<script setup>
defineProps({
msg: {
  type: String,
  required: true
  }})
</script>

<script>
// Global variables (meh)
let openai;
const prompt = `Create a simple ... story, no longer than N words. 
This story should include the following words: `
const examplesPrompt = `Create an example with idiomatic usage of `

import { Configuration, OpenAIApi } from 'openai'
export default {
  data() {
    return {
      // requiredWords: 'hollow, majesty, fanatic, precise, balderdash',
      requiredWords: '',
      story: '',
      storyLength: 100,
      words: [],
      lookupResults: [],
      multiLookupResults: [],
      loading: false,
      storyType: 'Sci-Fi',
      types: ['Sci-Fi', 'magical realism', 'parallel world', 'romantic', 'fable']
    }
  },
  methods: {
    async newStory() {
      this.loading = true
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
      this.words = completion.data.choices[0].message.content.split(" ")

      this.loading = false

      /*
      // TODO: simulate answer
      this.story = `
In the year 3050, humanity had reached an era of great technological advancement. The world's leading scientists were on the brink of discovering the secret to achieve ataraxia, a state of complete tranquility and calmness.

The preamble to this discovery began with the brilliant minds of Dr. Ava and her assistant, Ryan. They were determined to uncover the elusive secrets hidden in the human mind and bring forth a new age of wonder.

Through countless experiments and long hours in the lab, they finally unlocked the key to achieve ataraxia. They created a device that could stimulate the human brain and induce a state of complete calmness and serenity.

The people of the world were awed by this new wonder, and many sought to achieve this state of being. The ataraxia craze took over, and people began to use the device to achieve a peaceful existence.

However, little did they know that the elusive nature of the human mind could not be contained or controlled. The device began to malfunction, causing people to become stuck in a state of ataraxia forever.

Dr. Ava and Ryan were devastated as they realized the grave error in their discovery. They scrambled to recall all the devices and find a way to reverse the impact on those affected.

The world was thrown into chaos, and the once sought-after ataraxia became a cautionary tale of the dangers of playing with the human mind.

The elusive nature of the human psyche had finally revealed itself, and humanity was left to wonder if they would ever truly understand the complexities of their own existence.
`

      // TODO: sanitize separate words
      this.words = this.story.split(" ")
      */
    },
    async getExample(word) {
      this.loading = true

      // Sanitize word
      word = word.replace(/[^\w\s]|_/g, '');

      let query = examplesPrompt + `"${word}"`
      console.log("Using prompt: " + query)
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: query}],
      });
      console.log(completion.data.choices[0].message);

      this.loading = false

      return completion.data.choices[0].message.content.split(" ")
    },
    // Generate idiomatic examples OR
    // TODO: story continuation
    async lookup(word) {
      this.lookupResults = await this.getExample(word)
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
    fetch('./20k.txt')
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
        <label class="label">Required Words</label>
        <textarea class="textarea" type="text" v-model="requiredWords" 
          placeholder="AI will use those words in its story." />
        <br>

        <div class="field is-grouped">

        <div class="control">
          <div class="select">
            <select v-model="storyType">
              <option disabled value="">Choose your story</option>
              <option v-for="option in types" :value="option">{{option}}</option>
            </select>
          </div>
        </div>

        <div class="control">
          <input v-model="storyLength"
              class="input" type="number" min="50" max="150"
              placeholder="Story length">
        </div>

        <button class="button is-danger is-light" @click="newStory">New Story</button>

        </div>

          <!-- Setup max width (BULMA or TAILWIND) -->
        <div style="max-width: 600px; display: none;">{{ story }}</div>

        <!-- Iterate over all words -->
        <div class="content">
          <div style="max-width: 600px">
            <span @click="lookup(word)" v-for="word in words" :key="word">

              <a href="javascript: void(0);">{{ word }}</a>&nbsp;

            </span>
          </div>
        </div>
      </div>

      <!-- Right side  -->
      <!-- TODO: just append more items to the list -->
      <div class="column">

        <div class="content">
          <div style="max-width: 600px">
            <span @click="multiLookup(word)" v-for="word in lookupResults" :key="word">

              <a href="javascript: void(0);">{{ word }}</a>&nbsp;

            </span>
          </div>
        </div>

        <hr v-if="multiLookupResults.length > 0" />

        <div class="content">
          <div style="max-width: 600px">
            <span @click="lookup(word)" v-for="word in multiLookupResults" :key="word">

              <a href="javascript: void(0);">{{ word }}</a>&nbsp;

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
