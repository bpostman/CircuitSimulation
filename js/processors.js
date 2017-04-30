/**
 * Created by benpostman on 4/30/17.
 */
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
