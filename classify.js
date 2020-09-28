import mobilenet from '@tensorflow-models/mobilenet'
import tfjs from '@tensorflow/tfjs-node'

import vision from '@google-cloud/vision'

import fs from 'fs'

const path = process.argv[2]
const resH = 20
const resL = 10

const blendModes = ['ADD', 'DARKEST', 'LIGHTEST', 'DIFFERENCE', 'EXCLUSION', 'MULTIPLY', 'SCREEN', 'OVERLAY', 'HARD_LIGHT', 'SOFT_LIGHT', 'DODGE', 'BURN']
const blendMode = blendModes[+process.argv[3]]

async function startClassification (imgs) {
  const client = new vision.ImageAnnotatorClient()
  const visionResults = imgs.map((i, ii) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(ii)
        client.labelDetection(i).then(r => resolve(r))
      }, 1000 * ii)
    })
  })
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
    console.log('writing')
    fs.writeFileSync(`output/${path}-${blendMode}.json`, JSON.stringify(result, null, 2))
    console.log('wrote')
  })
}

const classifyMobileNet = async (imagePath, model) => {
  const image = fs.readFileSync(imagePath)
  const decodedImage = tfjs.node.decodeImage(image, 3)

  const predictions = await model.classify(decodedImage)
  return predictions.map(p => [p.className.split(',')[0], p.probability])
}

async function main () {
  const imgs = []
  // blendModes.forEach(bm => {
  for (let h = 0; h < 360; h += resH) {
    for (let l = resL; l < 100; l += resL) {
      imgs.push(`./output/${path}/${blendMode}-h${h}-l${l}.jpg`)
      // saves.push(p.saveCanvas(canvas, `./output/${path}/${bm}-h${h}-l${l}`, 'jpg'))
    }
  }
  // })
  console.log(imgs.length)
  startClassification(imgs)
}

main()
