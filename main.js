// TODO: learn typescript
// current list of tags:
// religious, food, friendly, assassin, unfriendly, violent, romantic

const soloEvents = [
    {eventType: "prayAlone", tags: ["religious", "solo"], 
        print: function(actor) {
            return `${actor} prays quietly.`
        }},
    {eventType: "eatAlone", tags: ["food", "solo"],
        print: function(actor) {
            return `${actor} eats a snack.`
        }},
    {eventType: "drinkAlone", tags: ["food", "solo"],
        print: function(actor) {
            return `${actor} takes a sip of ${choose(["water", "wine", "ale"])}.`
        }},
    {eventType: "makeGrandSpeech", tags: ["royal"],
        print: function(actor) {
            return `${actor} makes a grand speech.`
        }},
]

const duoEvents = [
    {eventType: "shareFoodWithSomeone", tags: ["food", "friendly", "assassin"], 
        print: function(actor, target) {
            return `${actor} and ${target} share a meal.`
        }},
    {eventType: "shareDrinkWithSomeone", tags: ["food", "friendly", "assassin"], 
        print: function(actor, target) {
            return `${actor} and ${target} share a drink.`
        }},
    {eventType: "arguesWithSomeone", tags: ["unfriendly"],
        print: function(actor, target) {
            return `${actor} suddenly shouts at ${target}!`
        }},
    {eventType: "insultsSomeone", tags: ["unfriendly"],
        print: function(actor, target) {
            return `${actor} calls ${target} something unkind.`
        }},
    {eventType: "fightSomeone", tags: ["unfriendly", "violent", "assassin"], 
        print: function(actor, target) {
            return `${actor} ${choose(["punches", "slaps", "kicks", "bites"])} ${target}!`
        }},
    {eventType: "flirtsWithSomeone", tags: ["romantic", "assassin"],
        print: function(actor, target) {
            return `${actor} flirts with ${target}.`
        }},
    {eventType: "kissesSomeone", tags: ["romantic"],
        print: function(actor, target) {
            return `${actor} and ${target} kiss ${choose(["softly", "passionately"])}.`
        }},
    {eventType: "prayForSomeone", tags: ["religious"],
        print: function(actor, target) {
            return `${actor} murmurs a prayer for ${target}.`
        }},
    {eventType: "quoteReligiousTextsAtSomeone", tags: ["religious"],
        print: function(actor, target) {
            return `${actor} lectures ${target} on religion.`
        }},
]

const goalTemplates = [
    {
        name: "drunkenFight",
        pattern:
        `(pattern drunkenFight
            (event ?e1 where eventType: shareDrinkWithSomeone, actor: ?c1, target: ?c2)
            (event ?e2 where eventType: shareDrinkWithSomeone, actor: ?c2, target: ?c1)
            (event ?e3 where eventType: arguesWithSomeone, actor: ?c1, target: ?c2)
            (event ?e4 where eventType: fightSomeone, actor: ?c2, target: ?c1))`,
        stages: [
            "?c1 shares a drink with ?c2",
            "?c2 shares a drink with ?c1",
            "?c1 argues with ?c2",
            "?c2 attacks ?c1"
        ]
    },
    {
        name: "flirtyConsequences",
        pattern:
        `(pattern flirtyConsequences
            (event ?e1 where tag:romantic, actor: ?c1, target: ?c2)
            (event ?e2 where tag:romantic, actor: ?c1, target: ?c2)
            (event ?e3 where tag:unfriendly, actor: ?c2, target: ?c1)
            (event ?e4 where tag:unfriendly, actor: ?c3, target: ?c1))`,
        stages: [
            "?c1 flirts with ?c2",
            "?c1 flirts with ?c2 again",
            "?c2 is unfriendly to ?c1",
            "?c3 is unfriendly to ?c1"
        ]
    },
    {
        name: "harmReligiousCharacter",
        pattern:
        `(pattern harmReligiousCharacter
            (event ?e1 where tag:religious, actor: ?c1)
            (event ?e2 where tag:unfriendly, actor: ?c2, target: ?c1))`,
        stages: [
            "?c1 does something religious",
            "?c2 is intolerant"
        ]

    }
]

const traits = [
    {
        name: "friendly",
        eval: function(action) {
            let util = 0
            if (action.tags.includes("friendly")) {
                util += 5
            }
            if (action.tags.includes("solo")) {
                util -= 2.5
            }
            return util
        }
    },
    {
        name: "flirty",
        eval: function(action) {
            if (action.tags.includes("romantic")) {
                return 5
            }
            return 0
        }
    },
    {
        name: "unfriendly",
        eval: function(action) {
            // we want violent actions to be less frequent, but a lot of
            // unfriendly actions are also tagged as violent, so we give
            // priority to checks for the violent tag to ensure we're correctly
            // assigning utility scores
            if (action.tags.includes("violent")) {
                return 2.5
            }
            if (action.tags.includes("unfriendly") || action.tags.includes("solo")) {
                return 5
            }
            return 0
        }
    },
    {
        name: "gourmet",
        eval: function(action) {
            if (action.tags.includes("food")) {
                return 5
            }
            return 0
        }
    },
    {
        name: "pious",
        eval: function(action) {
            let util = 0
            if (action.tags.includes("religious")) {
                util += 5
            }
            if (action.tags.includes ("romantic")) {
                util -= 2.5
            }
            return util
        }
    },
]

const royalTrait = {
    name: "royal",
    eval: function(action) {
        let util = 0
        if (action.tags.includes("violent")) {
            util -= 5
        }
        if (action.tags.includes("royal")) {
            util += 7.5
        }
        return util
    }
}

const possibleNames = ["Vroronin", "Peterkin", "Ysemay", "Madeleine",
"Fulcher", "Betsy", "Golden", "Camille", "Flora", "Adam", "Felix"]
// each character has a name and a list of 2-3 traits

// `nChars` is the number of characters to generate
// `nTraits` is the number of traits per character
function generateCharacters(nChars, nTraits) {
    // randomly selects nChars names
    let names = chooseN(nChars, possibleNames)
    return names.map((cName) => {
        let cTraits = chooseN(nTraits, traits)
        return {
            name: cName,
            traits: cTraits
        }
    })
}

// we assume the DB has already been updated in this function
function updateGoals(action) {
    goals = mapcat(
        goals, function(goal) {
            let updates = tryAdvance(goal, db.db, "", db.getNewestEID())

            // by my understanding, this strips out empty/unbound goals that
            // are kept around to capture future opportunities to match the
            // same template
            if (updates[0].lastStep === "pass"
                    && updates.length > 1
                    && Object.keys(updates[0].bindings).length > 0) {
                updates = updates.slice(1);
            }

            // filters out any goals that are uncompletable
            updates.filter((u) => u.lastStep !== "die")
            return updates
        }
    )
}


// to be clear, the objects in soloEvents and duoEvents are event
// *specifications*, they don't actually describe an instantiated event (since
// they don't have a bound actor or target). an instantiated action is bound to
// a particular actor (and possible target), which is why we get to replace the
// print function with a print string.
function allPossibleActions(actor) {
    possible = []

    for (let spec of soloEvents) {
        possible.push({
            eventType: spec.eventType,
            //actor: actor,
            actor: actor.name,
            tags: spec.tags,
            print: spec.print(actor.name),
        })
    }

    for (let spec of duoEvents) {
        for (let target of chars.filter((c) => c !== actor)) {
            possible.push({
                eventType: spec.eventType,
                //actor: actor,
                actor: actor.name,
                //target: target,
                target: target.name,
                tags: spec.tags,
                print: spec.print(actor.name, target.name),
            })
        }
    }

    return possible
}

function updateLength(updateList) {
    let len = updateList.length

    for (update of updateList) {
        while (update.parent !== undefined) {
            update = update.parent
            len++
        }
    }

    return len
}

// TODO: implement this
function isActiveGoal(goal) {
    return
}

function winnowEval(action) {
    let nextDB = db.addEvent(action)
    let allUpdates = []
    for (let goal of goals) {
        let updates = tryAdvance(goal, nextDB.db, "", nextDB.getNewestEID())
        allUpdates = allUpdates.concat(updates)
    }

    return updateLength(allUpdates) - updateLength(goals)
}


// `actor` is a character
// `action` is an action with properties `eventType`, `actor`, (optionally) `target`, and `tags`
// evaluate returns a number representing how much actor wants to do action
function evaluate(actor, action) {
    let util = 0 //avoids probabilities of 0

    for (let trait of actor.traits) {
        util += trait.eval(action)
    }

    // TODO: add regard checking stuff

    return util
}

// I want to normalize the utility and drama values to some degree, and it
// seems somewhat reasonable to divide by the average? we'll take a running
// average to make it more performant
//let avgU = 5 //set up sensible defaults to avoid divide by 0 errors
//let avgD = 1
// `actor` is a character
function chooseAction(actor) {
    allActions = allPossibleActions(actor)
    let actions = []
    let weights = []

    for (action of allActions) {
        let utility = evaluate(actor, action)
        let drama = winnowEval(action)

        // we want to exclude actions that the character doesn't want to do and
        // which wouldn't be narratively interesting
        if (utility <= 0 && drama <= 0) continue

        // my attempt to normalize these values a bit. Utility is basically
        // capped at 10, and drama seems to hover around 1 or 2 usually
        let weight = 4 * utility / 5 + 6 * drama / 2

        actions.push(action)
        weights.push(weight)
        console.log(`${action.print} (weight ${weight})`)
    }

    return chooseWeighted(actions, weights)
}

function performAction(action) {
    write(action.print)
    db = db.addEvent(action)
    updateGoals(action)
}

// we're going to set this later, and it'll be used to stop acting after a
// certain interval (which should take ~5 minutes)
//this avoids the program running too long and having performance issues
let actionIntervalId = null
let i = 0
function allAct() {
    let actor = chars[i]
    let action = chooseAction(actor)
    performAction(action)
    i = (i + 1) % chars.length

    if (i >= 150) {
        clearInterval(actionIntervalID)
    }
}

let ranInit = false
function init() {
    if (ranInit) { 
        console.log("ERROR: trying to run init when it's already been run!")
        return 
    }
    db = emptyDB()

    // generate characters with random names and trait combos, including one
    // who's given the royal trait, then add them to the DB
    let nChars = 7
    let nTraits = 2
    let writeChars = initWriter("charInfo", 15)
    chars = generateCharacters(nChars, nTraits)
    choose(chars).traits.push(royalTrait)

    for (let c of chars) {
        db = db.addChar(c)
        writeChars(`${c.name}: ${prettify(c.traits.map((t) => t.name))}`)
    }

    // setting up Winnow stuff
    goals = goalTemplates.map(function(template) {
        return {
            pattern: compilePattern(parse(template.pattern)[0]),
            bindings: {},
        }
    })

    // actual game loop and output to screen
    write = initWriter("main", 10)
    actionIntervalID = setInterval(allAct, 2000)

    ranInit = true
}

// function that runs on startup
$(init)

