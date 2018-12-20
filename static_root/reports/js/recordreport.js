var myDoughnutChart;

document.addEventListener("DOMContentLoaded", function (event) {
  var ctx = document.getElementById("piechart").getContext('2d');
  myDoughnutChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors
      }]
    },
    options: {
      animation: {
        duration: 0,
      },
      legend: {
        labels: {
          fontSize: 10
        }
      }
    }
  });
});

window.onbeforeprint = function (event) {
  if (typeof myDoughnutChart === 'object') {
    myDoughnutChart.resize();
  }
};

cheet('f o o b a r', function () { window.location.replace('https://www.youtube.com/watch?v=dQw4w9WgXcQ') });
