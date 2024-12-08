d3.csv("celtics.csv").then(data => {
    
    const parseDate = d3.timeParse("%m/%d/%y");
    data.forEach(d => {
        d.date = parseDate(d["Date"]);
        d.pts1 = +d["PTS1"] || 0;
        d.pts2 = +d["PTS2"] || 0;
        d.pts3 = +d["PTS3"] || 0;
        d.name1 = d["Name1"];
        d.name2 = d["Name2"];
        d.name3 = d["Name3"];
        d.totalPoints = (d["Tm"] || 0);
        d.otherPlayers = d.totalPoints - (d.pts1 + d.pts2 + d.pts3);
      });
    createChart(data);
  });

  d3.csv("bucks.csv").then(secondData => {
    const parseDate = d3.timeParse("%m/%d/%y");
    secondData.forEach(d => {
        d.date = parseDate(d["Date"]);
        d.pts1 = +d["PTS1"] || 0;
        d.pts2 = +d["PTS2"] || 0;
        d.pts3 = +d["PTS3"] || 0;
        d.name1 = d["Name1"];
        d.name2 = d["Name2"];
        d.name3 = d["Name3"];
        d.totalPoints = +d["Tm"] || 0;
        d.otherPlayers = d.totalPoints - (d.pts1 + d.pts2 + d.pts3);
    });

    createSecondChart(secondData);
});

  function createChart(data) {
    const margin = { top: 40, right: 30, bottom: 200, left: 70 };
    //w and h should be based on div container
    const width = document.getElementById('chart').clientWidth - margin.left - margin.right;
    const height = document.getElementById('chart').clientHeight - margin.top - margin.bottom;

    



  

    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  

    const x = d3.scaleBand().range([0, width]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 160]).range([height, 0]);
    const color = d3.scaleOrdinal()
      .domain(["pts1", "pts2", "pts3", "otherPlayers"])
      .range(["blue", "royalblue", "dodgerblue", "lightblue"]);
  
    const formatDate = d3.timeFormat("%b %d, %Y");
    //x and y axis
    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
    const yAxis = svg.append("g");
  
    // chart title
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${-margin.top / 2 +15})`)
      .style("text-anchor", "middle")
      .style("font-size", "40px")
      .style("font-weight", "bold")
      .text("Boston Celtics");
  

    svg.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.bottom - 75})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Game Date");
  

    svg.append("text")
      .attr("transform", "rotate(-90)")  
      .attr("y", -margin.left + 30)     
      .attr("x", -height / 2)           
      .style("text-anchor", "middle")   
      .style("font-size", "14px")
      .text("Team Point Breakdown");
  
    //hover info
    const tooltip = d3.select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px");
  
    
    function updateChart(filteredData, showAllDates) {
        svg.selectAll("g.layer").remove();

      //change x domain based on month
      x.domain(filteredData.map(d => d.date));
        // x axis tick values only show first game of each month on all months view
        //all 
      let tickValues;
      if (showAllDates) {
        tickValues = filteredData.map(d => d.date);
      } else {
        tickValues = d3.groups(filteredData, d => d3.timeFormat("%Y-%m")(d.date))
          .map(group => group[1][0].date);
      }
  
      //update the axes, fix date for x axis
      xAxis.call(
        d3.axisBottom(x)
          .tickValues(tickValues)
          .tickFormat(d => formatDate(d)) 
      );
      yAxis.call(d3.axisLeft(y));
  
      //making stacked bars
      const stack = d3.stack().keys(["pts1", "pts2", "pts3", "otherPlayers"]);
      const stackedData = stack(filteredData);
  
      const layers = svg.selectAll("g.layer").data(stackedData);
  
      layers.enter()
        .append("g")
        .attr("class", "layer")
        .merge(layers)
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.date))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
          //hover info details
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`
            <strong>Game: ${formatDate(d.data.date)}</strong><br/>
            Team Points: ${d.data.Tm} points<br/>
            Player 1 (${d.data.name1}): ${d.data.pts1} points<br/>
            Player 2 (${d.data.name2}): ${d.data.pts2} points<br/>
            Player 3 (${d.data.name3}): ${d.data.pts3} points<br/>
            Other Players: ${d.data.otherPlayers} points
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function() {
           
          tooltip.transition().duration(500).style("opacity", 0);
        });
  
      layers.exit().remove();
    }
  
    
    updateChart(data, false);
    
  
    //month selector
    const monthSelections = Array.from(
      new Set(data.map(d => d3.timeFormat("%B")(d.date)))
    );
  
    const dropdown = d3.select("#monthDropdown");
  
    dropdown
      .selectAll("option.month")
      .data(monthSelections)
      .enter()
      .append("option")
      .attr("class", "month")
      .attr("value", d => d)
      .text(d => d);
  
    dropdown.on("change", function () {
      const selectedMonth = this.value;
      if (selectedMonth === "all") {
        updateChart(data, false);
      } else {
        const filteredData = data.filter(
          d => d3.timeFormat("%B")(d.date) === selectedMonth
        );
        updateChart(filteredData, true);
      }
    });
  //handles resizing the browser window
    window.addEventListener('resize', function() {
      const newWidth = document.getElementById('chart').clientWidth - margin.left - margin.right;
      const newHeight = document.getElementById('chart').clientHeight - margin.top - margin.bottom;
      
      svg.attr("width", newWidth + margin.left + margin.right)
         .attr("height", newHeight + margin.top + margin.bottom);
      
      x.range([0, newWidth]);
      y.range([newHeight, 0]);
  
      updateChart(data, false);
    });
  }
  function createSecondChart(data) {
    const margin = { top: 40, right: 30, bottom: 200, left: 70 };
    //w and h should be based on div container
    const width = document.getElementById('chart2').clientWidth - margin.left - margin.right;
    const height = document.getElementById('chart2').clientHeight - margin.top - margin.bottom;

    



  

    const svg = d3.select("#chart2")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  

    const x = d3.scaleBand().range([0, width]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 160]).range([height, 0]);
    const color = d3.scaleOrdinal()
      .domain(["pts1", "pts2", "pts3", "otherPlayers"])
      .range(["blue", "royalblue", "dodgerblue", "lightblue"]);
  
    const formatDate = d3.timeFormat("%b %d, %Y");
    //x and y axis
    const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
    const yAxis = svg.append("g");
  
    // chart title
    svg.append("text")
      .attr("transform", `translate(${width / 2}, ${-margin.top / 2 +15})`)
      .style("text-anchor", "middle")
      .style("font-size", "40px")
      .style("font-weight", "bold")
      .text("Milwaukee Bucks");
  

    svg.append("text")
      .attr("transform", `translate(${width / 2},${height + margin.bottom - 75})`)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Game Date");
  

    svg.append("text")
      .attr("transform", "rotate(-90)")  
      .attr("y", -margin.left + 30)     
      .attr("x", -height / 2)           
      .style("text-anchor", "middle")   
      .style("font-size", "14px")
      .text("Team Point Breakdown");
  
    //hover info
    const tooltip = d3.select("#chart")
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px");
  
    
    function updateChart(filteredData, showAllDates) {
        svg.selectAll("g.layer").remove();

      //change x domain based on month
      x.domain(filteredData.map(d => d.date));
        // x axis tick values only show first game of each month on all months view
        //all 
      let tickValues;
      if (showAllDates) {
        tickValues = filteredData.map(d => d.date);
      } else {
        tickValues = d3.groups(filteredData, d => d3.timeFormat("%Y-%m")(d.date))
          .map(group => group[1][0].date);
      }
  
      //update the axes, fix date for x axis
      xAxis.call(
        d3.axisBottom(x)
          .tickValues(tickValues)
          .tickFormat(d => formatDate(d)) 
      );
      yAxis.call(d3.axisLeft(y));
  
      //making stacked bars
      const stack = d3.stack().keys(["pts1", "pts2", "pts3", "otherPlayers"]);
      const stackedData = stack(filteredData);
  
      const layers = svg.selectAll("g.layer").data(stackedData);
  
      layers.enter()
        .append("g")
        .attr("class", "layer")
        .merge(layers)
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => x(d.data.date))
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("width", x.bandwidth())
        .on("mouseover", function(event, d) {
          //hover info details
          tooltip.transition().duration(200).style("opacity", .9);
          tooltip.html(`
            <strong>Game: ${formatDate(d.data.date)}</strong><br/>
            Team Points: ${d.data.Tm} points<br/>
            Player 1 (${d.data.name1}): ${d.data.pts1} points<br/>
            Player 2 (${d.data.name2}): ${d.data.pts2} points<br/>
            Player 3 (${d.data.name3}): ${d.data.pts3} points<br/>
            Other Players: ${d.data.otherPlayers} points
          `)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 28}px`);
        })
        .on("mouseout", function() {
           
          tooltip.transition().duration(500).style("opacity", 0);
        });
  
      layers.exit().remove();
    }
  
    
    updateChart(data, false);
    
  
    //month selector
    const monthSelections = Array.from(
      new Set(data.map(d => d3.timeFormat("%B")(d.date)))
    );
  
    const dropdown = d3.select("#monthDropdown");
  
    dropdown
      .selectAll("option.month")
      .data(monthSelections)
      .enter()
      .append("option")
      .attr("class", "month")
      .attr("value", d => d)
      .text(d => d);
  
    dropdown.on("change", function () {
      const selectedMonth = this.value;
      if (selectedMonth === "all") {
        updateChart(data, false);
      } else {
        const filteredData = data.filter(
          d => d3.timeFormat("%B")(d.date) === selectedMonth
        );
        updateChart(filteredData, true);
      }
    });
  //handles resizing the browser window
    window.addEventListener('resize', function() {
      const newWidth = document.getElementById('chart').clientWidth - margin.left - margin.right;
      const newHeight = document.getElementById('chart').clientHeight - margin.top - margin.bottom;
      
      svg.attr("width", newWidth + margin.left + margin.right)
         .attr("height", newHeight + margin.top + margin.bottom);
      
      x.range([0, newWidth]);
      y.range([newHeight, 0]);
  
      updateChart(data, false);
    });
}
  