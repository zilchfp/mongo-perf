if ( typeof(tests) != "object" ) {
    tests = [];
}

/*
 * Setup:
 * Test: Insert empty documents into database
 * Notes: Let mongod create missing _id field
 *        The generated Object ID for _id will be monotically increasing, and
 *            the index on _id will continually add entries larger than
 *            any current entry.
 */
tests.push( { name: "Insert.Empty",
              tags: ['insert','regression'],
              pre: function( collection ) { collection.drop(); },
              ops: [
                  { op:  "insert",
                    doc: {} }
              ] } );


/*
 * Setup: Create capped collection of 32 KB
 * Test: Insert empty documents into capped collection
 * Notes: Empty document with _id : ObjectID is 48 bytes from measurement.
 *        Need at least 683 inserts to roll the capped collection.
 */
tests.push( { name: "Insert.EmptyCapped",
              tags: ['insert','regression', 'capped'],
              pre: function( collection ) {
                  collection.drop();
                  collection.runCommand( "create", { capped : true,
                                                     size : 32 * 1024 } );
              },
              ops: [
                  { op:  "insert",
                    doc: {} }
              ] } );

/*
 * Setup: Create capped collection of 32 KB
 * Test: Insert empty documents into capped collection using sequential int for
 *       _id field.
 * Notes: Empty document with _id : NumberInt is 16 bytes from measurement. Need
 *            at least 2048 inserts to roll the capped collection.
 */
tests.push( { name: "Insert.EmptyCapped.SeqIntID",
              tags: ['insert','regression', 'capped'],
              pre: function( collection ) {
                  collection.drop();
                  collection.runCommand( "create", { capped : true,
                                                     size : 32 * 1024 } );
              },
              ops: [
                  { op:  "insert",
                    doc: { _id: { "#SEQ_INT":
                                  { seq_id: 0, start: 0, step: 1, unique: true }
                                }
                         }
                  }
              ] } );

/*
 * Setup:
 * Test: Insert document only with object ID.
 * Notes: Generates the _id field on the client
 *        
 */
tests.push( { name: "Insert.JustID",
              tags: ['insert','core'],
              pre: function( collection ) { collection.drop(); },
              ops: [
                  { op:  "insert",
                    doc: { _id: { "#OID": 1 } } }
              ] } );


              
tests.push( { name: "Alex.Insert.JustID",
            tags: ['alex1'],
            // pre: function( collection ) { collection.drop(); },
            ops: [
                { op:  "insert",
                  doc:
                      { x: { "#SEQ_INT":
                          { seq_id: 0, start: 0, step: 1, unique: true } } } }
            ] } );




// variables for vector insert test
// 100 documents per insert
var batchSize = 100000;
var eventName = ["report", "meeting", "advantage"]
var docs = [];
for (var i = 0; i < batchSize; i++) {
    docs.push( {
        event_name : eventName[i % 3],
        type : i % 5,
        duration : i % 1000
    } );
}

/*
 * Setup:
 * Test: Insert a vector of documents. Each document has an integer field
 * Notes: Generates the _id field on the client
 *        
 */
tests.push( { name: "Alex.Simple.SimpleKeyValue",
              tags: ['alex111'],
              pre: function( collection ) { collection.drop();},
              ops: [
                  { op:  "insert",
                    doc: docs }
              ] } );


tests.push( { name: "Alex.Simple.SimpleKeyValue",
            tags: ['alexSimpleQuery'],
            ops: [
                // { op: "find", query:  {}}
                { op: "find", query:  { duration : 1}}
            ] } );



tests.push( { name: "Alex.Simple.SimpleKeyValue",
            tags: ['alexSimpleLikeQuery'],
            ops: [
                { op: "find", query:  { event_name : "/.*por.*"}}
            ] } );


tests.push( { name: "Alex.Simple.SimpleKeyValue",
            tags: ['alexOwnSimpleAggQuery'],
            ops: [{
                op: "command",
                ns: "#B_DB",
                command: {
                    aggregate: "#B_COLL",
                    pipeline: [
                        {
                        $match : { "duration": 1 }
                        },
                        {
                        $group : {
                            _id : null,
                            count: { $sum: 1 }
                        }
                        }
                    ], 
                    cursor: {}
                }
            }]
        } );


var nested_docs = [];
for (var i = 0; i < batchSize; i++) {
    nested_docs.push( {
        nested_docs : {
            key1 : i % 10,
            level1 : {
                key2 : i % 100,
                level2 : {
                    key3 : i % 1000
                }
            }
        }
    } );
}

tests.push( { name: "Alex.Nested.ComplexNestedObject",
              tags: ['insertNestedData'],
              pre: function( collection ) { collection.drop();},
              ops: [
                  { op:  "insert",
                    doc: nested_docs }
              ] } );
