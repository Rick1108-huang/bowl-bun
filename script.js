// 初始化支出資料
let expenses = JSON.parse(localStorage.getItem('expenses')) || [];
let currentPage = 1;
const itemsPerPage = 5;

// 更新 LocalStorage
function updateLocalStorage() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
}

// 排序支出資料
function sortExpensesByDate(order = 'asc') {
  expenses.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return order === 'asc' ? dateA - dateB : dateB - dateA;
  });
}

// 渲染支出列表
function renderExpenses(order = 'asc') {
  // 排序支出資料
  sortExpensesByDate(order);

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageData = expenses.slice(start, end);

  const tbody = document.getElementById('expense-table-body');
  tbody.innerHTML = '';
  pageData.forEach(expense => {
    const row = `
      <tr>
        <td>${expense.date}</td>
        <td>${expense.amount}</td>
        <td>${expense.category}</td>
        <td>${expense.description}</td>
        <td>
          <button onclick="editExpense(${expense.id})">編輯</button>
          <button onclick="deleteExpense(${expense.id})">刪除</button>
        </td>
      </tr>
    `;
    tbody.innerHTML += row;
  });

  renderPagination();
}

// 渲染分頁按鈕
function renderPagination() {
  const totalPages = Math.ceil(expenses.length / itemsPerPage);
  const paginationDiv = document.getElementById('pagination');
  paginationDiv.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.addEventListener('click', () => {
      currentPage = i;
      renderExpenses();
    });
    paginationDiv.appendChild(button);
  }
}

// 新增/更新支出
document.getElementById('add-expense-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const date = document.getElementById('date').value;
  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;

  const newExpense = { id: Date.now(), date, amount, category, description };

  if (isEditing) {
    const index = expenses.findIndex(exp => exp.id === editingId);
    expenses[index] = newExpense;
    isEditing = false;
  } else {
    expenses.push(newExpense);
  }

  updateLocalStorage();
  renderExpenses();
  updateChart();
  calculateTotalExpense(); // 更新總支出
  e.target.reset();
});

// 編輯支出
let isEditing = false;
let editingId = null;

function editExpense(id) {
  const expense = expenses.find(exp => exp.id === id);
  document.getElementById('date').value = expense.date;
  document.getElementById('amount').value = expense.amount;
  document.getElementById('category').value = expense.category;
  document.getElementById('description').value = expense.description;

  isEditing = true;
  editingId = id;
}

// 刪除支出
function deleteExpense(id) {
  expenses = expenses.filter(exp => exp.id !== id);
  updateLocalStorage();
  renderExpenses();
  updateChart();
  calculateTotalExpense(); // 初始化總支出
}

// 繪製圓餅圖
function drawPieChart(data) {
  const canvas = document.getElementById('expense-chart');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const total = data.reduce((sum, item) => sum + item.amount, 0);
  if (total === 0) {
    ctx.fillStyle = '#000';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('沒有支出數據', canvas.width / 2, canvas.height / 2);
    return;
  }

  let startAngle = 0;
  const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
  const categories = [...new Set(data.map(item => item.category))];

  const categoryTotals = categories.map(category => ({
    category,
    total: data.filter(item => item.category === category).reduce((sum, item) => sum + item.amount, 0),
  }));

  categoryTotals.forEach((item, index) => {
    const sliceAngle = (item.total / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width / 2, canvas.height / 2) - 20, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fillStyle = colors[index % colors.length];
    ctx.fill();

    const middleAngle = startAngle + sliceAngle / 2;
    const textX = canvas.width / 2 + Math.cos(middleAngle) * (canvas.width / 2 - 40);
    const textY = canvas.height / 2 + Math.sin(middleAngle) * (canvas.height / 2 - 40);
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${item.category} (${((item.total / total) * 100).toFixed(1)}%)`, textX, textY);

    startAngle += sliceAngle;
  });
}

// 更新圖表
function updateChart() {
  drawPieChart(expenses);
}
// 計算總支出並更新顯示
function calculateTotalExpense() {
    const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
    document.getElementById('total-expense').textContent = totalExpense.toFixed(2); // 顯示兩位小數
  }
// 初始化頁面
document.addEventListener('DOMContentLoaded', () => {
  renderExpenses();
  updateChart();
  calculateTotalExpense(); // 初始化總支出
});

// 排序按鈕
document.getElementById('sort-date-asc').addEventListener('click', () => renderExpenses('asc'));
document.getElementById('sort-date-desc').addEventListener('click', () => renderExpenses('desc'));
