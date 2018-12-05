const fs = require('fs');
console.time('Time used');

// Load text file with specified name or default to process-sample-input.txt
let textPath = `./${process.argv[2] || 'process-sample-input.txt'}`;
let data = fs.readFileSync(textPath);

// Break buffer data to lines by return and newline characters
let lines = data.toString().split(/\r\n/);

// Break down titles and values
let titles = [];
let values = [];
for(let i = 1; i < lines.length; i++) {
  let temp = [];
  // The break pattern from line 1-5 is different from the rest of the data
  // i.e. some values are separated by one space and others by 3+ and
  // some titles include a space too; plus some data are separated by comma
  // and others don't, so we will have to do it the hard way.
  if(i <= 5) {
    temp = lines[i].split(/[\s,()]/).filter(function(data) { return data !== '' });
    while(temp.length !== 0) {
      let data = temp.shift();
      switch(data) {
        case 'Process':
          titles.push('CPU');
          values.push(temp.shift());
          titles.push('PIN');
          values.push(temp.shift());
          titles.push('Name');
          values.push(temp.shift());
          break;
        case 'Device':
          titles.push('Device Name');
          temp.shift();
          values.push(temp.shift());
          break;
        case 'Program':
          titles.push(data);
          values.push(temp.shift());
          temp.shift();
          break;
        case 'Userid':
        case 'Creatorid':
          titles.push(data);
          values.push(`"${temp.shift()},${temp.shift()}"`);
          break;
        case 'Ancestor':
          titles.push('AncestorCPU');
          values.push(temp.shift());
          titles.push('AncestorPIN');
          values.push(temp.shift());
          titles.push('AncestorName');
          values.push(temp.shift());
          break;
        case 'Format':
        case 'Data':
        case 'Subsystem':
          titles.push(`${data} Version`);
          temp.shift();
          values.push(temp.shift());
          break;
        case 'Local':
          titles.push('Local System');
          temp.shift();
          values.push(temp.shift());
          break;
        case 'From':
          titles.push(data);
          values.push(`"${temp.shift()} ${temp.shift()} ${temp.shift()}, ${temp.shift()}"`);
          break;
        case 'For':
          titles.push(data);
          values.push(temp.shift());
          temp.shift();
          break;
        default:
          titles.push(data);
          values.push(temp.shift());
      }
    }
  } else {
    // Fist split titles and values by 2 or more spaces
    temp = lines[i].split(/\s\s+/);

    // Then if there are 4 data in the list meaning title and values are mathcing
    // otherwise we will check/push them one by one
    if(temp.length === 4) {
      titles.push(temp[0]);
      values.push(`"${temp[1].replace(/ \/?[a-z#%]+/gi, '')}"`);
      titles.push(temp[2]);
      values.push(`"${temp[3].replace(/ \/?[a-z#%]+/gi, '')}"`);
    } else if(temp[0] !== '++' && temp[0][0] !== '-') {
      let noValue = false;
      while(temp.length !== 0) {
        let data = temp.shift();
        if(RegExp(/[a-z]/i).test(data[0])) {
          if(noValue) {
            values.push(null);
          }
          titles.push(data);
          noValue = true;
        } else {
          values.push(`"${data.replace(/ [a-z]*\/?[a-z#%]+/gi, '')}"`);
          noValue = false;
        }
      }
      if(noValue) {
        values.push(null);
      }
    }
  }
}

// Output the data to file
fs.writeFileSync(`./${process.argv[3] || 'process-sample-output.txt'}`, `${titles.join()}\n${values.join()}`);

console.log('Data successfully parsed!')
console.timeEnd('Time used');