"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKER APP

// Data
const account1 = {
  owner: "Hedi Rivas",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  // user: "hr",
  // balance: 3840,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////
// FONCTIONS


const displayMovements = function (movement, sort = false) {
  containerMovements.innerHTML = "";
  // triage du tableau si le paramètre sort = true, déclenché par le détecteur sur le bouton sort (plus bas)
  const movements = sort ? movement.slice().sort((a, b) => a - b) : movement;

  movements.forEach(function (mov, i) {
    const operation = mov > 0 ? "deposit" : "withdrawal";

    const htm = `
    <div class="movements__row">
    <div class="movements__type movements__type--${operation}">${
      i + 1
    } ${operation}</div>
    <div class="movements__date">3 days ago</div>
    <div class="movements__value">${mov}€</div>
  </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", htm);
  });
};

const createUserNames = (accs) => {
  accs.forEach((acc) => {
    acc.user = acc.owner
      .toLowerCase()
      .split(" ")
      .map((el) => el[0])
      .join("");
  });
};
createUserNames(accounts);

const createUserBalance = (accs) => {
  accs.forEach((acc) => {
    acc.balance = acc.movements.reduce((a, b) => a + b, 0);
  });
};
createUserBalance(accounts);

const calcDisplayBalance = (movements) => {
  // const balance = movements.filter((mov) => mov > 0);
  const currentBalance = movements.reduce((a, b) => a + b, 0);
  labelBalance.textContent = `${currentBalance}€`;
  // labelBalance.textContent()
};

const calcDisplaySummary = (movements) => {
  const income = movements.filter((mov) => mov > 0).reduce((a, b) => a + b, 0);
  const out = movements.filter((mov) => mov < 0).reduce((a, b) => a + b, 0);
  const interest = movements
    .filter((mov) => mov > 0)
    .map((depot) => depot * 0.012)
    .filter((num) => num >= 1)
    .reduce((a, b) => a + b, 0);
  labelSumInterest.textContent = `${interest}€`;
  labelSumIn.textContent = `${income}€`;
  labelSumOut.textContent = `${Math.abs(out)}€`;
};

let currentAccount;

let sorted = false;

const refresh = () => {
  sorted
    ? displayMovements(currentAccount.movements, sorted)
    : displayMovements(currentAccount.movements); // Si triage actif, triage conservé après réception d'
  calcDisplayBalance(currentAccount.movements);
  calcDisplaySummary(currentAccount.movements);
};

/////////////////////////////////////////////////
// Boutons d'action (Détecteurs)

// Fonction connexion

btnLogin.addEventListener("click", (a) => {
  // Désactive le rechargement de la page lors du clic sur le bouton
  a.preventDefault(); 
  currentAccount = accounts.find(
    (acc) => acc.user === inputLoginUsername.value
  );
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }.`;
    containerApp.style.opacity = 1;
    refresh();
  }
  inputLoginUsername.value = "";
  inputLoginPin.value = "";
  inputLoginPin.blur();
});

// Fonction de virement

btnTransfer.addEventListener("click", (a) => {
  a.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    (acc) => acc.user === inputTransferTo.value
  );

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc.user != currentAccount.user
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.balance -= amount;
    refresh();
  }
  inputTransferAmount.value = inputTransferTo.value = "";
});

// Supprimer un compte

btnClose.addEventListener("click", (a) => {
  a.preventDefault();
  const user = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);
  if (user === currentAccount.user && pin === currentAccount.pin) {
    const index = accounts.findIndex((n) => n.user === currentAccount.user);
    console.log(index);
    accounts.splice(index, 1);
    // Dissimule l'interface
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  }
  inputCloseUsername.value = inputClosePin.value = "";
});

// Obtenir un prêt

btnLoan.addEventListener("click", (a) => {
  a.preventDefault();

  const loanAmount = Number(inputLoanAmount.value);
  // Un dépôt équivalent à 10% du prêt demandé doit exister sur le compte au préalable
  const requestedAmount = currentAccount.movements.some(
    (mov) => mov >= loanAmount * 0.1                     
  ); 
  console.log(loanAmount, requestedAmount);
  if (loanAmount > 0 && requestedAmount) {
    currentAccount.movements.push(loanAmount);
    refresh();
  }
  // console.log("ça marche");
  // else{console.log("ça marche pas");}
  inputLoanAmount.value = "";
});

// Bouton triage des opérations (décroissant)

// La variable sorted est déclaré plus tôt ligne 143 faute de mieux
btnSort.addEventListener("click", (a) => {
  a.preventDefault();
  // Ici on utilise sorted en argument et on le fait alterner pour permuter entre le tableau des opérations trié ou non 
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
});
