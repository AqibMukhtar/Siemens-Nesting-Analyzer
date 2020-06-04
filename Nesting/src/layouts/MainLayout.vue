<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          Nesting Analyzer
        </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
        <q-item-label
          header
          class="text-grey-8"
        >
          Essential Links
        </q-item-label>
            <q-item
                clickable
                @click="options[0].link"
            >
                <q-item-section
                    v-if="options[0].icon"
                    avatar
                >
                <q-icon :name="options[0].icon" />
                </q-item-section>
                <q-item-section>
                    <q-item-label>{{ options[0].title }}</q-item-label>
                </q-item-section>
            </q-item>
            <q-item
                clickable
                @click="options[1].link"
            >
                <q-item-section
                    v-if="options[1].icon"
                    avatar>
                    <q-icon :name="options[1].icon" />
                </q-item-section>

                <q-item-section>
                    <q-item-label>{{ options[1].title }}</q-item-label>
                </q-item-section>
            </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout',

  components: {
  },

  data () {
    return {
      leftDrawerOpen: false,
      options: [
        {
          title: 'Search HTML',
          caption: 'quasar.dev',
          icon: 'school',
          link: () => this.$router.push({ name: 'SearchIndex' })
        },
        {
          title: 'Upload HTML',
          caption: 'github.com/quasarframework',
          icon: 'code',
          link: () => this.$router.push({ name: 'UploadIndex' })
        }
      ]
    }
  }
}
</script>
