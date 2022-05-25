/**
 *  @author kiwi
 *  @date 2022.05.24
 *
 *  ☒ load 1st page from api.scryfall
 *  ☐ use callback to load 2nd page
 *  ☐ use callback loop to load the next n pages until next_page is null
 */

let font
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

let scryfallData /* loaded scryfall data */

function preload() {
    font = loadFont('data/consola.ttf')
    scryfallData = loadJSON('https://api.scryfall.com/cards/search?q=set:snc')
}


function setup() {
    let cnv = createCanvas(600, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    for (const card of scryfallData['data']) {
        console.log(card['name'])
    }

    console.log(scryfallData['data'].length)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)
}


function draw() {
    background(234, 34, 24)
    noLoop()

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.show()
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
    }
}


function getCardData() {
    let results = []
    let data = scryfallData['data']

    /* regex for detecting creatures and common/uncommon rarity */
    const rarity = new RegExp('(common|uncommon|rare|mythic)')

    let count = 0

    for (let key of data) {
        /* filter for rarity */
        if (rarity.test(key['rarity'])) {
            let cardData = {
                'name': key['name'],
                'colors': key['colors'],
                'cmc': key['cmc'],
                'type_line': key['type_line'],
                'oracle_text': key['oracle_text'],
                'collector_number': int(key['collector_number']),
                'art_crop_uri': key['image_uris']['art_crop'], /*626x457 ½ MB*/
                'normal_uri': key['image_uris']['normal'],
                'large_uri': key['image_uris']['large'],
                'png_uri': key['image_uris']['png'] /* 745x1040 */

                /* normal 488x680 64KB, large 672x936 100KB png 745x1040 1MB*/
            }

            results.push(cardData)
            count++
        }
    }
    return results
}


/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    show() {
        textFont(font, 14)
        strokeWeight(1)

        const LEFT_MARGIN = 10
        const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
        const LINE_SPACING = 2
        const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING
        fill(0, 0, 100, 100) /* white */
        strokeWeight(0)

        for (let index in this.debugMsgList) {
            const msg = this.debugMsgList[index]
            text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
        }
    }
}