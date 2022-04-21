# @awin/assets

## Development

### Install dependencies

```sh
yarn
```

## Usage

**Access Noun RLE Image Data**

```ts
import { ImageData } from '@awin/assets';

const { bgcolors, palette, images } = ImageData;
const { bodies, accessories, heads, glasses } = images;
```

**Get Noun Part & Background Data**

```ts
import { getNounData } from '@awin/assets';

const seed = {
  background: 0,
  body: 17,
  accessory: 41,
  head: 71,
  glasses: 2,
};
const { parts, background } = getNounData(seed);
```
