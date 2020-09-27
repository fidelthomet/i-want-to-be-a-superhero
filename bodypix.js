import bodyPix from '@tensorflow-models/body-pix'
import fs from 'fs'
import tfjs from '@tensorflow/tfjs-node'

async function loadImage (path) {
  const file = await fs.promises.readFile(path)

  const image = await tfjs.node.decodeImage(file, 3)

  return image
}

async function main () {
  const image = await loadImage('./img/test.jpg')

  const net = await bodyPix.load({
    architecture: 'ResNet50',
    quantBytes: 1,
    outputStride: 16
  })

  const personSegmentation = await net.segmentPerson(image, {
    internalResolution: 'full',
    segmentationThreshold: 0.5
  })

  console.log(personSegmentation)
}

main()
