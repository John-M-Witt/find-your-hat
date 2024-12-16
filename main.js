const prompt = require('prompt-sync')({sigint: true});

const hat = '^';
const hole = 'O';
const fieldCharacter = '░';
const pathCharacter = '*';


class Field {
    constructor(fieldsArr = [], pathCharLocation = {row: 0, column: 0}) {
    this.field = fieldsArr;
    this.pathCharacterRow = pathCharLocation.row;  
    this.pathCharacterColumn = pathCharLocation.column; 
    }
        
    gameQuestions(isNewGame) {
        let rowsResponse;
        let columnsResponse;
        const newGameResponse = isNewGame?
        prompt('Would you like to play a game (Y/N)?  ').toUpperCase():
        prompt('Would you like to play another game (Y/N)?  ').toUpperCase();
        
    switch(newGameResponse){
        case('Y'):
            console.log('Great! Let\'s begin.');
                        
            do {
                rowsResponse = parseInt( 
                    prompt('Enter number of rows for the game board (minimum = 2). ') 
                );
                
                if(isNaN(rowsResponse) || rowsResponse < 2) {
                    console.log('Enter a valid number of rows (minimum = 2).');
                }  
            } while(isNaN(rowsResponse) || rowsResponse < 2) 
                
            do {
                columnsResponse = parseInt(
                    prompt('Enter number of columns for the game board (minimum = 2).  ') 
                );
                if(isNaN(columnsResponse) || columnsResponse < 2) {
                    console.log('Enter a valid number of columns (minimum = 2).');
                }
            } while(isNaN(columnsResponse) || columnsResponse < 2);
           
            break;

            case('N'):
                console.log('That\'s disappointing. Perhaps another time.');
                process.exit();
                break;

            default:
                console.log('Please enter Y or N only.');    
                this.gameQuestions();
        }
        return {rowsResponse, columnsResponse}
    }

    //Start checking code here
    gameDifficulty() {
        const difficultyResponse = prompt('Select difficulty level: Easy(enter E), moderate(M), or hard(H)? The higher the difficulty, the more holes you will encounter. Enter C to input a custom percent of holes.  ').toUpperCase();
        let percentHoles;

        if(difficultyResponse === 'E'){
            percentHoles = 0.20;
            return percentHoles;
        }
        else if(difficultyResponse === 'M'){ 
            percentHoles = 0.35;
            return percentHoles;
        }
        else if(difficultyResponse === 'H'){
            percentHoles = 0.50;
            return percentHoles;
        }
        else if(difficultyResponse === 'C'){
         const customPercent = parseInt(prompt('Enter the desired percentage of holes on the board.  '));
            if(isNaN(customPercent) || customPercent < 0 || customPercent > 100){
            console.log('Please enter a number between 0 and 100.');
            return this.gameDifficulty();
            } else {
                percentHoles = customPercent/100;
                return percentHoles;
            }
        } else {
            console.log('Enter E, M, H or C only.');
            return this.gameDifficulty();
        } 
    }

    generateField(rows, columns, percentHoles) {
        let fieldsArr = [];
        let holeCount = 0;

        const symbolsExHatPath = [hole, fieldCharacter];
        const totalSymbols = rows * columns;
        
        const randomRow = () =>  Math.floor(Math.random()* rows);
        const randomColumn = () => Math.floor(Math.random()* columns);


        //Randomly assigns fieldCharacters and holes to an array. If percentHoles would be breached with an additional hole, only fieldCharacters are added. 
        //PathCharacter and hat are randomly added later.
        for(let h = 0; h < rows; h++) {
            let fieldArr = [];
            for(let w = 0; w < columns; w++){
                const maxHolesReached = (holeCount + 1)/totalSymbols > percentHoles? true : false;  
                const randomSymbol = (selectedSymbols) => selectedSymbols[Math.floor(Math.random()*selectedSymbols.length)];

                if(maxHolesReached) {       
                    fieldArr.push(fieldCharacter);
                } else {
                    const symbol = randomSymbol(symbolsExHatPath);
                    holeCount = symbol === hole? holeCount +1 : holeCount;
                    fieldArr.push(symbol);
                } 
            } 
            fieldsArr.push(fieldArr);
        }
        
        // console.log(fieldsArr);
        //Places the hat randomly on the field
        fieldsArr[randomRow()][randomColumn()] = hat;    
        
        //Place the pathCharacter at a valid random position (i.e. no conflict with hat location)
        const pathCharLocation = {
            row: randomRow(),
            column: randomColumn()
        }

        if(fieldsArr[pathCharLocation.row][pathCharLocation.column] === hat){       
            while(fieldsArr[pathCharLocation.row][pathCharLocation.column] === hat) {  //If conflict occurs, continues searching for a new array location until the conflict is resolved.  
                pathCharLocation.row = randomRow();
                pathCharLocation.column = randomColumn();
            }
        }
        //Adds pathCharacter to the fieldsArray
        fieldsArr[pathCharLocation.row][pathCharLocation.column] = pathCharacter;
        
        //Return the generated field and the pathCharacter required to create a new Field class instance 
        return {fieldsArr, pathCharLocation};    
    }

    print() {  
        this.field.forEach(field => {
        console.log(field.join(''));
      });
    }

    moveQuestions () {
        const moveResponse = prompt('What direction do you want to move: left(enter L), right(R), up(U) or down(D)?  ').toUpperCase();
        
        switch(moveResponse) {
            case 'L':
                this.pathCharacterColumn -= 1;
                break;
            case 'R':
                this.pathCharacterColumn += 1;
                break;
            case 'D':
                this.pathCharacterRow += 1;
                break;
            case 'U':
                this.pathCharacterRow -= 1;
                break;
            default:
                console.log('Enter L, R, U or D only');
                return this.moveQuestions();
        }
    }

    outOfBounds() {
        return (
            this.pathCharacterColumn < 0 ||
            this.pathCharacterColumn > this.field[0].length -1 ||
            this.pathCharacterRow < 0 ||
            this.pathCharacterRow > this.field.length -1
        );
    }

    landsOnHat() {
        return this.field[this.pathCharacterRow][this.pathCharacterColumn] === hat;
    }

    landsOnHole() {
        return this.field[this.pathCharacterRow][this.pathCharacterColumn] === hole;
    }

    playGame(gamesPlayed = 0) {
        const isNewGame = gamesPlayed === 0;  

        //Collect field dimensions and difficulty level
        const {rowsResponse, columnsResponse} = this.gameQuestions(isNewGame);  
        const percentHoles = this.gameDifficulty(); //Returns percentHoles
        const { fieldsArr, pathCharLocation } = this.generateField(rowsResponse, columnsResponse, percentHoles);

        this.field = fieldsArr;
        this.pathCharacterRow = pathCharLocation.row;
        this.pathCharacterColumn = pathCharLocation.column;

        let continueGame = true;
        while(continueGame) {
            this.print();
            this.moveQuestions();
            
            if(this.outOfBounds()){
                console.log('Oops. You fell out of bounds. Watch those edges next time.');
                continueGame = false;
            } 
            else if(this.landsOnHat()){
                console.log('Great job! You found your hat.');
                continueGame = false;
            } else if(this.landsOnHole()){
                console.log('Sorry. You fell in a hole. Better luck next time.');
                continueGame = false;
            } else {
                this.field[this.pathCharacterRow][this.pathCharacterColumn] = pathCharacter;
                console.log('Safe move. Go again.');
            }
            gamesPlayed += 1; 
        }
        this.playGame(gamesPlayed);
    }
}
   
const game = new Field;
game.playGame();
