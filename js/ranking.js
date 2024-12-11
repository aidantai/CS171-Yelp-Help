let hasSubmitted = false;

export {handleRankingButton}

function handleRankingButton(button=false) {
    console.log(button);
    console.log(hasSubmitted);
    if (button === true) { 
        hasSubmitted = true;
    }

    console.log('handling ranking button');

    let correctRanking = ["American", "Mexican", "Italian", "Chinese", "Japanese"];

    let userRanking = Array.from(document.querySelectorAll('#sortable-list .card-body')).map((card) => card.textContent)
    console.log(userRanking);

    let synthesizedRanking = correctRanking.map((correctOption, index) => {
        return {
            index: index,
            correctOption: correctOption,
            userOption: userRanking[index],
            match: userRanking[index] === correctOption 
        }
    })

    let correctRankingCol = d3.select("#correct-ranking");

    console.log(synthesizedRanking)

    let cards = correctRankingCol.selectAll('.card')
        .data(synthesizedRanking)
        .join('div')
        .attr('class', 'card mb-2')
    
    if (hasSubmitted) {
        cards.transition()
            .style('background-color', d => d.match ? '#d4edda' : '#f8d7da') // Green for match, red for mismatch
            .style('color', d => d.match ? '#155724' : '#721c24') // Text color for match/mismatch
    } else {
        cards.style('background-color', "#e1e1e1")
    }
        
    cards.selectAll('.card-body')
        .data(d => [d])
        .join('div')
        .attr('class', 'card-body')
        .text(d => !hasSubmitted ? "?" : d.correctOption);
}