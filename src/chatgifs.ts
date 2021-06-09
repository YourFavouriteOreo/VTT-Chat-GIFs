import { TemplatePreloader } from "./module/helper/TemplatePreloader";
import giphySearchBar from "./giphySearchBar";
import * as logo from "./giphy.png";

function isHexColor(hex) {
  const x =
    typeof hex === "string" && hex.length === 6 && !isNaN(Number("0x" + hex));
  return x;
}

Hooks.once("init", async () => {
  console.log(
    "=============================Chat GIFS Loading============================"
  );

  game.settings.register("chatgifs", "gif-search-background", {
    name: "Background color for gif searcher ",
    hint: "Background color in hex that will appear behind the gif searcher",
    scope: "world",
    config: true,
    type: String,
    default: "d2d2c6",
    onChange: (value) => {
      if (isHexColor(value)) {
        window.location.reload();
      } else {
        ui.notifications?.warn("The value provided is NOT a hex value");
      }
    },
  });
});

Hooks.once("ready", async () => {});

function LightenDarkenColor(col, amt) {
  const num = parseInt(col, 16);
  const r = (num >> 16) + amt;
  const b = ((num >> 8) & 0x00ff) + amt;
  const g = (num & 0x0000ff) + amt;
  const newColor = g | (b << 8) | (r << 16);
  return newColor.toString(16);
}

Hooks.on("renderChatLog", (_app, html, _options) => {
  const chatControls = html.find("#chat-controls")[0];
  const chatForm = html.find("#chat-form")[0];
  chatForm.classList += "relative ";
  
  const gifSearch = document.createElement("div");
  gifSearch.id = "gifSearch";
  gifSearch.style.background = `#${game.settings.get(
    "chatgifs",
    "gif-search-background"
  )}`;

  gifSearch.classList.add("hidden");
  const gifSearchBar = document.createElement("input");
  gifSearchBar.style.background = `#${LightenDarkenColor(
    game.settings.get("chatgifs", "gif-search-background"),
    -1
  )}`;
  gifSearchBar.placeholder = "Search for a Gif! 🔍";
  gifSearch.appendChild(gifSearchBar);
  const attribution = document.createElement("img");
  attribution.className = "attribution";
  attribution.src = `modules/chatgifs/${logo.default}`;
  gifSearch.appendChild(attribution);
  const gifSearchResults = document.createElement("div");
  gifSearchResults.id = "gifSearchResults";
  gifSearch.appendChild(gifSearchResults);
  chatControls.appendChild(gifSearch);

  const button = document.createElement("button");
  button.id = "gifButton";
  button.textContent = "GIF";
  button.className += "optionsButton";
  button.type = "button";
  giphySearchBar.bind(gifSearch, button);
  chatForm.appendChild(button)
});

if (process.env.NODE_ENV === "development") {
  if (module.hot) {
    module.hot.accept();

    if (module.hot.status() === "apply") {
      for (const template in _templateCache) {
        if (Object.prototype.hasOwnProperty.call(_templateCache, template)) {
          delete _templateCache[template];
        }
      }

      TemplatePreloader.preloadHandlebarsTemplates().then(() => {
        for (const application in ui.windows) {
          if (Object.prototype.hasOwnProperty.call(ui.windows, application)) {
            ui.windows[application].render(true);
          }
        }
      });
    }
  }
}
