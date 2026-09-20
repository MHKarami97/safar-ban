import { defineStore } from 'pinia'

export var useUiStore = defineStore('ui', {
  state: () => ({ isDarkMode: false }),
  actions: {
    initialize() {
      this.isDarkMode = localStorage.getItem('safar-ban:theme') === 'dark'
      this.applyTheme()
    },
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode
      localStorage.setItem('safar-ban:theme', this.isDarkMode ? 'dark' : 'light')
      this.applyTheme()
    },
    applyTheme() { document.documentElement.classList.toggle('dark', this.isDarkMode) }
  }
})
