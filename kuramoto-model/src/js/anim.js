let BALLS = {
    current: null,
    frames: [],
    colors: {},
}

function canvasGetSize() {
    let virtualHeight = windowHeight - 160
    let virtualWidth
    if (windowWidth > 780) {
        virtualWidth = windowWidth - 400
    } else {
        virtualWidth = windowWidth - 80
    }
    return Math.min(virtualWidth, virtualHeight)
}

function setup() {
    let animFrame = document.getElementById('anim-frame')
    let canvas = createCanvas(canvasGetSize(), canvasGetSize())
    canvas.parent('anim-frame')
}

function onData(data) {
    BALLS = {
        current: null,
        frames: [],
        colors: {},
        massCenter: []
    }
    frameRate(vm.environmentSettings.fps)
    let framesCount = data.frames
    for (let i = 0; i < framesCount; i++) {
        let frame = {}
        for (id in data.objects) {
            frame[id] = data.objects[id][i]
            if (!i) { BALLS.colors[id] = vm.objectList.filter((obj) => (obj.id === id))[0].color }
        }
        BALLS.frames.push(frame)
    }
    BALLS.framesCount = framesCount
    BALLS.current = 0
}

function draw() {
    push()
    let size = width
    background(34)
    noStroke()
    fill(22)
    circle(size * 0.5, size * 0.5, size)
    fill(34)
    circle(size * 0.5, size * 0.5, size * 0.8)
    fill(55)
    rectMode('center')
    rect(size * 0.95, size * 0.5, size * 0.08, size * 0.02, size * 0.02)
    rect(size * 0.05, size * 0.5, size * 0.08, size * 0.02, size * 0.02)

    if (BALLS.current !== null) {

        // stroke(255, 50)
        // strokeWeight(size * 0.002)
        // for (id1 in BALLS.colors) {
        //     for (id2 in BALLS.colors) {
        //         let angle1 = BALLS.frames[BALLS.current][id1]
        //         let angle2 = BALLS.frames[BALLS.current][id2]
        //         let x1 = size * 0.5 + Math.cos(angle1) * size * 0.45
        //         let y1 = size * 0.5 - Math.sin(angle1) * size * 0.45
        //         let x2 = size * 0.5 + Math.cos(angle2) * size * 0.45
        //         let y2 = size * 0.5 - Math.sin(angle2) * size * 0.45
        //         line(x1, y1, x2, y2)
        //     }
        // }
        // noStroke()

        let coordXarray = []
        let coordYarray = []

        for (id in BALLS.colors) {
            fill(BALLS.colors[id])
            let angle = BALLS.frames[BALLS.current][id]
            let x = size * 0.5 + Math.cos(angle) * size * 0.45
            let y = size * 0.5 - Math.sin(angle) * size * 0.45
            coordXarray.push(x)
            coordYarray.push(y)
            circle(x, y, size * 0.07)
        }

        let coordX = coordXarray.reduce((a, b) => a + b) / coordXarray.length
        let coordY = coordYarray.reduce((a, b) => a + b) / coordYarray.length
        BALLS.massCenter.push([coordX, coordY])

        noFill()
        stroke(255, 70)
        strokeWeight(size * 0.01)
        beginShape()
        for (let i = BALLS.current; i > Math.max(0, BALLS.current - 100); i--) {
            vertex(...BALLS.massCenter[i])
        }
        endShape()
        noStroke()
        fill(255, 100)
        circle(coordX, coordY, size * 0.07)

        BALLS.current++
        if (BALLS.current === BALLS.framesCount) { BALLS.current = 0 }
    }
    pop()
}

function windowResized() {
    let animFrame = document.getElementById('anim-frame')
    resizeCanvas(canvasGetSize(), canvasGetSize())
}
