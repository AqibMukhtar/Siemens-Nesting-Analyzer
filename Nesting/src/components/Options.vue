<template>
  <q-item
    clickable
    click= this.router.push({name: 'index'})
  >
    <q-item-section
      v-if="icon"
      avatar
    >
      <q-icon :name="icon" />
    </q-item-section>

    <q-item-section>
      <q-item-label>{{ title }}</q-item-label>
      <q-item-label caption>
        {{ caption }}
      </q-item-label>
    </q-item-section>
  </q-item>
</template>

<script>
export default {
  name: 'Options',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    },

    click: {
      type: Function
    },

    search: {
      type: Boolean,
      default: true
    },

    upload: {
      type: Boolean,
      default: false
    },

    searchBtn: {
      type: Function
    },

    uploadBtn: {
      type: Function
    }
  }
}
</script>
