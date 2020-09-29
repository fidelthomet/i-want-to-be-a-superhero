# i-want-to-be-a-superhero

preprocessing scripts for [ft0.ch/superhero](https://ft0.ch/superhero/)

## index.js

create image dataset based on source image.

usage:
```
node index.js [source-image]
e.g.
node index.js my-image
```

expects a source image (jpg) called `[source-image].jpg` in `./input` and creates a folder `./output/[source-image]` with the resulting dataset

## classify.js

classifies image dataset. requires google cloud platform account.

usage:
```
node classify.js [source-image]
e.g.
node classify.js my-image
```

classifies images and stores resulting data in `./output/[source-image]-[blend-mode].json