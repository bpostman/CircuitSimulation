

var setup;
var scenario = 0;
//Enums for grid type and direction
var Dir = {
    RIGHT: 'right',
    DOWN: 'down',
    SPLIT: 'split'
};

var Type = {
    OWIRE: 'oWireGrid',
    IWIRE: 'iWireGrid',
    TWIRE: 'tWireGrid',
    GATE: 'gateGrid'
};

var Gate = {
    NAND: 'NAND',
    NOR: 'NOR',
    AND: 'AND',
    OR: 'OR'
};

$( init );

function init() {

/*******************************************************************/
//Do some initial setup

    //Set scenario only on first run
    if (scenario === 0)
        setScenario();

/************************************************************************/
//Event handler functions


    //Drop handler
    $('.droppable').droppable({
        drop: handleDropEvent,
        hoverClass: 'hovered',
        accept: '.newGate'
    });

    //Click handler for wire grids
    $('.wireGrid').click(function () {
        if (setup) {
            var grid = $(this);

            //If grid is active with right, remove right, add down
            if (grid.hasClass('active') && grid.hasClass(Dir.RIGHT)) {

                grid.removeClass(Dir.RIGHT);

                //tWire can only go down into an iWire row, which is every fourth row starting at 3rd
                if (grid.hasClass(Type.TWIRE) && grid.data('col') % 4 !== 3)
                    grid.removeClass('active');

                //Bottom row cannot go down,
                else if (grid.data('row') !== 7 || grid.data('col') % 2 === 0)
                    grid.addClass(Dir.DOWN);

                else
                    grid.removeClass('active');
            }

            //If grid is active with down, remove down and add right_down
            else if (grid.hasClass('active') && grid.hasClass(Dir.DOWN)) {
                grid.removeClass(Dir.DOWN);
                grid.addClass(Dir.SPLIT);
            }

            //If grid is active with split, remove split and active
            else if (grid.hasClass('active') && grid.hasClass(Dir.SPLIT)) {
                grid.removeClass(Dir.SPLIT);
                grid.removeClass('active');
            }

            //If grid is not active, add active and right
            else if (!grid.hasClass('active')) {
                grid.addClass('active');
                grid.addClass(Dir.RIGHT);
            }
        }
    });


}

/****************************************************************************/
//Callback functions for event handlers

function handleDropEvent() {

    if (setup) {
        var element = $('.ui-draggable-dragging');
        var currentDrop = $(this);

        if (currentDrop.hasClass('droppable')) {

            if (element.hasClass(Gate.NAND))
                currentDrop.addClass(Gate.NAND);
            else if (element.hasClass(Gate.NOR))
                currentDrop.addClass(Gate.NOR);
            else if (element.hasClass(Gate.AND))
                currentDrop.addClass(Gate.AND);
            else if (element.hasClass(Gate.OR))
                currentDrop.addClass(Gate.OR);

            currentDrop.addClass('hasGate');
            currentDrop.removeClass('droppable');
         }
    }
}

//Returns correct gate when a gate is dragged
function myHelper() {
    return $('<div class="' + this.className + '"></div>');
}


function setBreadBoard() {

    //Remove all placed gates, set all wires to inactive
    $('#breadBoard').find('*').each(function(){
        $(this).removeClass('hasGate NAND NOR AND OR active right split down zero one starter1 starter0');

        if ($(this).hasClass('gateGrid'))
            $(this).addClass('droppable');
    });

    var lasts = [];

    //Set data and class for each grid square with row and column
    for (var i = 0; i < 8; i++) {
        var j = 0;
        $('.row-' + i).find($("[class*='Grid']")).each(function () {
            $(this).data('row', i).data('col', j);
            $(this).addClass(i.toString() + j.toString());
            j++;
        });
        lasts.push(--j);
    }
    setInitialValues();

    //Set last elements
    for (i = 0; i < 8; i++) {
        var grid = $('.' + i.toString() + lasts[i].toString());
        if (grid.hasClass('gateGrid') && grid.data('row') !== 1)
            grid.addClass('result');

    }
}


//Sets up control board
function setControlBoard() {

    //Clear control board first
    $('#gates').find('*').remove('*');

    var buttonContainer = $('#buttonContainer');
    buttonContainer.find('*').remove('*');

    getGates();


    var button = '<button type="button" id="startButton">Start</button>';
    buttonContainer.append(button);

    //Handler for start button
    $('#startButton').click(function () {
        if (setup) {
            setup = false;
            start();
        }
    });
}


//Utility function to return the correct type of gate
function getGates() {

    //Declare and define different gates with their draggable methods
    var NAND = $('<div class="NAND newGate"></div>').data("type", "NAND").
        draggable({ cursor: 'move', helper: myHelper, revert: true });
    var NOR = $('<div class="NOR newGate"></div>').data("type", "NOR").
        draggable({ cursor: 'move', helper: myHelper, revert: true });
    var AND = $('<div class="OR newGate"></div>').data("type", "OR").
        draggable({ cursor: 'move', helper: myHelper, revert: true });
    var OR = $('<div class="AND newGate"></div>').data("type", "AND").
        draggable({ cursor: 'move', helper: myHelper, revert: true });

    if (scenario === 0) {
        NAND.appendTo('#gates');
        NOR.appendTo('#gates');
        AND.appendTo('#gates');
        OR.appendTo('#gates');
    }

    else if (scenario === 1) {
        NAND.appendTo('#gates');
        NOR.appendTo('#gates');
    }

    else if (scenario === 2) {
        NOR.appendTo('#gates');
        OR.appendTo('#gates');
    }

    else if (scenario === 3) {
        NAND.appendTo('#gates');
        AND.appendTo('#gates');
    }

    else if (scenario === 4) {
        NAND.appendTo('#gates');
    }
}

//Gives initial values to starter grids depending on scenario
function setInitialValues() {
    $('.starter').each(function () {

        var curr = $(this);
        var row = curr.data('row');

        if (scenario === 0) {
            if (row === 1) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }

            else if (row === 3) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }

            else if (row === 5) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }

            else if (row === 7) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }
        }


        else if (scenario === 1) {
            if (row === 1) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }

            else if (row === 3) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }

            else if (row === 5) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }

            else if (row === 7) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }
        }


        else if (scenario === 2) {
            if (row === 1) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }

            else if (row === 3) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }

            else if (row === 5) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }

            else if (row === 7) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }
        }

        else if (scenario === 3) {
            if (row === 1) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }

            else if (row === 3) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }

            else if (row === 5) {
                curr.addClass("starter" + 0);
                curr.data('value', 0);
            }

            else if (row === 7) {
                curr.addClass("starter" + 1);
                curr.data('value', 1);
            }
        }

    });
}


/****************************************************************************/


//Executes game logic, called once setup is over
function start() {

    //Set initial values
    starters();

    //Iterate through each row
    for (var i = 0; i < 8; i++) {

        //Iterate through each column, starting at 1, because of starters
        $('.row-' + i).find($("[class*='Grid']")).each(function () {

            var source = $(this);

            //Only check for connection if this grid has a value
            if (source.data("value") !== undefined) {
                if (source.hasClass('wireGrid'))
                    processWire(source);
                else if (source.hasClass('hasGate'))
                    processGate(source);
            }

        });
    }

    checkResult();
}

function setScenario() {

    if (scenario === 0)
        alert("Welcome to the game. You must get a value of 1 to each red square");
    else if (scenario === 1)
        alert("Congratulations on making it to level 2. You must get a value of 1 to the top red square, " +
            "0 to the middle red square, and 1 to the bottom red square.");
    else if (scenario === 2)
        alert("Good work on level 2. This round, you must get a value of 1 to each red square.");
    else if (scenario === 3)
        alert("You've reached the final level. This round, you must get a value of 0 to the top red square, " +
            "1 to the middle red square, and 0 to the bottom red square.");


    //Assign row and column data to each grid
    setBreadBoard();

    //Setup for control board
    setControlBoard();

    setup = true;

}


function checkResult() {

    var success = true;
    $('.result').each(function(i) {
        var curr = $(this);
        var val = curr.data('value');

        //Scenario 0 expects 1 at all three results gates
        if (scenario === 0) {
            if (val !== 1 || val === undefined) {
                success = false;
                alert(i + ": " + val);
            }

        }

        else if (scenario === 1) {
            if (i === 0 && val !== 1)
                success = false;
            if (i === 1 && val !== 0)
                success = false;
            if (i === 2 && val !== 1)
                success = false;
        }

        //Scenario 2 expects 0 at all three results gates
        if (scenario === 2) {
            if (val !== 0 || val === undefined)
                success = false;
        }

        else if (scenario === 3) {
            if (i === 0 && val !== 0)
                success = false;
            if (i === 1 && val !== 1)
                success = false;
            if (i === 2 && val !== 0)
                success = false;
        }
    });



    if (success) {

        if (scenario === 3) {
            alert("You have won the game, congratulations!");
            return;
        }

        alert("You succeeded, click 'Next Level' to proceed");

        //noinspection JSDuplicatedDeclaration
        var button = '<button type="button" id="nextButton">Next Level</button>';
        $('#buttonContainer').append(button);

        //Handler for the next level button
        $('#nextButton').click(function () {
            scenario++;
            setScenario();
        });

    }

    else {
        alert("You failed, click 'start over' to play again");

        //noinspection JSDuplicatedDeclaration
        var button = '<button type="button" id="startOver">Start Over</button>';
        $('#buttonContainer').append(button);

        //Handler for the start over button
        $('#startOver').click(function () {
            setScenario();
        });
    }

}


function processGate(source) {

    //-----------------------------------------------------------------
    //Get Source Info

    //Get info on source
    var sourceRow = source.data('row');
    var sourceCol = source.data('col');
    var gateType;

    if (source.hasClass(Gate.NAND))
        gateType = Gate.NAND;
    else if (source.hasClass(Gate.NOR))
        gateType = Gate.NOR;
    else if (source.hasClass(Gate.AND))
        gateType = Gate.AND;
    else if (source.hasClass(Gate.OR))
        gateType = Gate.OR;
    else {
        alert("No valid gate type supplied for: " + sourceRow + ", " + sourceCol);
        return -1;
    }


    //-----------------------------------------------------------------
    //Get info on the iWires for this gate, perform some validation

    var top = $('.' + sourceRow.toString() + (sourceCol - 2).toString());
    var bottom = $('.' + sourceRow.toString() + (sourceCol - 1).toString());

    //Return if top and bottom iWires are not either split or right
    if (!(top.hasClass(Dir.RIGHT) || top.hasClass(Dir.SPLIT)) &&
        !(bottom.hasClass(Dir.RIGHT) || bottom.hasClass(Dir.RIGHT))) {
            alert("Gate at: " + sourceRow + ", " + sourceCol + " does not have two valid iWire inputs");
            return -1;
    }

    var input1 = top.data('value');
    var input2 = bottom.data('value');

    //-----------------------------------------------------------------
    //Get and set destination info

    //Get destination positions
    var destRow = sourceRow;
    var destCol = sourceCol + 1;
    var output;
    var dest = $('.' + destRow.toString() + destCol.toString());

    //-----------------------------------------------------------------
    //Depending on gate type, set output appropriately

    if (gateType === Gate.NAND) {
        if (input1 === 1 && input2 === 1)
            output = 0;
        else
            output = 1;
    }

    else if (gateType === Gate.NOR) {
        if (input1 === 0 && input2 === 0)
            output = 1;
        else
            output = 0;
    }

    else if (gateType === Gate.AND) {
        if (input1 === 1 && input2 === 1)
            output = 1;
        else
            output = 0;
    }

    else if (gateType === Gate.OR) {
        if (input1 === 1 || input2 === 1)
            output = 1;
        else
            output = 0;
    }

    //-----------------------------------------------------------------
    //Store value in destination

    dest.data('value', output);
    if (output === 0)
        dest.addClass('zero');
    else if (output === 1)
        dest.addClass('one');
}

//Returns destination element starting from an oWireGrid
function processWire(source) {

    //-----------------------------------------------------------------
    //Get Source Info

    //Get info on source
    var sourceRow = source.data('row');
    var sourceCol = source.data('col');
    var sourceVal = source.data('value');
    var sourceDir = "";
    var sourceType = "";

    //Get Direction
    if (source.hasClass(Dir.RIGHT))
        sourceDir = Dir.RIGHT;
    else if (source.hasClass(Dir.DOWN))
        sourceDir = Dir.DOWN;
    else if (source.hasClass(Dir.SPLIT))
        sourceDir = Dir.SPLIT;
    else {
        //alert('NO VALID DIRECTION FROM SOURCE AT: ' + sourceRow + ", " +sourceCol);
        //source.css('background-color', 'red');
        return -1;
    }

    //Get Type of Wire Grid
    if (source.hasClass(Type.OWIRE))
        sourceType = Type.OWIRE;
    else if (source.hasClass(Type.IWIRE))
        sourceType = Type.IWIRE;
    else if (source.hasClass(Type.TWIRE))
        sourceType = Type.TWIRE;
    else if (source.hasClass(Type.GATE))
        sourceType = Type.GATE;
    else {
        alert('NO VALID TYPE FROM SOURCE AT: ' + sourceRow + ", " +sourceCol);
        //source.css('background-color', 'red');
        return -1;
    }

    //-----------------------------------------------------------------
    //Declare destination placeholders

    //Get destination positions
    var destRow1;
    var destCol1;

    var destRow2;
    var destCol2;

    var split = false;

    //-----------------------------------------------------------------
    //Check source properties, execute appropriate logic

    if (sourceDir === Dir.RIGHT) {

        if (sourceType === Type.OWIRE) {
            destRow1 = sourceRow;
            destCol1 = sourceCol + 2; // +2 because of stacked iWireGrids
            //alert(sourceDir + " " + sourceRow + ", " + sourceCol + "\n" + destRow1 + ", " + destCol1);
        }

        else if (sourceType === Type.IWIRE) {
            destRow1 = sourceRow;

            //Source is top iWire
            if (sourceCol % 2 === 0)
                destCol1 = sourceCol + 2;

            //Source is bottom iWire
            else
                destCol1 = sourceCol + 1;
        }

        else if (sourceType === Type.TWIRE) {
            destRow1 = sourceRow;
            destCol1 = sourceCol + 1;
        }
    }

    else if (sourceDir === Dir.DOWN) {

        if (sourceType === Type.OWIRE) {
            destRow1 = sourceRow + 1;
            destCol1 = sourceCol + 1; // +1 because tWire is offset by 1
            //alert(sourceDir + " " + sourceRow + ", " + sourceCol + "\n" + destRow1 + ", " + destCol1);
        }

        else if (sourceType === Type.IWIRE) {
            //Source is top iWire
            if (sourceCol % 2 === 0) {
                destRow1 = sourceRow;
                destCol1 = sourceCol + 1;
            }

            //Source is bottom iWire
            else {
                destRow1 = sourceRow + 1;
                destCol1 = sourceCol;
            }
        }

        //If tWire has down, it is going to a top iWire
        else if (sourceType === Type.TWIRE) {
            destRow1 = sourceRow + 1;
            destCol1 = sourceCol - 1;
        }
    }

    else if (sourceDir === Dir.SPLIT) {

        if (sourceType === Type.OWIRE) {
            //Right
            destRow1 = sourceRow;
            destCol1 = sourceCol + 2; // +2 because of stacked iWireGrids
            //alert(sourceDir + " " + sourceRow + ", " + sourceCol + "\n" + destRow1 + ", " + destCol1);

            //Down
            destRow2 = sourceRow + 1;
            destCol2 = sourceCol + 1; // +1 because tWire is offset by 1
            //alert(sourceDir + " " + sourceRow + ", " + sourceCol + "\n" + destRow2 + ", " + destCol2);
        }

        else if (sourceType === Type.IWIRE) {
            //Source is top iWire
            if (sourceCol % 2 === 0) {
                //Right
                destRow1 = sourceRow;
                destCol1 = sourceCol + 2;

                //Down
                destRow2 = sourceRow;
                destCol2 = sourceCol + 1;
            }
            //Source is bottom iWire
            else {
                //Right
                destRow1 = sourceRow;
                destCol1 = sourceCol + 1;

                //Down
                destRow2 = sourceRow + 1;
                destCol2 = sourceCol;
            }
        }

        //If tWire has a split, down segment is going to a top iWire
        else if (sourceType === Type.TWIRE) {
            //Right
            destRow1 = sourceRow;
            destCol1 = sourceCol + 1;

            //Down
            destRow2 = sourceRow + 1;
            destCol2 = sourceCol - 1;
        }

        //Set this for all source directions
        split = true;
    }

    else {
        return 0;
    }

    //-----------------------------------------------------------------
    //Get destinations, perform some validation, set destination values

    //Gets set to true if the dest is a wire grid
    var dest1Wire = false;
    var dest2Wire = false;
    console.log("dest1: " + destRow1 + ", " + destCol1);
    //Set destination(s)
    var dest1 = $('.' + destRow1.toString() + destCol1.toString());
    if (dest1.hasClass('wireGrid'))
        dest1Wire = true;
    if (split) {
        console.log("dest2: " + destRow1 + ", " + destCol1);
        var dest2 = $('.' + destRow2.toString() + destCol2.toString());
        if (dest2.hasClass('wireGrid'))
            dest2Wire = true;
    }

    //Assign values to destination grid(s), assuming valid connection
    if (dest1) {
        dest1.data('value', sourceVal);

        if (dest1Wire)
            if (sourceVal === 0)
                dest1.addClass('zero');
            else if (sourceVal === 1)
                dest1.addClass('one');

    }

    if (split && dest2) {
        //Assign values to destination grid(s)
        dest2.data('value', sourceVal);

        if (dest2Wire)
            if (sourceVal === 0)
                dest2.addClass('zero');
            else if (sourceVal === 1)
                dest2.addClass('one');


    }
}


//Sets connections from each starter
function starters() {
    $('.starter').each(function() {

        var source = $(this);
        var value = $(this).data('value');

        //Get destination positions
        var destRow = source.data("row");
        var destCol = source.data("col") + 1;

        //Find connection based on row and column
        var dest = $('.' + destRow.toString() + destCol.toString());

        if (dest < 0) {
            alert("ERROR ERROR");
        }

        else {
            dest.data("value", value);
            dest.addClass('active');
        }

        dest.addClass('active');
        if (value === 0)
            dest.addClass('zero');
        else if (value === 1)
            dest.addClass('one');

    });

}
