import p5 from 'node-p5'

function sketch (p) {
  p.setup = () => {
    const canvas = p.createCanvas(200, 200)
    setTimeout(() => {
      p.saveCanvas(canvas, 'myCanvas', 'jpg').then(filename => {
        console.log(`saved the canvas as ${filename}`)
      })
    }, 100)
    p.noLoop()
  }
  p.draw = () => {
    p.background(255, 0, 255)
    p.text('hello world!', 50, 100)
  }
}

p5.createSketch(sketch)
