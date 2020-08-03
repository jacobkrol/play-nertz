export function get_deck() {
    let deck = [],
        cards = ['01HR','02HR','03HR','04HR','05HR','06HR','07HR',
                 '08HR','09HR','10HR','11HR','12HR','13HR',
                 '01SB','02SB','03SB','04SB','05SB','06SB','07SB',
                 '08SB','09SB','10SB','11SB','12SB','13SB',
                 '01DR','02DR','03DR','04DR','05DR','06DR','07DR',
                 '08DR','09DR','10DR','11DR','12DR','13DR',
                 '01CB','02CB','03CB','04CB','05CB','06CB','07CB',
                 '08CB','09CB','10CB','11CB','12CB','13CB'];
    while(cards.length) {
        let index = randint(cards.length),
            chosen = cards[index];
        deck.push(chosen);
        cards.splice(index,1);
    }
    if(deck.length === 52) {
        return deck;
    } else {
        return false;
    }
}

export function solitaire_stack(bottom, top) {
    if(Number(top.slice(0,2))+1 !== Number(bottom.slice(0,2))) {
        //number alignment
        return false;
    } else if(top.slice(3,4) === bottom.slice(3,4)) {
        //alternating suit color
        return false;
    } else {
        //nothing failed tests
        return true;
    }
}

export function lake_stack(bottom, top) {
    if(Number(top.slice(0,2))-1 !== Number(bottom.slice(0,2))) {
        //number alignment
        return false;
    } else if(top.slice(2,3) !== bottom.slice(2,3)) {
        //same suit
        return false;
    } else {
        //nothing failed tests
        return true;
    }
}

export function randint(n) {
    return Math.floor(Math.random()*n);
}
