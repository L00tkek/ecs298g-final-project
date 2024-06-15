// TODO: add some code that cleans up the DB; it's getting super cluttered.
// maybe keep the last ~30 events?

// lots of code in this file was adapted from Loose Ends, which can be found at
// https://github.com/ItsProbablyFine/LooseEnds/tree/1b3931177ad4ced483e236cb7c399c466a490048

// by default, all properties have cardinality "one", but each action can have multiple tags and each character can have multiple traits, so we override that here
const defaultSchema = {
  tag: {":db/cardinality": ":db.cardinality/many"},
  trait: {":db/cardinality": ":db.cardinality/many"}
};

function emptyDB() {
  return new DB(datascript.empty_db(defaultSchema));
}

// this class is literally just a wrapper around a Datascript db with a few
// helper functions for our particular purposes. I've maintained immutability, so any
// methods that change the DB actually return a new DB object
class DB {
    constructor(db) {
        this.db = db
    }

    // `qstring` is a string formatted as a datalog query
    // returns the result of querying the DB
    query(qstring) {
        return datascript.q(qstring, this.db)
    }

    push(transaction) {
        return new DB(datascript.db_with(this.db, transaction))
    }

    // `ch` is a Character object
    addChar(ch) {
        const transaction = [
            [":db/add", -1, "type", "char"],
            [":db/add", -1, "name", ch.name]
        ]
        for (let trait of ch.traits) {
            transaction.push([":db/add", -1, "trait", trait.name])
        }

        return this.push(transaction)
    }

    // `ev` is an event spec
    addEvent(ev) {
        // an id value of -1 prompts the DB to pick an EID itself
        const transaction = [[":db/add", -1, "type", "event"]];

        // add actor and target

        for (let attr of Object.keys(ev)) {
            if (attr === "tags" || attr === "print") continue;
            transaction.push([":db/add", -1, attr, ev[attr]]);
        }

        for (let tag of ev.tags || []) {
            transaction.push([":db/add", -1, "tag", tag]);
        }

        return this.push(transaction)
    }

    allTransactions() {
        return this.query (`[:find ?id ?attr ?value :where [?id ?attr ?value]]`)
    }

    // returns the EID of the newest entity in the DB represented by this object
    // ADAPTED FROM LOOSE ENDS
    getNewestEID() {
        const allDatoms = datascript.datoms(this.db, ":eavt");
        return allDatoms[allDatoms.length - 1].e;
    }

    // given an EID, retrieves the information of the corresponding entity
    // ADAPTED FROM LOOSE ENDS
    getEntity(eid) {
        let propValuePairs = this.query(`[:find ?prop ?val :where [${eid} ?prop ?val]]`);
        if (propValuePairs.length === 0) return null;
        let entity = {':db/id': eid};
        for (let [prop, val] of propValuePairs) {
            entity[prop] = val;
        }
        return entity;
    }
}

//function initializeDB() {
//  let db = datascript.empty_db(schema);
//  for (let i = 0; i < 5; i++) {
//    const charName = allCharNames[i];
//    const transaction = [
//      [":db/add", -1, "type", "char"],
//      [":db/add", -1, "name", charName],
//    ];
//    db = datascript.db_with(db, transaction);
//  }
//  return db;
//}
