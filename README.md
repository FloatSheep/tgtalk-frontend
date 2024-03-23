<h1 align="center">TGTalk FrontEnd</h1>

As the name suggests, this is a front end to TGTalk.

English | [中文（简体）](#chinese)

## Usage the project(CDN)

Add the style file

```html
<link
  rel="stylesheet"
  href="https://registry.npmmirror.com/@floatsheep/tg-talker/latest/files/dist/main.css"
/>
```

Add the init script and main script

```html
<script>
  window.G_CONFIG = {
    api: "https://tgtalk.api.eurekac.cn", // A api that you deployed
    ref: "g-container", // A container that you want to mount it
    template: "default", // Choose "custom" or "default"
    zoom: true, // Enable Medium-Zoom
  };
</script>
<script src="https://registry.npmmirror.com/@floatsheep/tg-talker/latest/files/dist/index.js"></script>
```

## Diy your template

If you want to use your template, you can choose custom in the template setting

And then, you should refer to the documentation of handlebars to add a template and make its id template

Just like this:

```html
<script id="template" type ="text/x-handlebars-template">
...Your template
</script>
<script>
  window.G_CONFIG = {
    ...Your config
    template: "custom"
  }
</script>
```

## Chinese

添加样式文件

```html
<link
  rel="stylesheet"
  href="https://registry.npmmirror.com/@floatsheep/tg-talker/latest/files/dist/main.css"
/>
```

添加初始化脚本和主要脚本

```html
<script>
  window.G_CONFIG = {
    api: "https://tgtalk.api.eurekac.cn", // A api that you deployed
    ref: "g-container", // A container that you want to mount it
    template: "default", // Choose "custom" or "default"
    zoom: true, // Enable Medium-Zoom
  };
</script>
<script src="https://registry.npmmirror.com/@floatsheep/tg-talker/latest/files/dist/index.js"></script>
```

## 制定你的模板

如果你想要使用你的 Handlebars 模板，你可以在模板设置中选择 custom

然后你应该参照 Handlebars 的官方文档创建一个 ID 为 template 的模板，就像下面这样：

```html
<script id="template" type ="text/x-handlebars-template">
...你的模板内容
</script>
<script>
  window.G_CONFIG = {
    ...你的配置
    template: "custom"
  }
</script>
```
