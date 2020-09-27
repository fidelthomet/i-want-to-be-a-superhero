import tfnode from '@tensorflow/tfjs-node'
import mobilenet from '@tensorflow-models/mobilenet'
import fs from 'fs'

const classify = async (imagePath) => {
  const image = fs.readFileSync(imagePath)
  const decodedImage = tfnode.node.decodeImage(image, 3)

  const model = await mobilenet.load()
  const predictions = await model.classify(decodedImage)
  console.log('predictions:', predictions)
}

if (process.argv.length !== 3) { throw new Error('Usage: node test-tf.js <image-file>') }

classify(process.argv[2])
