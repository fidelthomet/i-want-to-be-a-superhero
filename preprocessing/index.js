import bodyPix from '@tensorflow-models/body-pix'
import tfjs from '@tensorflow/tfjs-node'

import fs, { mkdirSync } from 'fs'
import rimraf from 'rimraf'

import p5 from 'node-p5'

const path = process.argv[2]
let segmentation
let image
let width
let height

let exportSize = 128

const white = true
const overwriteExportSize = false

const resH = 20
const resL = 10

const blendModes = ['MULTIPLY', 'SCREEN', 'OVERLAY', 'DIFFERENCE', 'DODGE']

async function loadImage (path) {
  const file = await fs.promises.readFile(path)
  const image = await tfjs.node.decodeImage(file, 3)
  width = image.shape[0]
  height = image.shape[1]
  if (overwriteExportSize) {
    exportSize = width
  }
  return image
}

function tint (p) {
  p.setup = () => {
    const canvas = p.createCanvas(exportSize, exportSize)
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
          p.image(img, 0, 0, exportSize, exportSize)
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
          p.image(mask, 0, 0, exportSize, exportSize)

          if (white) {
            const maskWhite = p.createImage(width, height)
            maskWhite.loadPixels()
            segmentation.data.forEach((pix, i) => {
              maskWhite.pixels[i * 4 + 0] = 255
              maskWhite.pixels[i * 4 + 1] = 255
              maskWhite.pixels[i * 4 + 2] = 255
              maskWhite.pixels[i * 4 + 3] = pix > 0 ? 0 : 255
            })
            maskWhite.updatePixels()
            p.blendMode(p.BLEND)
            p.image(maskWhite, 0, 0, exportSize, exportSize)
          }

          saves.push(p.saveCanvas(canvas, `./output/${path}/${bm}-h${h}-l${l}`, 'jpg'))
        }
      }
    })

    Promise.all(saves).then(d => {
      console.log(`saved ${d.length} images`)
      // startClassification(d)
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
