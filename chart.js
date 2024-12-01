function renderChart() {
    const categories = [...new Set(expenses.map(exp => exp.category))];
    const data = categories.map(category => {
      return expenses.filter(exp => exp.category === category).reduce((sum, exp) => sum + exp.amount, 0);
    });
  
    const ctx = document.getElementById('expense-chart').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: categories,
        datasets: [{
          data: data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#AA64E2']
        }]
      }
    });
  }
  