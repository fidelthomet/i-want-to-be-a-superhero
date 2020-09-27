import bodyPix from '@tensorflow-models/body-pix'
import mobilenet from '@tensorflow-models/mobilenet'
import tfjs from '@tensorflow/tfjs-node'

import vision from '@google-cloud/vision'

import fs, { mkdirSync } from 'fs'
import rimraf from 'rimraf'

import p5 from 'node-p5'

const path = process.argv[2]
let segmentation
let image
let width
let height

const resH = 90
const resL = 50

const blendModes = ['ADD', 'DARKEST', 'LIGHTEST', 'DIFFERENCE', 'EXCLUSION', 'MULTIPLY', 'SCREEN', 'OVERLAY', 'HARD_LIGHT', 'SOFT_LIGHT', 'DODGE', 'BURN']

async function loadImage (path) {
  const file = await fs.promises.readFile(path)
  const image = await tfjs.node.decodeImage(file, 3)
  width = image.shape[0]
  height = image.shape[1]
  return image
}

function tint (p) {
  p.setup = () => {
    const canvas = p.createCanvas(width, height)
    const img = p.createImage(width, height)
    img.loadPixels()
    const imgPixels = image.dataSync()
    img.pixels.forEach((pix, i) => {
      if (i % 4 === 3) img.pixels[i] = 255
      else img.pixels[i] = imgPixels[i - Math.floor(i / 4)]
    })
    img.updatePixels()

    p.colorMode(p.HSL)
    const saves = []
    blendModes.forEach(bm => {
      for (let h = 0; h < 360; h += resH) {
        for (let l = resL; l < 100; l += resL) {
          p.blendMode(p.REPLACE)
          p.background(img)
          p.blendMode(p[bm])

          const color = p.color(h, 100, l)
          // console.log(color)
          const mask = p.createImage(width, height)
          mask.loadPixels()
          segmentation.data.forEach((pix, i) => {
            mask.pixels[i * 4 + 0] = color.levels[0]
            mask.pixels[i * 4 + 1] = color.levels[1]
            mask.pixels[i * 4 + 2] = color.levels[2]
            mask.pixels[i * 4 + 3] = pix > 0 ? 255 : 0
          })
          mask.updatePixels()
          p.image(mask, 0, 0)

          saves.push(p.saveCanvas(canvas, `./output/${path}/${bm}-h${h}-l${l}`, 'jpg'))
        }
      }
    })

    Promise.all(saves).then(d => {
      console.log(`saved ${d.length + 1} images`)
      startClassification(d)
    })

    // console.log(segmentation)

    // setTimeout(() => {

    // }, 100)
    p.noLoop()
    // console.log('1')
  }
  p.draw = () => {
    // p.background(255, 0, 255)
    // p.text('hello world!', 50, 100)
    // console.log('1.5')
  }
}

async function startClassification (imgs) {
  const client = new vision.ImageAnnotatorClient()
  const visionResults = imgs.map(i => client.labelDetection(i))
  const visionP = new Promise((resolve, reject) => {
    Promise.all(visionResults).then(data => {
      resolve(data.map(d => {
        return d[0].labelAnnotations.map(l => [l.description, l.score])
      }))
    })
  })

  const model = await mobilenet.load()
  const mobilenetResults = imgs.map(i => classifyMobileNet(i, model))
  const mobilenetP = new Promise((resolve, reject) => {
    Promise.all(mobilenetResults).then(data => {
      resolve(data)
    })
  })

  Promise.all([visionP, mobilenetP]).then(data => {
    const result = imgs.map((img, i) => {
      return {
        img,
        vision: data[0][i],
        mobilenet: data[1][i]
      }
    })

    fs.writeFileSync(`output/${path}.json`, JSON.stringify(result, null, 2))
  })
}

const classifyMobileNet = async (imagePath, model) => {
  const image = fs.readFileSync(imagePath)
  const decodedImage = tfjs.node.decodeImage(image, 3)

  const predictions = await model.classify(decodedImage)
  return predictions.map(p => [p.className.split(',')[0], p.probability])
}

async function main () {
  image = await loadImage(`./input/${path}.jpg`)

  rimraf.sync(`output/${path}`)
  mkdirSync(`output/${path}`)

  const net = await bodyPix.load({
    architecture: 'ResNet50',
    quantBytes: 1,
    outputStride: 16
  })

  segmentation = await net.segmentPerson(image, {
    internalResolution: 'full',
    segmentationThreshold: 0.5
  })

  // console.log(personSegmentation)

  // const resourcesToPreload = {
  //   catImage: p5.loadImage(`./input/${img}`)
  // }
  p5.createSketch(tint)
  // console.log('2')
}

main()
