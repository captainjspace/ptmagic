
export const flattenObject = (obj:any, parent = "", res:{[key : string]: any }={}) => {
  for (let key in obj) {
    const propName:string = parent ? `${parent}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};


