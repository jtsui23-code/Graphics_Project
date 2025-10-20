


function getAllPositionsColors() {

    // Clearing these arrays so they don't retain old information
    // These arrays already exist they are global variables.
    graphicsPosition = [];
    graphicColors = [];


    graphicsPosition.push(...hero.pos);
    graphicColors.push(...hero.color);

    for (let i = 0; i < 10; i++){
        graphicsPosition.push(...zombies[i].pos);
        graphicColors.push(... zombies[i].color);
    }
}