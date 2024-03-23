import Handlebars from "handlebars";
import mediumZoom from "medium-zoom";
import "whatwg-fetch";

import * as helpers from "./shared/helpers";

import "./styles/index.css";
import "./styles/important.css";

Object.keys(helpers).forEach((helperName) => {
  Handlebars.registerHelper(helperName, helpers[helperName]);
});

let templateSource = ``;
let startBeforeGlobal = 0;

// 此函数将处理数据加载和渲染逻辑
function loadDataAndRender(
  apiEndpoint,
  startBefore,
  refContainer,
  templateSource
) {
  fetch(apiEndpoint)
    .then((response) => response.json())
    .then((data) => {
      const reversedData = reverseChannelMessageData(data.ChannelMessageData);
      data.ChannelMessageData = reversedData;
      console.log(data);
      const template = Handlebars.compile(templateSource);
      const html = template(data);
      refContainer.innerHTML = "";
      refContainer.insertAdjacentHTML("beforeend", html);
      document
        .getElementById("load-more")
        .addEventListener("click", () => loadMore(apiEndpoint, refContainer));
      document.getElementById("load-more").style.display = "";
      if (data.nextBefore === 0) {
        const loadMoreButton = document.getElementById("load-more");
        loadMoreButton.remove();
      } else {
        startBeforeGlobal = data.nextBefore;
        console.log(startBeforeGlobal);
      }
      if (G_CONFIG.zoom) {
        document.querySelectorAll("[data-zoomable]").forEach((element) => {
          if (element.getAttribute("data-zoomed") !== "true") {
            mediumZoom(element);
            element.setAttribute("data-zoomed", "true");
          }
        });
      }
    })
    .catch((error) => {
      console.log(error);
      refContainer.innerText = "我们遇到了一些错误，你可以刷新页面重试";
    });
}

function reverseChannelMessageData(data) {
  const keys = Object.keys(data);
  const reversedKeys = keys.reverse();
  const reversedData = reversedKeys.map((key) => {
    const itemData = data[key];
    itemData.originalKey = key;
    return itemData;
  });
  return reversedData;
}

// 此函数用户检查 JSON 是否为空
function isEmptyObject(apiEndpoint, nextBefore) {
  return fetch(`${apiEndpoint}?startbefore=${nextBefore}`)
    .then((response) => response.json())
    .then((data) => {
      return Object.keys(data.ChannelMessageData).length === 0;
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return false;
    });
}

// 此函数处理“加载更多”的逻辑
function loadMore(apiEndpoint, refContainer) {
  const loadMoreButton = document.getElementById("load-more");
  loadMoreButton.disabled = true;

  fetch(`${apiEndpoint}?startbefore=${startBeforeGlobal}`)
    .then((response) => response.json())
    .then((data) => {
      const reversedData = reverseChannelMessageData(data.ChannelMessageData);
      data.ChannelMessageData = reversedData;
      const template = Handlebars.compile(templateSource);
      const html = template(data);
      refContainer.insertAdjacentHTML("beforeend", html);
      console.log(isEmptyObject(apiEndpoint, data.nextBefore));
      isEmptyObject(apiEndpoint, data.nextBefore).then((isEmpty) => {
        if (isEmpty) {
          loadMoreButton.remove();
        } else {
          startBeforeGlobal = data.nextBefore;
          console.log(startBeforeGlobal);
        }
      });
      if (G_CONFIG.zoom && mediumZoom) {
        document.querySelectorAll("[data-zoomable]").forEach((element) => {
          if (element.getAttribute("data-zoomed") !== "true") {
            mediumZoom(element);
            element.setAttribute("data-zoomed", "true");
          }
        });
      }
      loadMoreButton.disabled = false;
    })
    .catch((error) => {
      console.error(error);
      refContainer.innerHTML = "我们遇到了一些错误，你可以刷新页面重试";
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const G_CONFIG = window.G_CONFIG || {};

  const apiEndpoint = G_CONFIG.api || "";
  const refContainer = document.getElementById(G_CONFIG.ref);
  if (G_CONFIG.template === "custom") {
    templateSource = document.getElementById("template").innerHTML;
  } else {
    templateSource = getDefaultTemplate();
  }
  loadDataAndRender(
    apiEndpoint,
    startBeforeGlobal,
    refContainer,
    templateSource
  );
});

function getDefaultTemplate() {
  return `
    <div class="content-container">
    {{#each ChannelMessageData}} {{#if (not (contains text "Channel"))}}
    <div class="message">
      <div class="info-header"><p class="Tag"><span class="pageTag"><a class="point">#{{ originalKey }}</a></span> <span class="views">Views: {{views}}</span></p></div>
      <p class="text">{{maskRender text}}</p>
      {{#if image}}
      <div class="image">
        {{#each image}} {{#unless (contains this "emoji")}}
        <img
          src="{{ replaceImage this}}"
          loading="lazy"
          alt="这是一张图片"
          data-zoomable
        />
        {{/unless}} {{/each}}
      </div>
      {{/if}}
      <span class="time"><span class="time-in">{{replaceTime time}}</span></span>
      {{tagChina text true}}
    </div>
    {{/if}} {{/each}}
  </div>
  `;
}
