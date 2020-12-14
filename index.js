const Game = (function () {
  const game = {}

  // private variables
  const table = 30
  let currentPlayer = 'U'
  let countGreen = 0, countRed = 1
  let GREEN = [], RED = [], DEAD = 0,
    userSelected = -1,
    noOfCellOnBoard = table * table,
    robotSelected = Math.floor(Math.random() * noOfCellOnBoard),
    playAuto = false, stepper = false

  // private methods
  function toggleCurrentPlayer() {
    currentPlayer = currentPlayer === 'C' ? 'U' : 'C'
  }

  function resetGame() {
    currentPlayer = 'U'
    countGreen = 0, countRed = 1
    userSelected = 0, noOfCellOnBoard = table * table
    robotSelected = Math.floor(Math.random() * noOfCellOnBoard)
    playAuto = false
    GREEN = [], RED = [], DEAD = 0

    const BOARD = document.getElementById('board')
    const SCORECARD = document.getElementById('live-score')
    SCORECARD.innerHTML = ''
    BOARD.innerHTML = ''
    generateBoard()
    setResult('', '', '')
  }

  function setResult(CPU, USER, Winner) {
    const red = document.getElementById('red')
    red.innerText = CPU
    const green = document.getElementById('green')
    green.innerText = USER
    const winner = document.getElementById('winner')
    winner.innerText = Winner
  }

  function updateLiveScore() {
    document.getElementById('live-score').innerHTML = `CPU: ${countRed} vs USER: ${countGreen}`
  }

  const playYourTurn = (coordinate, player1, player2, newBord) => {
    const playerData = {selections: player1.selectedPlaces, color: player1.color}
    const opponentData = {selections: player2.selectedPlaces, color: player2.color}
    const cells = document.getElementsByClassName('cell')
    const cell = cells[coordinate]
    const startingIndex = parseInt(cell.getAttribute('startIndex'))
    const lastIndex = parseInt(cell.getAttribute('endIndex'))
    const top = coordinate - table
    const bottom = coordinate + table
    const left = coordinate - 1
    const right = coordinate + 1

    if (top >= 0 && top < noOfCellOnBoard) {
      placeCoordinatesInPlace(top, newBord, playerData, opponentData)
    }
    if (bottom >= 0 && bottom < noOfCellOnBoard) {
      placeCoordinatesInPlace(bottom, newBord, playerData, opponentData)
    }
    if (left >= 0 && left < noOfCellOnBoard && left >= startingIndex) {
      placeCoordinatesInPlace(left, newBord, playerData, opponentData)
    }
    if (right >= 0 && right < noOfCellOnBoard && right <= lastIndex) {
      placeCoordinatesInPlace(right, newBord, playerData, opponentData)
    }

  }

  const placeCoordinatesInPlace = (coordinate, newSelection, playerData, opponentData) => {
    const cells = document.getElementsByClassName('cell')
    const cell = cells[coordinate]
    const color = cell.getAttribute('color')

    if (color === opponentData.color) {
      cell.setAttribute('color', 'GRAY')
      const index = opponentData.selections.indexOf(coordinate)
      if (index !== -1) {
        opponentData.selections.splice(index, 1)
      }
      DEAD++
      if (playerData.color === 'R') {
        countGreen--
      } else {
        countRed--
      }
    } else if (color === 'W') {
      cell.setAttribute('color', playerData.color)
      if (playerData.color === 'R') {
        countRed++
      } else {
        countGreen++
      }
      newSelection.push(coordinate)
    }
  }

  function startPlayingAuto() {

    if (currentPlayer === 'C') {
      let redCoordinatesCollector = []
      const player1 = {selectedPlaces: RED, color: 'R'}
      const player2 = {selectedPlaces: GREEN, color: 'G'}
      RED.map((cell) => {
        playYourTurn(cell, player1, player2, redCoordinatesCollector)
      })
      RED = redCoordinatesCollector
    } else {
      let greenCoordinatesCollector = []
      const player1 = {selectedPlaces: GREEN, color: 'G'}
      const player2 = {selectedPlaces: RED, color: 'R'}
      GREEN.map((cell) => {
        playYourTurn(cell, player1, player2, greenCoordinatesCollector)
      })
      GREEN = greenCoordinatesCollector
    }

    if ((countGreen + countRed + DEAD) === noOfCellOnBoard) {
      const player1 = 'CPU: ' + (countRed / noOfCellOnBoard * 100).toFixed(2) + '%'
      const player2 = 'USER: ' + (countGreen / noOfCellOnBoard * 100).toFixed(2) + '%'
      const winner = countGreen > countRed ? 'USER' : 'CPU'
      const whoWon = `Winner is ${winner}`
      setResult(player1, player2, whoWon)
      document.getElementById('reset').disabled = false
      document.getElementById('auto').disabled = true
      document.getElementById('step').disabled = true
    } else {
      if (playAuto) {
        toggleCurrentPlayer()
        startPlayingAuto()
      }
    }
    updateLiveScore()
  }

  function generateBoard() {
    const BOARD = document.getElementById('board')

    let value = 0, startIndex = 0
    for (let i = 0; i < table; i++) {
      if (i !== 0) startIndex += table
      let column = document.createElement('div')
      column.className = 'column'
      for (let j = 0; j < table; j++) {
        let cell = document.createElement('div')
        cell.className = 'cell'
        if (robotSelected === value) {
          cell.setAttribute('color', 'R')
          RED.push(robotSelected)
        } else {
          cell.setAttribute('color', 'W')
        }
        cell.setAttribute('value', value)
        cell.setAttribute('startIndex', startIndex)
        cell.setAttribute('endIndex', startIndex + table - 1)
        value++
        column.appendChild(cell)
      }
      BOARD.appendChild(column)
    }
  }

  function addCellListeners() {
    generateBoard()
    const board = document.getElementsByClassName('board')[0]

    board.addEventListener('click', function (event) {
      const cell = event.target
      const value = cell.getAttribute('value')
      const color = cell.getAttribute('color')
      if (userSelected !== -1 && !value && color !== 'W') return
      userSelected = parseInt(value)
      cell.setAttribute('color', 'G')
      GREEN.push(userSelected)
      countGreen++
      toggleCurrentPlayer()
      startPlayingAuto()
      document.getElementById('auto').disabled = false
      document.getElementById('step').disabled = false
    })

    document.getElementById('reset').addEventListener('click', resetGame)
    document.getElementById('auto').addEventListener('click', () => {
      playAuto = true
      toggleCurrentPlayer()
      startPlayingAuto()
    })
    document.getElementById('step').addEventListener('click', () => {
      toggleCurrentPlayer()
      startPlayingAuto()
    })

    document.getElementById('player1').addEventListener('change', (e) => {
      document.body.style.setProperty('--player-1', e.target.value)
    })
    document.getElementById('player2').addEventListener('change', (e) => {
      document.body.style.setProperty('--player-2', e.target.value)
    })
    document.getElementById('dead').addEventListener('change', (e) => {
      document.body.style.setProperty('--dead', e.target.value)
    })

  }

// public methods
  game.start = function () {
    addCellListeners()
  }

  return game
})()
document.addEventListener('DOMContentLoaded', Game.start)
