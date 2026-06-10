const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Remove "Customização Premium GAN" block
const premiumGanStartRegex = /\{\/\* Personalização Premium \(Skins & Core Configs\) \*\/\}/;
const premiumGanMatch = content.match(premiumGanStartRegex);
if (premiumGanMatch) {
  const startIndex = premiumGanMatch.index;
  // look for the end of this div. It ends before "{/* Scramble Application */}"
  const scrambleAppRegex = /\{\/\* Scramble Application \*\/\}/;
  const scrambleMatch = content.match(scrambleAppRegex);
  if (scrambleMatch && scrambleMatch.index > startIndex) {
    // cut it out
    content = content.substring(0, startIndex) + content.substring(scrambleMatch.index);
    console.log("Removed Premium GAN block.");
  }
}

// 2. Add pointer handlers to the Trainer div
const trainerDivRegex = /<div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 min-h-\[400px\] relative overflow-hidden shadow-inner shadow-black\/50">/;
if (content.match(trainerDivRegex)) {
  content = content.replace(trainerDivRegex, `<div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 min-h-[400px] relative overflow-hidden shadow-inner shadow-black/50 cursor-grab active:cursor-grabbing" onMouseDown={pointerDownHandler} onTouchStart={touchStartHandler}>`);
  console.log("Added pointer handlers to Trainer wrapper.");
}

const lines = content.split('\n');
const canvasIndex = lines.findIndex(l => l.includes('O CANVAS DO THREE.JS'));
if (canvasIndex !== -1 && lines[canvasIndex + 1].includes('<ThreeDStudio')) {
  lines[canvasIndex + 1] = lines[canvasIndex + 1].replace('<ThreeDStudio', '{!showTrainer && <ThreeDStudio');
  
  // find the end of this ThreeDStudio
  for (let i = canvasIndex + 1; i < lines.length; i++) {
     if (lines[i].includes('/>')) {
        let temp = lines[i];
        lines[i] = temp.replace('/>', '/>\n}') + (temp.includes('/>') ? '' : '}');
        // wait, simple replace:
        lines[i] = temp.replace('/>', '/>}');
        console.log("Closed conditionally rendered ThreeDStudio.");
        break;
     }
  }
}
content = lines.join('\n');

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("Done");
