import Handlebars from "handlebars";

export function tagExtractor(text) {
  const regex = /<a[^>]*>#(.*?)<\/a>/g;
  const result = [];
  let match;
  while ((match = regex.exec(text))) {
    result.push(match[1]);
  }
  return result;
}

export function tagConverter(text) {
  const regex = /<a[^>]*>#(.*?)<\/a>/g;
  const result = text.replace(regex, "");
  return new Handlebars.SafeString(result);
}

export function tagChina(text, renderTagList) {
  const tags = tagExtractor(text);
  let result = "";
  if (renderTagList && tags.length > 0) {
    // 只有当 renderTagList 为真且 tags 不为空时，才渲染 tagList
    result += `<div class="tagList">`; // 添加 div 元素
    for (let tag of tags) {
      if (tag === "SFCN") {
        result += ``;
      } else {
        result += `<span class="tags">#${tag}</span>`;
      }
    }
    result += `</div>`; // 添加 div 元素
  }
  return new Handlebars.SafeString(result);
}

export function contains(str, sub) {
  return str.includes(sub);
}

export function not(value) {
  return !value;
}

export function replaceImage(originalLink) {
  const apiUrl = window.G_CONFIG.api.endsWith("/") ? window.G_CONFIG.api : window.G_CONFIG.api + "/";
  var newLink = apiUrl + `?proxy=${originalLink}`;
  return newLink;
}

export function replaceTime(timestamp) {
  return new Date(timestamp).toLocaleString("zh-CN");
}

export function maskRender(text) {
  text = tagConverter(text);
  if (text instanceof Handlebars.SafeString) {
    text = text.toString();
  }
  const regex = /<tg-spoiler>(.*?)<\/tg-spoiler>/g;
  const replace = function (match, p1) {
    return `<span class="plugin-heimu" id="heimu"><s>${p1}</s></span>`;
  };
  if (regex.test(text)) {
    return new Handlebars.SafeString(text.replace(regex, replace));
  } else {
    return new Handlebars.SafeString(text);
  }
}

export function add(a, b) {
  return Number(a) + Number(b);
}
