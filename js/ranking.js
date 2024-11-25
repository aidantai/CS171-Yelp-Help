let hasSubmitted = false;

function handleRankingButton(button=false) {
    console.log(button);
    console.log(hasSubmitted);
    if (button === true) { 
        hasSubmitted = true;
    }

    // mechanism to make dragging update only after having clicked submit
    if (!hasSubmitted) {
        return
    }

    console.log('handling ranking button');

    let correctRanking = ["Option 2", "Option 1", "Option 3", "Option 5", "Option 4"];

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
    
    cards.transition()
        .style('background-color', d => d.match ? '#d4edda' : '#f8d7da') // Green for match, red for mismatch
        .style('color', d => d.match ? '#155724' : '#721c24') // Text color for match/mismatch
        
    cards.selectAll('.card-body')
        .data(d => [d])
        .join('div')
        .attr('class', 'card-body')
        .text(d => d.correctOption);
}