import { CancelToken, CancelTokenSource } from "axios";

export default class GiphySearchBar {
  element: HTMLElement;
  visibility = false;
  gifButtonElement: HTMLButtonElement;
  apiKey: string;
  cancelToken: CancelToken;
  source: CancelTokenSource;
  
  // eslint-disable-next-line
  axios = require("axios").default;
  
  constructor(element: HTMLElement, gifButtonElement: HTMLButtonElement) {
    this.element = element;
    this.gifButtonElement = gifButtonElement;
    this.apiKey = "";
    this.cancelToken = this.axios.CancelToken;
    // @ts-ignore
    this.source = this.cancelToken.source();
    this.activateListeners(element);
  }

  activateListeners(element) {
    console.log(element);
    const input = this.element.firstElementChild as HTMLInputElement;
    this.gifButtonElement.onclick = this.toggleVisibility;
    input.oninput = this._onKeyDown;
    //   this.element.parentNode.addEventListener('keyup', this.onKeyUp, true);
    //   // we need to add it to the parent, since base fvtt does use "onCapture =  true" on the text area, which results in listeners being called in order of definition.... so preventing the "Enter" won't be possible that way
    //   this.element.parentNode.addEventListener('keydown', (ev) => this._onKeyDown(ev), true);
    //   this.element.addEventListener('submit', ev => console.log(ev));
  }

  toggleVisibility = () => {
    this.visibility = !this.visibility;
    if (this.visibility) {
      this.element.classList.remove("hidden");
      this.element.classList.add("slide-in-bottom");
    } else {
      this.element.classList.remove("slide-in-bottom");
      this.element.classList.add("hidden");
      const input = this.element.firstElementChild as HTMLInputElement;
      input.value = "";
      const searchResults = this.element.lastElementChild as HTMLDivElement;
      searchResults.innerHTML = "";
    }
  };

  getFoundryVersion = () => {
    return game?.data?.version;
  };

  isFoundry8 = () => {
    const foundryVersion = this.getFoundryVersion();
    // @ts-ignore
    return foundryVersion >= "0.8.0" && foundryVersion < "0.9.0";
  };

  createChatMessage = (content) => {
    const messageData = {
      content: `<div class="giphy-container"><img src="${content}" alt="chat-reactions-gif"></div>`,
      // fix for #20: added a `type OOC`, so the message will
      // appear in the OOC tab with tabbed chat
      type: CONST.CHAT_MESSAGE_TYPES.OOC || 1,
    };
    if (this.isFoundry8()) messageData["user"] = game.user;

    return ChatMessage.create(messageData);
  };

  _onKeyDown = (ev: Event) => {
    const inputText = (ev.target as HTMLInputElement).value;
    if (inputText.length >= 3) {
      console.log("search functionality");
      this.source.cancel();
      this.axios
        .get("https://api.giphy.com/v1/gifs/search", {
          params: {
            q: inputText,
            api_key: this.apiKey,
            cancelToken:this.source.token,
            limit:20
          },
        })
        .then((response) => {
          console.log(response.data.data.length)
          this.populateImages(response.data.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
    console.log("change detected");
  };

  populateImages(images: Array<any>) {
    console.log("populating images");
    const searchResults = this.element.lastElementChild as HTMLDivElement;
    searchResults.innerHTML = "";
    images.forEach((image) => {
      const gif = document.createElement("img");
      gif.src = image.images.preview_gif.url;
      gif.onclick = ()=>{
        this.createChatMessage(image.images.downsized.url)
        this.toggleVisibility()
      }
      searchResults?.appendChild(gif);
    });
  }

  onKeyUp = (ev) => this._onKeyUp(ev);

  _onKeyUp(ev) {
    console.log(ev);
  }

  static bind(element, gifButtonElement) {
    return new GiphySearchBar(element, gifButtonElement);
  }
}
