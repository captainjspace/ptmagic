// import  from  "./.json" with { type: "json" };
import { createInterface } from 'node:readline';
import { exit, stdin, stdout } from 'node:process';
import EventEmitter from "node:events";
import os from "node:os";
import chalk from "chalk";

class ForwarderEmitter extends EventEmitter { terms=""; } ;
const forwarder = new ForwarderEmitter();

class ColorConsole { 

  log(c,t){
    console.log(chalk[c],(t));
  };
}

const cc=new ColorConsole();
type PrimitiveValue = number|string|boolean;

class DotKeyMap extends Map<string, PrimitiveValue> {

  constructor(){
    super();
    this.#dotKeyMap=new Map<string,PrimitiveValue>();
  };

  #dotKeyMap = new Map<string,PrimitiveValue>();



  function* convertToDotMap<K, V>( input: Map<unknown, unknown>, isKey: (k: unknown) => k is K, isVal: (v: unknown) => v is V): Generator<[K, V]> {
    for (const [key, value] of input.entries()) {
      if isKey(key) && (typeof value in typeof PrimitiveValue)  {
        yield [key, value];
      } else if ((typeof value ==="object") && (value !== null)) {
          const o = input.get(key)
          const m = new Map(Object.fromEntries(o));
          convertToDotMap(o);
      }
    }
  }


  get map() { return this.#dotKeyMap }
  set map(map:Map<unknown,unknown>) {
    const map=map;
    cleanMap = new Map(convertToDotMap(map, isString, isPrimitive);
    this.#dotKeyMap=new Map(cleanMap);
  }

  // Expose standard Map properties and methods
  get size() { return this.#dotKeyMap.size; }
  clear() { this.#dotKeyMap.clear(); }
  delete(key: K): boolean { return this.#dotKeyMap.delete(key); }
  get(key: K): V | undefined { return this.#dotKeyMap.get(key); }
  has(key: K): boolean { return this.#dotKeyMap.has(key); }
  set(key: K, value: V): this { this.#dotKeyMap.set(key, value); return this; }
  forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
    this.#dotKeyMap.forEach(callbackfn, thisArg);
  }

  const isString = (k: unknown): k is string => typeof k === "string";
  const isPrimitive = (v:unknown): v is PrimitiveValue => typeof v in ["string","boolean","number"];
  const typedMap = (unknownMap:Map<unknown,unknown>) => {
    new Map(convertToDotMap(unknownMap, isString, isPrimitive));
  }

  filterMap(predicate: (value: V, key: K) => boolean): V[] {
    const result: V[] = [];
    this._map.forEach((value, key) => {
      if (predicate(value, key)) result.push(value);
    });
    return result;
  }

  /** Converts map to a JSON string */
  toJson(): string {
    return JSON.stringify(Array.from(this._map.entries()));
  }

  like(terms:string): => {
    const terms=terms;
    const dotKeys = new Map(this.#dotKeyMap);
    cc.log(chalk.bgBlue.red,terms);
    if (terms===undefined) return;

    const likeReturn=[];
    const all_terms:Array<string>=Array.from(( typeof terms === 'string' ) ? terms.split(/[,;;\s]/,10) : terms).filter((e) => {
      return typeof e === "string");
    }
    const keyFlatSet=Array.from(dotKeys.keys()).flat();
    const valSet=Array.from(dotKeys.values()).flat();
    const keySet=Array.from(dotKeys.entries()).map((k,v) => [k,v].join());
    const maxLoop=Math.min(all_terms.length, dotKeys.size); //no stupid loops

    const matchReturn=(exact,matchSet=[])=> {
      let loopReturn = (exact.isExact) ? exact: {};
      if(matchSet.length>0) { 
        loopReturn.possibleMatches=matchSet.map((k) => [dotKeys.get(k),k].join());
      }
      return loopReturn;
    }

    for (let x=0;x<maxLoop;x++){

      const exact={ 
        isExact: dotKeys.has(all_terms[x]), 
        term: all_terms[x], 
        value: dotKeys.get(all_terms[x]) 
      };
      const matchSet=keySet.filter((e) => e.indexOf(all_terms[x])>0);
      const likes=matchReturn(exact, matchSet);
      if (Object.entries(likes).length>0) {
        likeReturn.push(likes);
      }
    }
    return (likeReturn.length>0) ? likeReturn : ["No Matches Found"];
  };

  const dotkey:Array<Array<any>>=[];
  const traverseRoot = (obj:any) => {
    const obj=obj;

    let i=0; //function_counter=0;
    let j=0 // key_counter=0
    let currentObj="";
    let lastParent=""
    let dotMap=new DotKeyMap();

    function traverse(obj,key,parent="") {
      i++;
      lastParent=(key)? "": currentObj;
      currentObj=[parent,key,obj.name].filter((k)=> k!=null).join(".");
      for (let key in obj) {
        j++;
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key],key,currentObj); // Recurse deeper
        } else {
          const dk=[currentObj,key].join(".");
          const dv=obj[key];
          const dt=[dk,dv],join("."); 
          const dot=[currentObj,key,obj[key]].join(".");
          const nodeT = { index: `${i}:${j}`, current: ${currentObj}, key: key, value: dv };
          dotkey[i][j]={[dk]: dv};
          dotMap.set(dk, dv);
          console.table({ key: key, dotkey: dk, value:  dv,  vtype: typeof dv, object_dot: dt,  node: nodeT, dotkey: dotkey[i][j], dotMap: dotMap.get(dk)});
        }
        j=0; //reset
      }
      currentObj=lastParent;

    }
    traverse(obj);
    return dotMap; 
  }
}

const getCliService = ( callback ) => {

  const promptStr="Enter the  key: ";

  const exitSignals=["q", "quit", "exit"]

  const rl = createInterface({
    input: stdin,
    output: stdout,
    prompt: promptStr
  });

  rl.quitTerms=exitSignals;
  cc.log(chalk.bgWhite.red,`>>>  QUIT TERMS: ${rl.quitTerms}`);

  rl.prompt();



  rl.on('line', (line) => {
    //
    let terms=line.trim();
    cc.log(chalk.blue(terms));

    let l_terms=( typeof terms === 'string' ) ? terms.split(/[,;;\s]/,10) : terms;  //  ,dotKeys.size); 
    for (var t=0; t<l_terms.length; t++) {
      cc.log(chalk.magentaBright.bgGreen,l_terms[t], t);
      if( rl.quitTerms.includes(l_terms[t])) {
        rl.close();
      }
    }

    if (terms.length>0) {
      console.log(`calling back with ${terms}`);
      //forwarder.terms=terms;
      forwarder.emit('searchline',terms);
    } else {
      console.log("");
    }
    rl.prompt();
  }).on('close', () => {
    console.log('Have a great day!');
    exit(0);
  });

  return rl;

}
function main() {
  //let terms;
  const dotMap=traverse(os.Interfaces());
  console.log(dotMap.like(["en0"]));
  const repl=getCliService(dotMap.like());
  const caller= (terms) => {
    console.log("Recevied Terms");
    console.log(JSON.stringify(dotMap.like(terms),null,2));
    //forwarder.on('refresh', dotMap).emit('refresh',1);
  }
  forwarder.on('searchline', caller);
}
main();


