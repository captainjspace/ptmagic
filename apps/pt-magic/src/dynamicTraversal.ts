type PrimitiveValue = number | string | boolean;
const dynamicTraversal = (obj: any):Map<string,PrimitiveValue> => {
 

  //  type CountTypes = "EXEC" |"SECT"|"SUBS"|"LVL"|"FLD";
  //  interface CountType {
  //     name: CountTypes;
  //     id:number;
  //  }
  //   
  //  const counters:<countType: CountType,<id:readonly number,counter:number>>= {
  //    EXEC:{id:1, counter:1 },
  //    SECT:{id:2, counter:1 },
  //    SUBS:{id:3, counter:1 },
  //    LVL:{id:4, counter:1 },
  //    FLD:{id:5, counter:1 },
  //
  //    function inc(countTypes:Array<CountType>) {
  //      for (const c in countTypes) counters[c].counter=counters[c].counter+1;
  //    },
  //
  //    function dec(countTypes[]:Array<CountType>) {
  //      for (const c in countTypes) counters[c].counter=counters[c].counter-1;
  //    }
  //  }
  //
  //
  //
  const ref = {
    curObj:"",
    lstPrnt:"",
    traversals:0,
    depth:0,
    scalars:0
  }

  let currentObj="";
  let lastParent=""
  let i=0,j=0;
  let depth=0,field=0;
  console.log(depth);
  /**
   * inner recursion 
   */
  
  type DotMap=Map<string, PrimitiveValue>;
  const dotMaps:Array<DotMap>=[];


  interface InitMapParams {
    traversalIndex: number;
    datasetFieldIndexStart: number;
    currentDepth: number;
    parentSection: string;
    currentObject: string;
    fieldIndex: number;
  };

  const initiailizeMap = ({imp}:InitMapParams, dotMap:DotMap):DotMap => {
    const dotMap=  
    for ( const[pk,v] in imp ) {
        (imp).forEach((k))
    
  }
  const freshMap = ():DotMap => { 
    let m:DotMap=new Map();
    m.init=initiailizeMap;
  }
  const reflectPrimitive = (value: unknown) => {
    if (typeof value === "string") {
      console.log(value.toUpperCase()); // Safe: Narrowed to string
    }  else if (typeof value === "number") {
      console.log(value.toFixed(2));    // Safe: Narrowed to number
    }
  }

  reflectPrimitive(currentObj)
  const reflectObject = (value: unknown) => {
    // Validate it is safely an object first
    if (typeof value === "object" && value !== null) {
      if ( "username" in value) {
        // TypeScript knows 'value' has 'username', but it is still 'unknown'
        const obj = value as { username: unknown }; 
        console.log(obj.username);
      }
    }
  }
  reflectObject(currentObj);
  const traverse = (obj: any, key?:string, parent="ptcalc", depth=0):Map<string,PrimitiveValue> => {
    const map=initializeDotMap({i,j,depth,field,Object, parent}) 
    console.log(i,j,depth,field);
    i++;depth++
    lastParent=(key)? "": currentObj;
    currentObj=[parent,key,obj].filter((k)=> k!=null).join(".");
    for (const key in obj) {
      j++;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        dotMaptraverse(obj[key],key,currentObj,depth); // Recurse deeper
        depth--;
      } else {
        const dot=[currentObj,key,obj[key]].join(".");
        console.log(`${dot}`);
        //Index: ${i}:${j}
        //    Key: ${key}\tValue: ${obj[key]}`); // Process leaf node
        //dotkey[i][j]={ [currentObj,key].join(".")=obj[key];
        field++;
        dotMap.set([currentObj,key].join("."), obj[key]);
      }
      j=0; //reset
    }
    currentObj=lastParent;
    return dotMap;
  }
  dotMap=traverse(obj);

  return dotMap; 
}

function getTestData() {
  const testData = await import("./assets/sample.json", { with: { type: "json" }});

  console.log(testData);
  console.log(testData.default);

  return testData.default;
}
const mapIt:Map = (obj: any) => {  return dynamicTraversal(obj) };
const mapJSON:Map = (json:string) => { return mapIt( JSON.parse(json) ) };

function main() {
  const data=() => { return getTestData() };
console.table(data);
  const dynMap:Map=dynamicTraversal(data)

  console.table(dynMap);
  return 0;
}
if (import.meta.main) main();
