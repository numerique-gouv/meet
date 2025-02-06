<div align="center">

# 🎥 Visio SDK

**Easily open a widget to browse user files on any of your project**

<img src="docs/demo.gif" alt="" />

**As simple as**

</div>

```ts
import { VisioCreateButton } from "@gouvfr-lasuite/visio-sdk";

function App() {
  const [roomUrl, setRoomUrl] = useState();

  return <VisioCreateButton onRoomCreated={setRoomUrl} />;
}
```

## Installation

To install, you can use npm or yarn:

```
$ npm install --save @gouvfr-lasuite/visio-sdk
$ yarn add @gouvfr-lasuite/visio-sdk
```
