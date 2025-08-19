class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement, historyListElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.historyListElement = historyListElement;
        this.history = [];
        this.readyToReset = false;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.updateDisplay();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }

    delete() {
        if (this.currentOperand.length <= 1) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }
    }

    chooseOperation(operation) {
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            return;
        }
        if (this.currentOperand === '') return;
        if (this.previousOperand !== '') {
            this.compute();
        }
        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);
        if (isNaN(prev) || isNaN(current)) return;
        
        let opSymbol;
        switch (this.operation) {
            case 'add': computation = prev + current; opSymbol = '+'; break;
            case 'subtract': computation = prev - current; opSymbol = '-'; break;
            case 'multiply': computation = prev * current; opSymbol = '×'; break;
            case 'divide':
                if (current === 0) {
                    this.showError();
                    return;
                }
                computation = prev / current;
                opSymbol = '÷';
                break;
            default:
                return;
        }
        
        this.addHistoryEntry(prev, opSymbol, current, computation);
        
        this.currentOperand = parseFloat(computation.toPrecision(12));
        this.operation = undefined;
        this.previousOperand = '';
        this.readyToReset = true;
    }
    
    addHistoryEntry(prev, op, curr, result) {
        const entry = `${this.getDisplayNumber(prev)} ${op} ${this.getDisplayNumber(curr)} = ${this.getDisplayNumber(result)}`;
        this.history.unshift(entry); // Add to the beginning of the array
        if (this.history.length > 20) {
            this.history.pop(); // Keep history size manageable
        }
        this.updateHistoryDisplay();
    }

    updateHistoryDisplay() {
        this.historyListElement.innerHTML = ''; // Clear previous list
        this.history.forEach(entry => {
            const li = document.createElement('li');
            li.textContent = entry;
            this.historyListElement.appendChild(li);
        });
    }

    getDisplayNumber(number) {
        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];
        let integerDisplay = isNaN(integerDigits) ? '' : integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        return decimalDigits != null ? `${integerDisplay}.${decimalDigits}` : integerDisplay;
    }
    
    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);
        const len = this.currentOperandTextElement.innerText.length;
        this.currentOperandTextElement.style.fontSize = len > 18 ? "1.5rem" : len > 9 ? "2.25rem" : "3rem";

        if (this.operation != null) {
            const opSymbol = this.operation.replace('add', '+').replace('subtract', '-').replace('multiply', '×').replace('divide', '÷');
            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${opSymbol}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    showError() {
        const originalText = this.currentOperandTextElement.innerText;
        this.currentOperandTextElement.innerText = "Error";
        setTimeout(() => {
            this.clear();
        }, 1500);
    }
}

// --- DOM Element Selection & Event Listeners ---
const buttonContainer = document.querySelector('.buttons');
const previousOperandTextElement = document.querySelector('.previous-operand');
const currentOperandTextElement = document.querySelector('.current-operand');
const historyListElement = document.querySelector('.history-list');
const clearHistoryBtn = document.querySelector('.clear-history-btn');
const themeSwitcher = document.querySelector('.theme-switcher');
const themeOptions = document.querySelectorAll('.theme-option');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement, historyListElement);

buttonContainer.addEventListener('click', (e) => {
    if (!e.target.matches('button')) return;
    const button = e.target;
    
    if (calculator.readyToReset && !button.dataset.operator && !button.dataset.action) {
        calculator.currentOperand = '0';
        calculator.readyToReset = false;
    }
    
    if (button.dataset.number) calculator.appendNumber(button.innerText);
    else if (button.dataset.operator) calculator.chooseOperation(button.dataset.operator);
    else if (button.dataset.action === 'equals') calculator.compute();
    else if (button.dataset.action === 'clear') {
        calculator.clear();
        calculator.clearHistory(); // Also clear history on AC
    }
    else if (button.dataset.action === 'delete') calculator.delete();
    
    calculator.updateDisplay();
});

clearHistoryBtn.addEventListener('click', () => {
    calculator.clearHistory();
});

themeSwitcher.addEventListener('click', (e) => {
    if (!e.target.dataset.theme) return;
    const theme = e.target.dataset.theme;
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('calculator_theme', theme);
    themeOptions.forEach(opt => opt.classList.remove('active'));
    e.target.classList.add('active');
});

function loadTheme() {
    const savedTheme = localStorage.getItem('calculator_theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    const activeThemeOption = document.querySelector(`.theme-option[data-theme='${savedTheme}']`);
    if (activeThemeOption) activeThemeOption.classList.add('active');
}

document.addEventListener('DOMContentLoaded', loadTheme);