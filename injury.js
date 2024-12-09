
const svg = d3.select("#injury");

const plotGroup = svg.append("g").attr("class", "plot-group");
const axisGroup = svg.append("g").attr("class", "axis-group");
const injuryGroup = svg.append("g").attr("class", "injury-group");
const gameGroup = svg.append("g").attr("class", "game-group");

const margin = { top: 20, right: 30, bottom: 20, left: 40 };

const svgWidth = document.getElementById('main').clientWidth - margin.left - margin.right;
const svgHeight = document.getElementById('main').clientHeight - margin.top - margin.bottom;

const svgElement = document.getElementById('injury');
console.log(svgHeight)
svgElement.setAttribute('width', svgWidth);
svgElement.setAttribute('height', svgHeight);


const width = +svg.attr("width") - margin.left - margin.right;
const height = +svg.attr("height") - margin.top - margin.bottom;

const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

const top3 = [
    "Jayson Tatum", "Jaylen Brown", "Marcus Smart", "Kevin Durant", "Kyrie Irving", "Ben Simmons", "Julius Randle", "Jalen Brunson", "R.J. Barrett", "Joel Embiid", "James Harden", "Tyrese Maxey", "Pascal Siakam", "Fred VanVleet", "Scottie Barnes", "DeMar DeRozan", "Zach LaVine", "Nikola Vucevic", "Donovan Mitchell", "Darius Garland", "Jarrett Allen", "Cade Cunningham", "Jaden Ivey", "Bojan Bogdanovic", "Tyrese Haliburton", "Buddy Hield", "Myles Turner", "Giannis Antetokounmpo", "Khris Middleton", "Jrue Holiday", "Trae Young", "Dejounte Murray", "John Collins", "LaMelo Ball", "Terry Rozier", "Miles Bridges", "Jimmy Butler", "Edrice Adebayo / Bam Adebayo", "Tyler Herro", "Paolo Banchero", "Franz Wagner", "Wendell Carter Jr.", "Bradley Beal", "Kristaps Porzingis", "Kyle Kuzma", "Nikola Jokic", 
    "Jamal Murray", "Michael Porter Jr.", "Karl-Anthony Towns", "Anthony Edwards", "Rudy Gobert", "Shai Gilgeous-Alexander", "Josh Giddey", "Luguentz Dort", "Damian Lillard", "Anfernee Simons", "Jerami Grant", "Lauri Markkanen", "Jordan Clarkson", "Collin Sexton", "Stephen Curry", "Klay Thompson", "Draymond Green", "Kawhi Leonard", "Paul George", "Norman Powell", "LeBron James", "Anthony Davis", "Russell Westbrook", "Devin Booker", "Chris Paul", "Deandre Ayton", "De'Aaron Fox", "Domantas Sabonis", "Malik Monk", "Luka Doncic", "Kyrie Irving", "Christian Wood", "Jalen Green", "Kevin Porter Jr.", "Alperen Sengun", "Ja Morant", "Jaren Jackson Jr.", "Desmond Bane", "Zion Williamson", "Brandon Ingram", "C.J. McCollum", "Keldon Johnson", "Devin Vassell", "Tre Jones"
]

var toolTip = d3.tip()
.attr("class", "d3-tip")
.offset([-12, 0])
.html(function(event, d) {
    return "<h5>"+"Opp: "+d['Opp']+"</h5><table><thead><tr><td>Result</td><td>Score</td></tr></thead>"
            + "<tbody><tr><td>"+d['W/L']+"</td><td>"+d['TmPts']+ " - " + d['OppPts']+ "</td></tr></tbody>"
                    
});


function updateChart(
    data,
    playerData,
    team,
    player
) {
    //filter playerData by player and games by team
    const teams = data.filter(byTeam)

    function byTeam(value) {
        return value['Team'] == team
    }
    const iL = playerData.filter(byPlayer)

    function byPlayer(value) {
        return value['player'] == player
    }
    console.log('after update chart')
    console.log(player)
    console.log(iL)
    
    //find xScale using season start and end times
    const xScale = d3.scaleTime().domain([new Date(2022, 9,15), new Date(2023, 3, 10)])
        .range([0, width]);

    const axis = axisGroup.append("g").attr("transform", 'translate(60,20)');

    axis.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", 'translate(0,' + height + ')')
        .call(d3.axisBottom(xScale).ticks(8).tickFormat(d3.timeFormat("%b %d")));

    var yAxis = d3.axisLeft(yScale).ticks(10).tickSize(-width, 0, 0);

    axis.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);

    axis.append('g')
        .append('text')
        .attr('class', 'y label')
        .attr("dx", "15")
        .attr("dy", height/2 - 40)
        .attr("transform", "rotate(-90,15," + (height/2 + 10) + ")")
        .attr("text-anchor", "middle")
        .text('Win Percentage')

    const line = d3.line()
        .x(d => xScale(new Date(d['Date'])))
        .y(d => yScale(d['PCT']));
    
    const graph = plotGroup.selectAll('g')
        .data(teams);
    
    // Update 
    graph.select('path')
        .attr("class", "line")
        .attr("d", line(teams))
    
    // Enter selection 
    const graphEnter = graph.enter().append('g').attr("transform", 'translate(60,20)')
    
    // Append path 
    graphEnter.append('path')
        .attr("class", "line")
        .attr("d", line(teams))
    
    graph.exit().remove();

    const injury = injuryGroup.selectAll('g')
        .data(iL)

    // Update
    injury.select('line')
        .attr('class', 'dotted-line')
        .attr('x1', d => xScale(new Date(d['date'])))
        .attr('y1', margin.top) 
        .attr('x2', d => xScale(new Date(d['date'])))
        .attr('y2', height + margin.top) 
        .attr('stroke', function(d) {
            if (d['injury'] == 'injured') {
                return 'red'
            } else {
                return 'green'
            }
        })
        .attr('stroke-width', 2);
    
    const injuryEnter = injury.enter().append('g').attr("transform", 'translate(60,0)')

    injuryEnter.append('line')
        .attr('class', 'dotted-line')
        .attr('x1', d => xScale(new Date(d['date'])))
        .attr('y1', margin.top) 
        .attr('x2', d => xScale(new Date(d['date'])))
        .attr('y2', height + margin.top) 
        .attr('stroke', function(d) {
            if (d['injury'] == 'injured') {
                return 'red'
            } else {
                return 'green'
            }
        })
        .attr('stroke-width', 2);

    injury.exit().remove()

    const dots = gameGroup.selectAll('g')
        .data(teams)
    
     dots.select('circle')
        .attr('class', 'dot')
        .attr('r', 4)
        .attr('cx', function(d){
            return xScale(new Date(d['Date']));
        })
        .attr('cy', function(d){
            return yScale(d['PCT']);
        });

    dots.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    const dotsEnter = dots.enter().append('g').attr("transform", 'translate(60,20)')

    dotsEnter.on('mouseover', toolTip.show)
        .on('mouseout', toolTip.hide);

    dotsEnter.append('circle')
    .attr('class', 'dot')
    .attr('r', 3)
    .attr('cx', function(d){
        return xScale(new Date(d['Date']));
    })
    .attr('cy', function(d){
        return yScale(d['PCT']);
    });

    dots.exit().remove();

    

}


async function loadDataAndInitializeControls() {
    const data = await d3.csv("practice.csv", d => ({ ...d}));
    const injuries = await d3.csv("NBA Player Injury Stats(2020 - 2023).csv", d => ({ ...d}));

    // Find the unique values
    const teamOptions = [...new Set(data.map(d => d["Team"]))];

    let selectedTeam = teamOptions[0];

    const teamSelectElement = document.querySelector("#team-select");
    teamOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        teamSelectElement.appendChild(optionElement);
    });


    //update chart and player selector when team changed
    teamSelectElement.addEventListener("change", function() {
        selectedTeam = teamSelectElement.value;
        //must filter out team and top players to work with injury list
        const filterPlayers = injuries.filter(byteam)
        function byteam(value) {
            return value['team'] == selectedTeam && new Date(value['date']) > new Date(2022, 9,15) && new Date(value['date']) < new Date(2023, 4,10)
        }
        const injured = filterPlayers.filter(byTop)
        function byTop(value) {
            return top3.includes(value['player'])
        }

        //fills player selector with options of the top 3 players of selected team
        const playerOptions = [...new Set(injured.map(d => d["player"]))];
    
        let selectedPlayer = playerOptions[0];

        const playerSelectElement = document.querySelector("#player-select");
        playerSelectElement.length = 0;
        playerOptions.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            playerSelectElement.appendChild(optionElement);
        });
        updateChart(data, injured, selectedTeam, selectedPlayer)

    });

    //filter players and team on startup
    const filterPlayers = injuries.filter(byteam)
        function byteam(value) {
            return value['team'] == selectedTeam && new Date(value['date']) > new Date(2022, 9,15) && new Date(value['date']) < new Date(2023, 4,10)
        }
    const injured = filterPlayers.filter(byTop)
        function byTop(value) {
            return top3.includes(value['player'])
        }

    const playerOptions = [...new Set(injured.map(d => d["player"]))];
    
    let selectedPlayer = playerOptions[0];

    const playerSelectElement = document.querySelector("#player-select");
    playerOptions.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        playerSelectElement.appendChild(optionElement);
    });

    //update selected player and re filter injury list for selected player
    playerSelectElement.addEventListener("change", function() {
        selectedPlayer = playerSelectElement.value;
        const filterPlayersTeam = injuries.filter(byteam)
        function byteam(value) {
            return value['team'] == selectedTeam && new Date(value['date']) > new Date(2022, 9,15) && new Date(value['date']) < new Date(2023, 4,10)
        }
        const injured = filterPlayersTeam.filter(byTop)
        function byTop(value) {
            return top3.includes(value['player'])
        }
        
        updateChart(data, injured, selectedTeam, selectedPlayer);
    })
    svg.call(toolTip);
    updateChart(data, injured, selectedTeam, selectedPlayer);
}

await loadDataAndInitializeControls();

