/**
 *  @author kiwi
 *  @date 2022.05.24
 *
 *  ☒ load 1st page from api.scryfall
 *  ☒ use callback to load 2nd page
 *  ☒ find api.scryfall query with more than 2 pages
 *      api.scryfall.com/cards/search?q=set:snc+OR+set:khm
 *  ☒ use callback loop to load the next n pages until next_page is null
 *  ☐
 */

let font
let instructions
let debugCorner /* output debug text in the bottom left corner of the canvas */

let scryfallData /* loaded scryfall data */
let cards = [] /* list of card names we've retrieved from scryfall */
let lastRequestTime = 0

function preload() {
    font = loadFont('data/consola.ttf')

    let req = 'https://api.scryfall.com/cards/search?q=set:dmu'
    lastRequestTime = millis()
    scryfallData = loadJSON(req)
}


function setup() {
    let cnv = createCanvas(600, 300)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)
    textFont(font, 14)

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    debugCorner = new CanvasDebugCorner(5)


    /* scryfall data: scryfallData has finished loading from preLoad. add
     cards */
    for (const card of scryfallData['data']) {
        cards.push(getCustomCardFormat(card))
    }

    console.log(scryfallData['data'].length)

    /* check for scryfall JSON having more pages */
    if (scryfallData['has_more']) {
        let pageTwoJSONURL = scryfallData['next_page']
        loadJSON(pageTwoJSONURL, gotData)
    }
}


/** add card format data to cards array :3 */
function getCustomCardFormat(cardJSON) {
    return {
        'name': cardJSON['name'],
        'colors': cardJSON['colors'],
        'mana_cost': cardJSON['mana_cost'],
        'cmc': cardJSON['cmc'],
        'type_line': cardJSON['type_line'],
        'oracle_text': cardJSON['oracle_text'],
        'collector_number': int(cardJSON['collector_number']),
        'art_crop_uri': cardJSON['art_crop'], /*626x457 ½ MB*/
        'normal_uri': cardJSON['normal'],
        'large_uri': cardJSON['large'],
        'png_uri': cardJSON['png'] /* 745x1040 */

        /* normal 488x680 64KB, large 672x936 100KB png 745x1040 1MB*/
    }
}


function gotData(data) {
    console.log(`data retrieved! ${data['data'].length}`)
    console.log(`request time → ${millis() - lastRequestTime}`)
    lastRequestTime = millis()

    for (const card of data['data']) {
        cards.push(getCustomCardFormat(card))
    }

    if (data['has_more']) {
        loadJSON(data['next_page'], gotData)
    } else {
        console.log(`total request time → ${millis()}`)
        processData()
    }
}


/** call me after all the data is finished loading! */
function processData() {
    /*  display only cards that are multicolored. note this can be done via
        query → c:m, set:dmu
     */
    console.log(`total cards loaded: ${cards.length}`)

    let count = 0
    for (const card of cards) {
        if (card.colors.length > 1) {
            count++
            console.log(`${card.name} ${card.mana_cost}`)
        }
    }

    console.log(`${count} cards total`)
}


function draw() {
    background(234, 34, 24)

    /* debugCorner needs to be last so its z-index is highest */
    debugCorner.setText(`frameCount: ${frameCount}`, 2)
    debugCorner.setText(`fps: ${frameRate().toFixed(0)}`, 1)
    debugCorner.setText(`page 2 length: ${cards.length}`, 0)
    debugCorner.show()
}


function keyPressed() {
    /* stop sketch */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
    }

    if (key === 'e') {
        for (const card of cards) {
            console.log(card)
        }
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