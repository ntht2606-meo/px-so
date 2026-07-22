const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('/mnt/data/zone-order-patch-v0.5.88.js', 'utf8');
const context = {
  console,
  buildTach(blocks){
    return {
      tach:'00.35da0,5n',
      khong:[
        'Strang',
        '14b10n',
        '52b20n',
        '',
        'Btre',
        '01.02.03dd5n',
        '',
        'BtreStrang',
        '11b1n',
        '',
        'Vtau',
        '24b2n',
        '',
        'BtreVtau',
        '36b3n',
        '',
        'Blieu',
        '44b4n'
      ].join('\n')
    };
  },
  getDaisFromName(name){
    const known = ['Btre','Vtau','Strang','Blieu'];
    const found = [];
    for(const dai of known){
      const i = String(name).indexOf(dai);
      if(i >= 0) found.push({dai, i});
    }
    return found.sort((a,b)=>a.i-b.i).map(x=>x.dai);
  }
};
context.window = context;
context.globalThis = context;
vm.createContext(context);
vm.runInContext(source, context);

const blocks = [
  {dais:['Btre']},
  {dais:['Vtau']},
  {dais:['Strang']},
  {dais:['Blieu']}
];
const result = context.buildTach(blocks);
const expectedHeaders = ['Btre','Vtau','Strang','Blieu','BtreVtau','BtreStrang'];
const actualHeaders = result.khong.split(/\n+/).filter(line => line && !/^\d/.test(line));

if(JSON.stringify(actualHeaders) !== JSON.stringify(expectedHeaders)){
  console.error('FAIL headers', actualHeaders);
  process.exit(1);
}
if(!result.khong.includes('14b10n') || !result.khong.includes('52b20n') || !result.khong.includes('36b3n')){
  console.error('FAIL content preservation');
  process.exit(1);
}
if(result.tach !== '00.35da0,5n'){
  console.error('FAIL tach changed');
  process.exit(1);
}
if(context.PX_KEEP_ZONE_ORDER_PATCH.status !== 'ACTIVE'){
  console.error('FAIL patch inactive');
  process.exit(1);
}
console.log('PASS zone order:', actualHeaders.join(' -> '));
console.log('PASS content preserved');
console.log('PASS tach unchanged');
