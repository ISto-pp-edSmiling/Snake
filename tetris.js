document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    let squares = Array.from(document.querySelectorAll('.grid div'))
    const bottom = document.querySelectorAll('.bottom')
    const scoreDisplay = document.querySelector('#score')
    const pausebtn = document.querySelector('#pausebtn')
    const pauseGrey = document.querySelector('.pause-grey')
    const beginbtn = document.querySelector('.beginbtn')
    const restartbtn = document.querySelector('.restartbtn') 
    const combotext = document.querySelector('.combo')
    const comboX = document.querySelector('.combo-numb')
    const volumeSlider = document.querySelector('.volume-slider')
    const width = 10
    let nextRandom = 0
    let timerId
    let score = 0
    let combo = 0
    let combochecker = false
    let interval = 1000
    let gameInProgress = false
    var nextSpotLight = 0
    const colors = [
      // 'orange',
      // 'red',
      // 'purple',
      // 'green',
      // 'blue'
      '#9b5e5e',
      '#c49180',
      '#71967d',
      '#48569d',
      '#7f5585',
    ]
    
    
    titleTheme = new Audio('music/Titletheme.mp3')
    titleTheme.play()
    
    
    //The Tetrominoes
    const lTetromino = [
      [1, width+1, width*2+1, 2],
      [width, width+1, width+2, width*2+2],
      [1, width+1, width*2+1, width*2],
      [width, width*2, width*2+1, width*2+2]
    ]
    
    const zTetromino = [
      [0,width,width+1,width*2+1],
      [width+1, width+2,width*2,width*2+1],
      [0,width,width+1,width*2+1],
      [width+1, width+2,width*2,width*2+1]
    ]
    
    const tTetromino = [
      [1,width,width+1,width+2],
      [1,width+1,width+2,width*2+1],
      [width,width+1,width+2,width*2+1],
      [1,width,width+1,width*2+1]
    ]
    
    const oTetromino = [
      [0,1,width,width+1],
      [0,1,width,width+1],
      [0,1,width,width+1],
      [0,1,width,width+1]
    ]
    
    const iTetromino = [
      [1,width+1,width*2+1,width*3+1],
      [width,width+1,width+2,width+3],
      [1,width+1,width*2+1,width*3+1],
      [width,width+1,width+2,width+3]
    ]
    
    const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino]
    
    let currentPosition = 4
    let currentRotation = 0
    
    
    //randomly select a Tetromino and its first rotation
    let random = Math.floor(Math.random()*theTetrominoes.length)
    let current = theTetrominoes[random][currentRotation]
    
    //draw the Tetromino
    function draw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.add('tetromino')
        squares[currentPosition + index].style.backgroundColor = colors[random]
      })
    }
    
    //undraw the Tetromino
    function undraw() {
      current.forEach(index => {
        squares[currentPosition + index].classList.remove('tetromino')
        squares[currentPosition + index].style.backgroundColor = ''
        
      })
    }
    //assign functions to keyCodes
    function control(e) {
      if(!gameInProgress) {return}
      if(e.key === 'a') {
        moveLeft()
      } else if (e.key === 'w') {
        rotate()
      } else if (e.key === 'd') {
        moveRight()
      } else if (e.key === 's') {
        moveDown()
      }
    }
    document.addEventListener('keydown', control)
    
    //move down function
    function moveDown() {
      freeze()
      undraw()
      currentPosition += width
      draw()
    }
    
    //freeze function
    function freeze() {
      if(current.some(index => squares[currentPosition + index + width].classList.contains('taken') || squares[currentPosition + index + width].classList.contains('bottom'))) {
        current.forEach(index => squares[currentPosition + index].classList.add('taken'))
        //start a new tetromino falling
        random = nextRandom
        nextRandom = Math.floor(Math.random() * theTetrominoes.length)
        current = theTetrominoes[random][currentRotation]
        currentPosition = 4

        combotext.style.display = 'none'
        combotext.classList.remove('fadeOut')
        
        draw()
        
        if (interval > 50) {
          interval -= 2
        }
        
        displayShape()
        addScore()
        gameOver()
      }
    }
    
    //move the tetromino left, unless is at the edge or there is a blockage
    function moveLeft() {
      undraw()
      const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0)
      if(!isAtLeftEdge) currentPosition -=1
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition +=1
      }
      draw()
    }
    
    //move the tetromino right, unless is at the edge or there is a blockage
    function moveRight() {
      undraw()
      const isAtRightEdge = current.some(index => (currentPosition + index) % width === width -1)
      if(!isAtRightEdge) currentPosition +=1
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentPosition -=1
      }
      draw()
    }
    
    
    ///FIX ROTATION OF TETROMINOS A THE EDGE 
    function isAtRight() {
      return current.some(index=> (currentPosition + index + 1) % width === 0)  
    }
    
    function isAtLeft() {
      return current.some(index=> (currentPosition + index) % width === 0)
    }
    
    function checkRotatedPosition(P){
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        currentRotation --
        current = theTetrominoes[random][currentRotation]
        return;
      }
      P = P || currentPosition       //get current position.  Then, check if the piece is near the left side.
      if ((P+1) % width < 4) {         //add 1 because the position index can be 1 less than where the piece is (with how they are indexed).     
        if (isAtRight()){            //use actual position to check if it's flipped over to right side
          currentPosition += 1    //if so, add one to wrap it back around
          checkRotatedPosition(P) //check again.  Pass position from start, since long block might need to move more.
          return
        }
      }
      else if (P % width > 5) {
        if (isAtLeft()){
          currentPosition -= 1
          checkRotatedPosition(P)
          return
        }
      }
    }
    
    //rotate the tetromino
    function rotate() {
      undraw()
      currentRotation++
      if(currentRotation === current.length) { //if the current rotation gets to 4, make it go back to 0
        currentRotation = 0
      }
      current = theTetrominoes[random][currentRotation]
      
      checkRotatedPosition()
      draw()
    }
    
    
    
    //show up-next tetromino in mini-grid display
    const displaySquares = document.querySelectorAll('.mini-grid div')
    const displayWidth = 4
    const displayIndex = 0
    
    
    //the Tetrominos without rotations
    const upNextTetrominoes = [
      [1, displayWidth+1, displayWidth*2+1, 2], //lTetromino
      [0, displayWidth, displayWidth+1, displayWidth*2+1], //zTetromino
      [1, displayWidth, displayWidth+1, displayWidth+2], //tTetromino
      [0, 1, displayWidth, displayWidth+1], //oTetrominow
      [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] //iTetromino
    ]
    
    //display the shape in the mini-grid display
    function displayShape() {
      //remove any trace of a tetromino form the entire grid
      displaySquares.forEach(square => {
        square.classList.remove('tetromino')
        square.style.backgroundColor = ''
      })
      upNextTetrominoes[nextRandom].forEach( index => {
        displaySquares[displayIndex + index].classList.add('tetromino')
        displaySquares[displayIndex + index].style.backgroundColor = colors[nextRandom]
      })
    }
    
    //add functionality to the button
    
    pausebtn.addEventListener('click', pauseUnpause)
    
    function begin() {

      titleTheme.pause()
      gamemusic = new Audio('music/TetrisTheme.mp3')
      gamemusic.play()
      
      gameInProgress = true
      
      beginbtn.style.display = 'none'
      draw()
      timerId = setInterval(moveDown, interval)
    }
    
    beginbtn.addEventListener('click', spotLightIntro)

    function spotLightIntro() {
      titleTheme.pause()
      beginbtn.style.display = 'none'

      spotLightNoise = new Audio('music/spotlight.mp3')
      timerId = setInterval(spotLightIntroFn, interval) 
    }

    function spotLightIntroFn() {
      spotLight = [0, width, width*2, width*3, width*4, width*5, width*6, width*7, width*8, width*9, width*10, width*11, width*12, width*13, width*14, width*15, width*16, width*17, width*18, width*19]
      spotLight2 = [9, width+9, width*2+9, width*3+9, width*4+9, width*5+9, width*6+9, width*7+9, width*8+9, width*9+9, width*10+9, width*11+9, width*12+9, width*13+9, width*14+9, width*15+9, width*16+9, width*17+9, width*18+9, width*19+9]
      spotLight.forEach(index => {
        squares[nextSpotLight + index].classList.add('spotLight')
      })

      spotLight2.forEach(index => {
        squares[index - nextSpotLight].classList.add('spotLight')
      })  

      nextSpotLight++
      spotLightNoise.play()

      if (nextSpotLight == 5) {
        clearInterval(timerId)
        begin()
      }
    }


    function pauseUnpause() {
      gamemusic.pause()

      if (gameInProgress === true) {
        
        clearInterval(timerId)
        gameInProgress = false
        
        pauseGrey.style.display = 'flex' //grey appears
      }
    }
    
    const handleVolume = (vol) => {
      gamemusic.volume = vol.target.value; 
      // passing the range slider value as an audio volume
    }

    volumeSlider.addEventListener("input", handleVolume);

    pauseGrey.addEventListener('click', unpauseGrey)

    function unpauseGrey() {
      gamemusic.play()

      pauseGrey.style.display = 'none'
      gameInProgress = true

      timerId = setInterval(moveDown, interval)
    } 

    //add score
    function addScore() {
      for (let i = 0; i < 199; i +=width) {
        const row = [i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9]
  
        if(row.every(index => squares[index].classList.contains('taken'))) {
          score +=10
          scoreDisplay.innerHTML = score
          row.forEach(index => {
            squares[index].classList.remove('taken')
            squares[index].classList.remove('tetromino')
            squares[index].style.backgroundColor = ''
          })
          
          combochecker = true
          
          const squaresRemoved = squares.splice(i, width)
          squares = squaresRemoved.concat(squares)
          squares.forEach(cell => grid.appendChild(cell))
          
        }
      }
      
      if (combochecker) {
        combo++
        if (combo>1) {
          comboX.innerHTML = `X${combo}`
          combotext.style.display = 'block'
          combotext.classList.add('fadeOut')

          wombo = new Audio('music/womboN.mp3')
          randomWombo = Math.floor(Math.random() * 4)
          console.log(randomWombo)
          wombo.src = `music/wombo${randomWombo}.mp3`
          wombo.play()

        }
      }
    else {
      combo = 0
    }

      combochecker = false
    }
  
    //game over
    function gameOver() {
      if(current.some(index => squares[currentPosition + index].classList.contains('taken'))) {
        scoreDisplay.innerHTML = 'end'
        clearInterval(timerId)
        interval = 1000
        gamemusic.pause()
        gameover = new Audio("music/gameover.mp3");
        gameover.play()

       restartbtn.style.display = 'flex'
       gameInProgress = false
      }
    
    }

    restartbtn.addEventListener('click', gameOverCheck)

    function gameOverCheck() {
      restartbtn.style.display = 'none'

      squares.forEach(index => {

        index.classList.remove('tetromino')
        index.classList.remove('taken')
        index.style.backgroundColor = ''
      })

      scoreDisplay.innerHTML = '0'
         
      begin()
    }

    
  })

