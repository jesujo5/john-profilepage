const twText = document.getElementById('tw-text');


const phrases = [
  'Computer Science Engineering Student',
  'Quantum Computing & Quantum Technologies Minor Degree Student ',
  'MERN Front-End Developer'
  
  
];

let phraseIdx = 0;     
let charIdx   = 0;      
let isErasing = false;  

const SPEED_TYPE  = 72;    
const SPEED_ERASE = 38;    
const PAUSE_FULL  = 1600;  
const PAUSE_EMPTY = 380;   

function runTypewriter() {
  const current = phrases[phraseIdx]; 

  if (!isErasing) {
    twText.textContent = current.slice(0, charIdx + 1);
    charIdx++;

    if (charIdx === current.length) {
      setTimeout(() => {
        isErasing = true;
        runTypewriter();
      }, PAUSE_FULL);
      return; 
    }

    setTimeout(runTypewriter, SPEED_TYPE);

  } else {
    
    twText.textContent = current.slice(0, charIdx - 1);
    charIdx--;
    if (charIdx === 0) {
      isErasing = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      setTimeout(runTypewriter, PAUSE_EMPTY);
      return;
    }

    setTimeout(runTypewriter, SPEED_ERASE);
  }
}

setTimeout(runTypewriter, 900);
