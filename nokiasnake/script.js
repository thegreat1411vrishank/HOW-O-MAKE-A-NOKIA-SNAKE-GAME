//root variables
let gridSize=40;
const speedLevels=5;
const speedChanger = 1;
let speedStart = 500;
var gameSpeed = speedStart;
let speedLimit = 60;
var gameGrid = document.querySelector('.game-container');
let incDirRight=1;
let incDirDown=gridSize;
let incDirLeft=-1;
let incDirUp=-gridSize;
var moveTrain;
var gameStatus = 'stale';

//root variables

//main

document.addEventListener('DOMContentLoaded',()=>{
    let favs = document.getElementsByTagName('i');    
    
    if (window.matchMedia("(max-width: 600px)").matches) {
        Array.from(favs).forEach(element => {
            element.classList.add('fa-lg');
        });
      } else {
        Array.from(favs).forEach(element => {
            element.classList.add('fa-2x');
        });
      }
});

createGrid(gridSize);
//numberTheGrids();
var startButton = document.querySelector('#startGame');
startButton.addEventListener('click',(event)=>{
    
    //stop the game
    if(event.currentTarget.textContent=='Stop'){
        event.currentTarget.textContent='Start';
        clearInterval(moveTrain);
        gameStatus='stale';
        bringModal(document.querySelector('#score__text').textContent,"Game Stopped!!!");

    }else{
        event.currentTarget.textContent='Stop';
        document.querySelector('#score__text').textContent=0;
        document.querySelector('#speed__text').textContent=0;
        clearTheGrid();
        gameSpeed = speedStart;
        callGame();
        gameStatus='running';
    }
    
    
});



//main

// init functions

function numberTheGrids(){
    var tiles = document.getElementsByClassName('tile');
    Array.from(tiles).forEach(element => {
        element.childNodes[0].innerHTML = element.getAttribute('id').toString();
    });
}

function createGrid(rows){
    
    for (let i = 0; i < rows*rows; i++) {
        let divElement = document.createElement('div');
        divElement.className='tile';
        divElement.style.width=`calc(100% / ${gridSize})`;
        divElement.style.height=`calc(100% / ${gridSize})`;
        divElement.id=i.toString();
        //divElement.innerHTML='<span></span>';
        gameGrid.appendChild(divElement);
    }    
}

function clearTheGrid(){
    let allTiles = document.getElementsByClassName('tile');
    Array.from(allTiles).forEach(element => element.classList.remove('active'));
}



// init functions

//------------------------Game---------------------------------------

function callGame(){
    startGame();
}

function startGame(){

var startTile=0;
var tileIndex=startTile;
var tileIncrement = 1;
var trainArray = [startTile];
var direction = 'right';

//generate stations for the train
generateRandomStation();

async function moveTrainFunc() {  
    await ifCorner(tileIndex);
    tileIndex+=tileIncrement;
    if(await collided(tileIndex)){
        //game over
        // alert('game over');
        bringModal(document.querySelector('#score__text').textContent,'Collision!!!');
        clearInterval(moveTrain);
        gameStatus='stale';
        document.querySelector('#startGame').textContent='Start';
        return;
    };
    trainArray.push(tileIndex);    
    var isActive = await checkIfClassNameIsTitle(tileIndex);
    await addClassName(trainArray[trainArray.length-1]);
    await clearClassName(trainArray[0]);        
    if(isActive){
        await generateRandomStation();
        increaseScore();
    }
    else{
        trainArray.shift();
    }
    // tileIndex+=tileIncrement;   
    
    //if corner
    // await ifCorner(tileIndex);
}

moveTrain = setInterval(moveTrainFunc, gameSpeed);

async function clearClassName(index){
    let remtile = gameGrid.querySelector(`#${CSS.escape(index)}`);
    remtile.classList.remove('active');
}
async function addClassName(index){
    let remtile = gameGrid.querySelector(`#${CSS.escape(index)}`);
    remtile.classList.add('active');
}

async function checkIfClassNameIsTitle(index){
    let remtile = gameGrid.querySelector(`#${CSS.escape(index)}`);
    return remtile.classList.contains('active');
}

async function generateRandomStation(){

    var rNumber = Math.floor((Math.random())*(gridSize*gridSize));
    if(trainArray.includes(rNumber)){
        generateRandomStation();
    }
    else {
        let station = gameGrid.querySelector(`#${CSS.escape(rNumber)}`);
        station.classList.add('active');
    }
}

async function increaseScore(){
    console.log(gameSpeed);
    let presentScore=document.querySelector('#score__text');
    presentScore.textContent=parseInt(presentScore.textContent)+1;

    //increase speed
    let fSfromHTML = await fetchSpeedLevelHTML();
    if(fSfromHTML < (speedLevels)){
        if((presentScore.textContent)%speedChanger==0){
            increaseSpeed();
            increaseSpeedLevelHTML();
            clearInterval(moveTrain);
            moveTrain = setInterval(moveTrainFunc, gameSpeed);
        }
    }
}

async function fetchSpeedLevelHTML(){
    return (document.querySelector('#speed__text').textContent);
}
async function increaseSpeedLevelHTML(){
    let cP=  document.querySelector('#speed__text');
    cP.textContent = parseInt(cP.textContent) +1;
}

async function increaseSpeed(){
    let addSpeed = (speedStart-speedLimit)/speedLevels;
    if(gameSpeed>speedLimit){
        gameSpeed=gameSpeed-addSpeed;
    }
}

async function ifCorner(index){
    if (direction=='right' && (index+1)%gridSize==0) {
        tileIndex=index-gridSize;
    }
    else
    if (direction=='left' && (index)%gridSize==0) {
        tileIndex=index+gridSize;
    }else
    if (direction=='down' && (index)<(gridSize*gridSize) && (index)>=(gridSize*(gridSize-1))) {
        tileIndex=(index-(gridSize*(gridSize-1)))+(gridSize)*(-1);
    }else
    if (direction=='up' && (index)<gridSize) {
        tileIndex=(gridSize*gridSize)+(index);        
    }
}

async function collided(index){
    return trainArray.includes(index);
}

async function changeDirection(dir){
    if (dir=='right') {
        tileIncrement=1;
        direction=dir;
    }
    if (dir=='left') {
        tileIncrement=-1;
        direction=dir;
    }
    if (dir=='down') {
        direction=dir;
        tileIncrement=gridSize;
    }
    if (dir=='up') {
        direction=dir;
        tileIncrement=-gridSize;
    }
    
}

//event listener on controls
var controls = document.querySelector('.controls');
controls.addEventListener('click',(event)=>{
    try {
        if(gameStatus=='stale') return false;    
        let dir = event.target.getAttribute('id').toString();
        changeDirection(dir)
        direction=dir;
    } catch (error) {
        console.log("error from controls function: " + error);
        return false;
    }
});

//keystrokes
document.addEventListener('keydown',event=>{
    let map = {
        37:'left',
        38:'up',
        39:'right',
        40:'down'
    }
    if(map.hasOwnProperty(event.keyCode)){
        try {
            if(gameStatus=='stale') return false;                
            changeDirection(map[event.keyCode]);
            direction=map[event.keyCode];
        } catch (error) {
            console.log("error from controls function: " + error);
            return false;
        }
    }
    else{
        return false;

    }
});

//dirction change on mouse click
gameGrid.addEventListener('click', async function(event) {
    try {
        if(gameStatus=='stale') return false;             
        console.log(event.target.attributes);   
        let currID = event.target.getAttribute('id');
        let isInLine =await onClick__isInLine(currID);
        if(isInLine == 0){
            await onClick__changeDir(currID);
        }
    } catch (error) {
        console.log("error- mouse click: " + error);
        return false;
    }
});

async function onClick__isInLine(index){
    let quot = Math.floor(tileIndex/gridSize);
    //for left right
    if ((direction=='left' || direction=='right') && index != null) {
        try {
            let upperLimit = (quot+1) * (gridSize);
        let lowerLimit = quot * gridSize;
        if(index < upperLimit && index >= lowerLimit && index != null)
        {
            console.log("left-right: inline - ", index);
            return 1;
        }
        else{
            // console.log("not in line");
            return 0;
    }
        } catch (error) {
            return 2;
        }
    }else
    //for up down
    if ((direction=='up' || direction=='down') && index!=null) {
        try {
            if(index%gridSize==tileIndex%gridSize)
            {
                console.log("up-down: inline - ", index);
                return 1;
            }
            else
            return 0;
        } catch (error) {
            // console.log("UD: not in line");
            return 2;
        }        
    }

}

async function onClick__changeDir(clickedIndex){
    let mapOnClike ={
        right:['up','down'],
        left: ['up','down'],
        up:['left','right'],
        down:['left','right']        
    }
    // console.log("map right",mapOnClike['right']);
    if(direction == 'left' || direction=='right'){
        // console.log(clickedIndex,tileIndex,direction);
        if(clickedIndex < tileIndex){
            await changeDirection('up');
            direction='up';
        }
        else if(clickedIndex > tileIndex){
            await changeDirection('down');
            // console.log('from inside');
            direction='down';
        }
        return true;
    }
    if(direction == 'up' || direction=='down'){
        var mod = clickedIndex%gridSize;
        var modTile = tileIndex%gridSize;
        if(mod < modTile){
            await changeDirection('left');
            direction='left';
        }
        else if(mod > modTile){
            await changeDirection('right');
            direction='right';
        }
        return true;
    }
}


//closing bracket for function
}

//modal
async function bringModal(score,reason){
    let modaldiv = document.querySelector('.modal-div');
    modaldiv.style.visibility='visible';
    modaldiv.style.opacity='1';
    if(score!=null){
        document.querySelector('#modal__score').textContent = score;
        document.querySelector('#modal--over__text').textContent = reason;
    }else
    {
        document.querySelector('#modal__score').textContent = 0;
    }
    
    modaldiv.addEventListener('click',()=>{
        modaldiv.style.visibility='hidden';
        modaldiv.style.opacity='0';        
    })
}

//modal

//------------------------Game---------------------------------------