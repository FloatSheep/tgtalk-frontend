import Handlebars from "handlebars"; // 引入 Handlebars
import mediumZoom from "medium-zoom"; // 引入 mediumZoom
import "whatwg-fetch"; // 添加 fetch 的 polyfill 以适应旧浏览器

import * as helpers from "./shared/helpers"; // 引入 Helpers

import "./styles/index.css"; // 引入主要样式表
import "./styles/important.css"; // 引入去除 Telegram Emoji 样式表

// 遍历导出的 Helpers 并注册每个 Helpers

Object.keys(helpers).forEach((helperName) => {
  Handlebars.registerHelper(helperName, helpers[helperName]);
});

let templateSource = ``; // 设置模板源
let startBeforeGlobal = 0; // 设置 startBefore 值

// 处理数据加载和渲染逻辑
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
      const template = Handlebars.compile(templateSource); // 编译 templateSource 获取的模板（如果模板为独立文件则不需要编译）
      const html = template(data); // 使用编译后的模板渲染 fetch 的返回数据
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
        document.querySelectorAll("[data-zoomable]").forEach((element) => { // 选择所有带有 [data-zoomable] 的元素
          if (element.getAttribute("data-zoomed") !== "true") { // 加入判断，避免更新数据后重复绑定
            mediumZoom(element); // 绑定元素
            element.setAttribute("data-zoomed", "true"); // 为绑定后的元素加入 data-zoomed=true
          }
        });
      }
    })
    .catch((error) => {
      console.log(error);
      refContainer.innerText = "我们遇到了一些错误，你可以刷新页面重试";
    });
}

// 反转数据键以最先显示最后一条说说
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

// 检查 JSON 是否为空（fetch 是否出错）
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

// 加载更多
function loadMore(apiEndpoint, refContainer) {
  const loadMoreButton = document.getElementById("load-more");
  loadMoreButton.disabled = true; // 点击后禁用加载更多按钮

  // 逻辑同第一次渲染
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
      console.error(error); // 输出调试错误（无需注释，WebPack 会自动删除）
      refContainer.innerHTML = "我们遇到了一些错误，你可以刷新页面重试"; // 在显示内容中输出错误
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const G_CONFIG = window.G_CONFIG || {}; // 从浏览器的 window.G_CONFIG 获取变量

  const apiEndpoint = G_CONFIG.api || "";
  const refContainer = document.getElementById(G_CONFIG.ref);
  if (G_CONFIG.template === "custom") {
    try {
      templateSource = document.getElementById("template").innerHTML; // 尝试从 DOM 中 id 为 template 的元素中获取模板
    } catch (err) {
      refContainer.innerText("模板获取错误");
      document.getElementById("load-more").remove();
    }
  } else {
    templateSource = getDefaultTemplate(); // 获取默认模板
  }
  loadDataAndRender(
    apiEndpoint,
    startBeforeGlobal,
    refContainer,
    templateSource
  ); // 渲染
});

function getDefaultTemplate() {
  return `
    <div class="content-container">
      {{#each ChannelMessageData}} {{#if (not (contains text "Channel"))}}
          <div class="message">
            <div class="info-header">
              <p class="Tag"><span class="pageTag"><a class="point">#{{ originalKey }}</a></span> <span class="views">Views:
                  {{views}}
                </span>
              </p>
            </div>
            {{{compoundRender text}}}
            {{#if image}}
              <div class="imgList">
                <div class="image">
                  {{#each image}} {{#unless (contains this "emoji")}}
                      <img src="{{ replaceImage this}}" loading="lazy" alt="这是一张图片" data-zoomable />
                    {{/unless}} {{/each}}
                </div>
              </div>
            {{/if}}
            <span class="time"><span class="time-in">{{replaceTime time}}</span></span>
            {{tagChina text true}}
          </div>
        {{/if}} {{/each}}
    </div>
  `; // 返回默认模板
}
