function parseData(createGraph) {
  Papa.parse("indeed.csv", {
    download: true,
    complete: function (results) {
      createGraph(results.data);
    },
  });
}

function createGraph(data) {
  var chart = c3.generate({
    data: {
      columns: [
        ["data1", 30, 200, 100, 400, 150, 250],
        ["data2", 130, 100, 140, 200, 150, 50],
      ],
      type: "bar",
    },
    bar: {
      width: {
        ratio: 0.5, // this makes bar width 50% of length between ticks
      },
      // or
      //width: 100 // this makes bar width 100px
    },
  });

  setTimeout(function () {
    chart.load({
      columns: [["data3", 130, -150, 200, 300, -200, 100]],
    });
  }, 1000);

//   var types = [];
//   var salary = [];

//   for (var i = 1; i < data.length; i++) {
//     types.push(data[i][2]);
//     salary.push(data[i][4]);
//   }
}

parseData(createGraph);
