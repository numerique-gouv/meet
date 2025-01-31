<div align="center">

# 🗂️ Widged SDK

🏗️ Work in progress ...

**Please see the official [README](https://github.com/numerique-gouv/widged)**

**Easily open a widget to browse user files on any of your project**

<img src="https://github.com/numerique-gouv/widged/blob/main/assets/workspaces.png" alt="" />

**As simple as**
</div>

```ts
const client = new WidgedClient();
client.pickFile({
  maxFiles: 3,
  onSelection: (files) => {
    console.log('Selected files', files);
  },
});
```
