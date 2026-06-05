// Posted by jameslk, modified by community. See post 'Timeline' for change history
// Retrieved 2026-06-04, License - CC BY-SA 3.0
import sample from "./assets/sample.json" with {type:"json"};
import { flattenObject } from "@ptcalc/utils";

function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    switch (value.trim().toLowerCase()) {
      case "true": case "yes": case "1": case "on": return true;
      case "false": case "no": case "0": case "off": case "": return false;
    }
  }
  return false; // Default fallback for null, undefined, or unknown values
}
let i=1
const reflectPrimitive = (value: unknown) => {
  console.log('\t'*i, "Testing Primitives");
  let val=value;
  let _type=typeof value;
  let possibleType = [];

  if (typeof value === "string") {
    possibleType.push(typeof value)
    value.toUpperCase();
    val = value
  }  
  if (typeof value === "number") {
    possibleType.push(typeof value)
    value.toFixed(3);
    val = value
  } 
  if (typeof value === "boolean") {
    possibleType.push(typeof value)
    val = parseBoolean(value)
    if ((val) || (!val)) console.log(val)
  }
  if (typeof value === 'undefined') {
    console.log('undefined on an island');
  }
  _type = typeof val;
  const set = new Set([...possibleType, _type]);
  return [value,val,set]; //typeof val;
}
let level=1;
let field=0;
let parent=[];
let start="root"
const reflectObject = (key: string, value: unknown) => {
  if ( parent[-1] !== start)parent.push(start)
  i++;
  start=key;
  console.table({ test: "reflect objects", key: key, level: level, traversals: i,  fieldCount: field, current: start, parent: parent.join(" |")});
  if (typeof value === "object" && value !== null) {
    console.table({...value})
    level++
    parent.push(start);
    for (const [k,v] in Object.entries(value)) {
      field++;
      start=k;
      console.log(reflectObject(v))
    }
    start=parent.pop();
    level--
  }
  else {
    console.table(parent.join("."), start, key, value, reflectPrimitive(value));
  }
  parent.pop();
}

function test_primitive(){
  [true,"false" ,-1, 0, 1, "sandwich", "birds",null, {id: 3, path:["./src", ".src/assets"]},  [1,2,'a',false], undefined].forEach( (el) => {
    console.log("Testing Object",reflectObject(el))
  })
}

function testJson(){

  flattenObject(sample);
  //Object.entries(sample).forEach( ([k,v]) => {
    //console.log("Testing Object",reflectObject(k,v))
  //})
}
//test_primitive();
testJson();


function traverse(obj, key, parent, depth, index ,fieldIndex, nodeFields){
  index++; depth++  
} 

function test_map_merege() {
  map1 = new Map(), map2 = new Map();

  map1.set('a', 'foo');
  map1.set('b', 'bar');
  map2.set('b', 'baz');
  map2.set('c', 'bazz');

  let map3 = new Map(function*() { yield* map2; yield* map1; }());

  cnsole.log(Array.from(map3)); // Result: [ [ 'a', 'foo' ], [ 'b', 'baz' ], [ 'c', 'bazz' ] ]
  depth--;
  console.log(depth)
  return map;
}



