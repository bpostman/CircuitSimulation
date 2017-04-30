
$( init );
var setup;

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

function init() {

/*******************************************************************/
//Do some initial setup


    //Set to false once user starts the game
    setup = true;

    //Assign row and column data to each grid
    assignPositions();

    //Setup for control board
    setControlBoard();

/************************************************************************/
//Event handler functions


    //Drop handler
    $('.droppable').droppable({
        drop: handleDropEvent,
        hoverClass: 'hovered',
        accept: '.newGate'
    });


    //Click handler for gate grids
    $('.gateGrid').click(function () {
        if (setup) {
            var gate = $(this);
            if (gate.hasClass('active')) {
                gate.removeClass('active');
                gate.addClass('droppable');
            }

            else if (gate.hasClass('droppable')) {
                gate.addClass('active');
                gate.removeClass('droppable');
            }
        }
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


    //Handler for button
    $('#button').click(function () {
        if (setup) {
            setup = false;

            start();
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
            currentDrop.removeClass('clickable');
            currentDrop.removeClass('droppable');
         }
    }
}

//Returns correct gate when a gate is dragged
function myHelper() {
    return $('<div class="' + this.className + '"></div>');
}


//Gives column, row, and class information to each gridsquare
function assignPositions() {
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

    //Assign initial values to starting grids
    var val = 0;
    $('.starter').each(function() {
        $(this).addClass("starter"+val%2);
        $(this).data('value', val++ % 2);
    });

    //Set last elements
    for (i = 0; i < 8; i++) {
        $('.' + i.toString() + lasts[i].toString()).addClass('last');

    }
}


//Sets up control board
function setControlBoard() {
    for (var i = 0; i < 4; i++) {
        getGate(i).appendTo('#gates').draggable({
            cursor: 'move',
            helper: myHelper,
            revert: true
        });
    }

    var button = '<button type="button" id="button">Click Me!</button>';
    $('#buttonContainer').append(button);
}


//Utility function to return the correct type of gate
function getGate(num) {
    if (num % 4 === 0) {
        return $('<div class="NAND newGate"></div>').data("type", "NAND");
    }
    else if (num % 4 === 1) {
        return $('<div class="NOR newGate"></div>').data("type", "NOR");
    }
    else if (num % 4 === 2) {
        return $('<div class="OR newGate"></div>').data("type", "OR");
    }
    else if (num % 4 === 3) {
        return $('<div class="AND newGate"></div>').data("type", "AND");
    }
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

           /* else {
                source.css('background-color', 'red');
            }*/

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
        source.css('background-color', 'red');
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
        source.css('background-color', 'red');
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
                destCol2 = sourceCol + 1;
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

    //Set destination(s)
    var dest1 = $('.' + destRow1.toString() + destCol1.toString());
    if (dest1.hasClass('wireGrid'))
        dest1Wire = true;
    if (split) {
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
