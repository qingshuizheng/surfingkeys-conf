import theme from "./theme.js"
import keys from "./keys.js"
import searchEngines from "./search-engines.js"

export default {
  settings: {
    hintAlign: "left",
    hintCharacters: "qwertasdfgzxcvb",
    omnibarSuggestionTimeout: 500,
    richHintsForKeystroke: 1,
    defaultSearchEngine: "ka",
    stealFocusOnLoad: false,
    theme,
    aceKeybindings: "emacs",
    caseSensitive: false,
    smartCase: false,
    nextLinkRegex: /(next|older|newer|more|»|→|›|>>|next\s*page|older\s*posts|下一页|下页|下一篇|后一页|更旧|较旧|更早|下一頁|後頁)/i,
    prevLinkRegex: /(prev|previous|newer|back|«|←|‹|<<|previous\s*page|newer\s*posts|上一页|上页|上一篇|前一页|更新|较新|更近|上一頁)/i,
  },

  keys,
  searchEngines,

  // Leader for site-specific mappings
  siteleader: "<Space>",

  // Leader for OmniBar searchEngines
  searchleader: "a",

  // Array containing zero or more log levels to enable: log, warn, error
  logLevels: [
    // "log",
    // "warn",
    "error",
  ],
}
