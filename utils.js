// `id` is a JQuery id selector
// `maxLines` is an integer
// initWriter returns a function that writes text to a DOM element. if the
// number of lines written exceeds `maxLines`, the writer removes the oldest
// line to free up a spot.
function initWriter(id, maxLines) {
    const target = $(`#${id}`)
    let lineCount = 0

    return function(text) {
        while (lineCount >= maxLines) {
            target.children().first().remove()
            lineCount--
        }

        target.append($(`<p> ${text} </p>`))
        lineCount++
    }
}

// `min` and `max` are both integers
// rand returns a uniformly random integer on the interval [min, max)
function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min
}

// `items` is an array
// `weights` is an array of floating-point numbers of the same length as items
// chooseWeighted returns a random element from items, where the probability of
// choosing each item is proportional to that item's weight
function chooseWeighted(items, weights) {
    if (items.length !== weights.length) {
        console.log(`ERROR in chooseWeighted(items=${items},weights=${weights}): items and weights are of unequal length (${items.length}=/=${weights.length})`)
        return
    }

    // each element of `probabilities` should be a floating point number on [0, 1]. 
    // sum(probabilities) should equal 1.
    let weightTotal = weights.reduce((x, y) => x + y)
    let probabilities = weights.map((weight) => weight / weightTotal)

    // to get a condition that is true with probability x, we generate a random
    // (uniformly distributed) number on [0, 1) and check if the random number
    // is less than x. this works because the proportion of values that lead to
    // the condition being true is the same as x/1. The following code just
    // generalizes that intuition to testing for multiple conditions where
    // exactly one must be true.
    let rand = Math.random() // on [0, 1)
    let threshold = 0

    for (let i = 0; i < items.length; i++) {
        threshold += probabilities[i]
        if (rand <= threshold) {
            return items[i]
        }
    }

    // if we reach here, I'm assuming a floating-point precision error occurred
    return items[items.length - 1]
}

// THE FOLLOWING FUNCTIONS WERE ADAPTED FROM LOOSE ENDS. SOURCE AT
// https://github.com/ItsProbablyFine/LooseEnds/tree/1b3931177ad4ced483e236cb7c399c466a490048

// `items` is an array
// choose returns a random element of items
function choose(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function chooseN(n, items) {
    return shuffle(items).slice(0, n)
}

function prettify(items) {
    if (items.length === 0) {
        return ""
    }

    s = items[0]

    for (let i = 1; i < items.length; i++) {
        s += `, ${items[i]}`
    }

    return s
}

// `items` is an array
// shuffle returns a copy of items, with its elements rearranged in random order
// using the Fisher-Yates shuffle algorithm
function shuffle(items) {
    const newItems = items.slice()

    for (let i = newItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newItems[i], newItems[j]] = [newItems[j], newItems[i]];
    }

    return newItems;
}

// modified from https://github.com/substack/node-concat-map/blob/master/index.js
function mapcat(xs, fn) {
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    var x = fn(xs[i], i);
    if (Array.isArray(x)) res.push.apply(res, x);
    else res.push(x);
  }
  return res;
}

// END OF FUNCTIONS ADAPTED FROM LOOSE ENDS
