'use strict';
let field = document.querySelector('.field');
let buttonsContainer = document.querySelector(".buttons-container");
let page = document.querySelector('.page');
let size = 4;

//timer
const mytimer = document.createElement('div');
mytimer.className = 'timer-container';
const time = document.createElement('div');
time.className = 'timer';
buttonsContainer.append(mytimer);
mytimer.append(time);
time.innerHTML = '00:00';
let timer;

function startTimer() {    
    let el = document.querySelector('.timer');

    let sec = 1;
    let min = 0;

    timer = setInterval(() => {
        if(sec < 10) {
            el.innerHTML = '0' + min + ':' + '0' + sec;
        }

        else {
            el.innerHTML = '0' + min + ':' + sec;
        }

        sec++;
        if(sec > 59) {
            min++;
            sec = 0;
        }
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    let el = document.querySelector('.timer');
    el.innerHTML = '00:00';
}

//sound effect
let audioElement = new Audio('sounds/sound_effect-trim.wav');

//sound button 
const soundButton = document.createElement('div');
const soundItem = document.createElement('img');

soundButton.className = 'soundButton';
soundItem.className = 'soundItem';

buttonsContainer.append(soundButton);
soundButton.append(soundItem);

soundItem.src = "images/sound-icon.png";
soundItem.style.height = '17px';
soundItem.style.width = '17px';

soundButton.addEventListener('click', () => {
    if(audioElement.muted === true) 
        soundItem.src = "images/sound-icon.png";
    else 
        soundItem.src = "images/no-sound-icon.png";
    
    audioElement.muted = !audioElement.muted;
})

function fieldBuilding(size) {
    for(let i = 1; i <= size*size; i++) {
        const item = document.createElement('div');
        item.className = 'item';
        item.id = i;
        item.innerHTML = i;
    
        field.append(item);
    }
}

fieldBuilding(size);

const items = document.querySelectorAll('.item');
const timerBtn = document.querySelector('.timer-container');

//different sizes

let itemsArray = [];

for(let i = 0; i < size*size; i++) {
    itemsArray.push(Number(items[i].innerHTML));
}

for(let i = 0; i < size*size - 1; i++)
    items[i].draggable = 'true';

//drag & drop
items[size*size - 1].ondragover = allowDrop;

function allowDrop(event) {
    event.preventDefault();
}

function drag(event) {
    event.dataTransfer.setData('id', event.target.id);
}

items[size*size - 1].ondrop = drop;
let dragIndex = -1;

function drop(event) {
    let itemId = event.dataTransfer.getData('id');
    let clone = event.target.cloneNode(true); //clone of empty
   
    if(clone.id !== itemId) {
        let nodeList = document.getElementById("field").childNodes;

        for(let i = 0; i < nodeList.length; i++) {
            if(nodeList[i].id === itemId) {
                dragIndex = i;
            }
        }
    }
    else 
        return;
}

field.addEventListener('dragstart', (event) => {
    event.target.closest('div').style.visibility = 'hidden';
})

field.addEventListener('dragend', (event) => {
    audioElement.play();
    const buttonDragged = event.target.closest('div');
    if(!buttonDragged)
         return;
    buttonDragged.style.visibility = 'visible';

    const buttonNumber = Number(buttonDragged.innerHTML);
    const buttonPos = getButtonPos(buttonNumber, matrix);
    const emptyPos = getButtonPos(emptyItem, matrix);
    
    const isValid = isValidForSwap(buttonPos, emptyPos);

    if(step === 0)
        startTimer();

    if(isValid) {
        swap(emptyPos, buttonPos, matrix);
        setPositionItems(matrix);   
        let movesNumber = document.querySelector('.moves-number');
        step++;
        movesNumber.innerHTML = step;
    }
})

items[size*size - 1].style.backgroundColor = 'transparent';
items[size*size - 1].style.color = 'transparent';
items[size*size - 1].style.boxShadow = 'none';

let matrix = getMatrix(itemsArray);
let shuffledArray = shuffleArray(matrix.flat());
matrix = getMatrix(shuffledArray);
setPositionItems(matrix);

function getMatrix(array) {
    const matrix = [];

    for(let i = 0; i < size; i++) {
        matrix.push([]);
    }
    //const matrix = [[],[],[],[]];

    let x = 0; let y = 0;
    for(let i = 0; i < array.length; i++) {
        if(x >= size) {
            y++; 
            x = 0;
        }
        matrix[y][x] = array[i];
        x++;
    }
    return matrix;
}

function setPositionItems(matrix) {
    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            const data = matrix[y][x];
            const node = items[data - 1]; //div in html
            setStyle(node, x, y);
        }
    }
}

function setStyle(node, x, y) {
    node.style.transform = `translate3D(${x * 100}%, ${y * 100}%, 0)`;
} 

let restart = document.querySelector('.shuffle');

document.querySelector('.shuffle').addEventListener('mouseup', () => {
    restart.style.boxShadow = 'inset 3px 3px  #FFCF9E';
    restart.style.transform = "translateX(1px)";
    restart.style.transform = "translateY(1px)";
    restart.style.transition = "transform 0.3s";
})

document.querySelector('.shuffle').addEventListener('mousedown', () => {
    restart.style.boxShadow = 'inset 2px 2px transparent';
    restart.style.transform = "translateX(-1px)";
    restart.style.transform = "translateY(-1px)";
    restart.style.transition = "transform 0.3s";
})

function solvableCheck(array) {
    let inversions = 0;
    let emptyItem = array.indexOf(16);
    let row = -1;

    for(let i = 0; i < array.length - 1; i++) {
        if(array[i] === 16) {
            continue;
        }

        for(let j = i + 1; j < array.length; j++) {
            if(array[j] === 16) {
                continue;
            }

            else if(array[i] > array[j]) {
                inversions++;
            }
        }
    }

    row = Math.floor(emptyItem / 4);

    if((row + inversions) % 2 === 0)
        return false;
    else 
        return true;
}

document.querySelector('.shuffle').addEventListener('click', () => {
    let shuffledArray = shuffleArray(matrix.flat());
    let isSolvable = solvableCheck(shuffledArray);

    while(isSolvable !== true) {
        shuffledArray = shuffleArray(matrix.flat());
        isSolvable = solvableCheck(shuffledArray);
    }
    console.log(isSolvable);

    matrix = getMatrix(shuffledArray);
    setPositionItems(matrix);
    movesNumber.innerHTML = 0;
    step = 0;

    stopTimer();
    audioElement.play();
})

function shuffleArray(arr) {
    return arr
    .map(value => ({value, sort: Math.random()}))
    .sort((a,b) => a.sort - b.sort)
    .map(({value}) => value);
}

const emptyItem = itemsArray[size*size - 1];
let step = 0;
let movesNumber = document.querySelector('.moves-number');
movesNumber.innerHTML = step;

field.addEventListener('click', (event) => {
    audioElement.play();
    const buttonClicked = event.target.closest('div');
    if(!buttonClicked)
         return;
    
    const buttonNumber = Number(buttonClicked.innerHTML);
    const buttonPos = getButtonPos(buttonNumber, matrix);
    const emptyPos = getButtonPos(emptyItem, matrix);
    const isValid = isValidForSwap(buttonPos, emptyPos);
    
    if(step === 0)
        startTimer();

    if(isValid) {
        swap(emptyPos, buttonPos, matrix);
        setPositionItems(matrix);
        movesNumber = document.querySelector('.moves-number');
        step++;
        movesNumber.innerHTML = step;
    }
})

function getButtonPos(number, matrix) {
    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix[y].length; x++) {
            if(matrix[y][x] === number){
                return {x, y};
            }
        }
    }
}

function isValidForSwap(pos1, pos2) {
    return pos1.x === (pos2.x - 1) && pos1.y === pos2.y || 
    pos1.x === pos2.x && pos1.y === (pos2.y - 1) ||
    pos1.x === pos2.x && pos1.y === (pos2.y + 1) ||
    pos1.x === (pos2.x + 1) && pos1.y === pos2.y;
}

function swap(pos1, pos2, matrix) {
    const temp = matrix[pos1.y][pos1.x];
    matrix[pos1.y][pos1.x] = matrix[pos2.y][pos2.x];
    matrix[pos2.y][pos2.x] = temp;

    if(isWon(matrix)) {
        addWonClass();
    }
}

let wonArray = [];

for(let i = 0; i < size * size; i++) {
    wonArray.push(Number(items[i].innerHTML));
}

function isWon(matrix) {
    let flatMatrix = matrix.flat();
    for(let i = 0; i < wonArray.length; i++) {
        if(flatMatrix[i] !== wonArray[i]) {
            return false;
        }
    }
    return true;
}

let won = 'won';
function addWonClass() {
    setTimeout(() => {
        field.classList.add(won);
        let timeForSolving = document.querySelector('.timer').innerHTML;

        alert('Hooray! You solved the puzzle in ' + timeForSolving + ' and ' + step + ' moves!');

        setTimeout(() => {
            field.classList.remove(won);
        }, 1000);
    }, 200);
}