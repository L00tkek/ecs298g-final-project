// current list of tags:
// religious, food, friendly, assassin, unfriendly, violent, romantic

const soloEvents = [
    {eventType: "prayAlone", tags: ["religious"], 
        print: function(actor) {
            return `${actor} prays quietly.`
        }},
    {eventType: "eatAlone", tags: ["food"],
        print: function(actor) {
            return `${actor} eats a snack.`
        }},
    {eventType: "drinkAlone", tags: ["food"],
        print: function(actor) {
            return `${actor} takes a sip of ${choose(["water", "wine", "ale"])}.`
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
    {eventType: "fightSomeone", tags: ["unfriendly", "violent"], 
        print: function(actor, target) {
            return `${actor} ${choose(["punches", "slaps", "kicks", "bites"])} ${target}!`
        }},
    {eventType: "flirtsWithSomeone", tags: ["romantic", "friendly"],
        print: function(actor, target) {
            return `${actor} flirts with ${target}.`
        }},
    {eventType: "kissesSomeone", tags: ["romantic", "friendly"],
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
            if (action.tags.includes("friendly")) {
                return 5
            }
            return 0
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
            if (action.tags.includes("unfriendly") || action.tags.includes("violent")) {
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
            if (action.tags.includes("religious")) {
                return 5
            }
            return 0
        }
    },
]

const royalTrait = {
    name: "royal",
    eval: function(action) {
        return 1
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
  //for (const eventSpec of basicSoloEventSpecs) {
  //  for (const c of charIDs) {
  //    allPossibleActions.push({
  //      type: "event",
  //      eventType: eventSpec.eventType,
  //      tags: eventSpec.tags,
  //      actor: c
  //    });
  //  }
  //}
  //for (const eventSpec of basicDyadicEventSpecs) {
  //  for (const [c1, c2] of charIDPairs) {
  //    allPossibleActions.push({
  //      type: "event",
  //      eventType: eventSpec.eventType,
  //      tags: eventSpec.tags,
  //      actor: c1,
  //      target: c2
  //    });
  //  }
  //}

// we assume the DB has already been updated
function updateGoals(action) {
    goals = mapcat(
        goals, function(goal) {
            let updates = tryAdvance(goal, db, "", db.getNewestEID())

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


function allPossibleActions(actor) {
    possible = []

    for (let spec of soloEvents) {
        possible.push({
            eventType: spec.eventType,
            //actor: actor,
            actor: actor.name,
            tags: spec.tags,
            print: spec.print,
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
                print: spec.print,
            })
        }
    }

    return possible
}

function goalsAdvanced(action) {
    nextDB = db.addEvent(action)
    allUpdates = []
    for (let goal of goals) {
        let updates = tryAdvance(goal, nextDB, "", nextDB.getNewestEID())
        allUpdates = allUpdates.concat(updates)
    }
    return allUpdates.length
}


// `actor` is a character
// `action` is an action with properties `eventType`, `actor`, (optionally) `target`, and `tags`
// evaluate returns a number representing how much actor wants to do action
function evaluate(actor, action) {
    util = 1 //avoids probabilities of 0

    for (let trait of actor.traits) {
        util += trait.eval(action)
    }

    //util += 100 * goalsAdvanced(action) TODO add back

    return util
}

// `actor` is a character
function act(actor) {
    actions = allPossibleActions(actor)
    weights = actions.map((action) => evaluate(actor, action))
    return chooseWeighted(actions, weights)
}

function allAct() {
    let i = 0

    return function() {
        actor = chars[i]
        action = act(actor)
        if (action.target === undefined)
        {
            //action is monadic
            write(action.print(action.actor))
        }
        else {
            // action is dyadic
            write(action.print(action.actor, action.target))
        }

        //db = db.addEvent(action)
        //updateGoals(action) TODO add back
        i = (i + 1) % chars.length
    }
}

//    appState.backgroundPartialMatches = mapcat(
//      appState.backgroundPartialMatches,
//      function(partialMatch) {
//        let possibleMatchUpdates = tryAdvance(partialMatch, appState.db, "", latestEventID);
//        // greedily replace bpms with advanced versions of themselves,
//        // except for the baseline empty bpms we keep around to capture later match opportunities
//        if (possibleMatchUpdates[0].lastStep === "pass"
//            && possibleMatchUpdates.length > 1
//            && Object.keys(possibleMatchUpdates[0].bindings).length > 0) {
//          possibleMatchUpdates = possibleMatchUpdates.slice(1);
//        }
//        return possibleMatchUpdates.filter(pmu => pmu.lastStep !== "die");
//        // FIXME also filter out complete matches?
//      }
//    );

let ranInit = false
function init() {
    if (ranInit) { 
        console.log("ERROR: trying to run init when it's already been run!")
        return 
    }
    db = emptyDB()

    // generate characters with random names and trait combos, including one
    // who's given the royal trait, then add them to the DB
    let nChars = 4
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
    setInterval(allAct(), 2000)

    ranInit = true
}

// function that runs on startup
$(init)

