"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKER APP

// Data
// const account1 = {
//   owner: "Hedi Rivas",
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
//   // user: "hr",
//   // balance: 3840,
// };

// const account2 = {
//   owner: "Jessica Davis",
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: "Steven Thomas Williams",
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: "Sarah Smith",
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

// const accounts = [account1, account2, account3, account4];

const account1 = {
  owner: "Hedi Rivas",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2022-11-18T21:31:17.178Z",
    "2022-12-23T07:42:02.383Z",
    "2023-01-28T09:15:04.904Z",
    "2023-04-01T10:17:24.185Z",
    "2023-10-11T14:11:59.604Z",
    "2023-10-15T17:01:17.194Z",
    "2023-10-16T23:36:17.929Z",
    "2023-10-17T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "fr-FR",
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2022-11-01T13:15:33.035Z",
    "2022-11-30T09:48:16.867Z",
    "2022-12-25T06:04:23.907Z",
    "2023-01-25T14:18:46.235Z",
    "2023-02-05T16:33:06.386Z",
    "2023-04-10T14:43:26.374Z",
    "2023-09-18T18:49:59.371Z",
    "2023-09-20T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

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

// Déclaration de timer en dehors du bloc sinon pas de clearInterval entre chaque appel de la fonction,
// résultant en de multiples instances du décompte de timer
let timer;

// Décompte avant déconnexion forcée

const startLogOutTimer = () => {
  // 5 minutes arbitraires
  let time = 300;
  const tick = () => {
    // Renvoi minutes et secondes pour les afficher
    const minute = String(Math.trunc(time / 60)).padStart(2, "0");
    const seconds = String(time % 60).padStart(2, "0");

    // Mise à jour du décompte visible
    labelTimer.textContent = `${minute}:${seconds}`;

    // La déconnexion quand le temps imparti est écoulé
    if (time === 0) {
      clearInterval(timer);
      containerApp.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
    }
    // Décrémenter d'une seconde
    time--;
  };

  // Premier appel pour afficher le décompte à la seconde 0
  tick();

  // Le précédent décompte dégage si décompte il y a, puis on lance un décompte
  clearInterval(timer);

  // tick est appelé chaque secondes pour créer un compte à rebours
  timer = setInterval(tick, 1000);
  // return timer;
};

// Localisation de la devise
const formatedCurrency = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
  }).format(value);
};

// Date rattaché à chaque opération sur le compte
const formatedMovementDate = (date, locale) => {
  // On soustrait la valeur de la date en paramètre à la date d'aujourd'hui
  const calcDatePassed = (date1, date2) => {
    return (date1 - date2) / (1000 * 60 * 60 * 24); // On converti en jour
  };
  // Si la date est postérieure à 7 jours alors on affiche combien de jours 
  // écoulé depuis aujourd'hui plutôt que la date numérique
  const daysPassed = Math.round(calcDatePassed(new Date(), date));
  if (daysPassed < 1) return "Today";
  if (daysPassed === 1) return "yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    const options = {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      // timestyle: "short",
      // datestyle: "long"
    };

    return new Intl.DateTimeFormat(locale, options).format(date);
  }
};

const displayMovements = function (acc, sort = false) {
  // Vidage préalable de la balise
  containerMovements.innerHTML = "";

  // triage du tableau si le paramètre sort = true, déclenché par le détecteur sur le bouton sort (plus bas)
  const movements = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  // Circonvolutions visant à actualiser l'ordre du tableau movementsDates en fonction du nouvel ordre du tableau "movements"
  let indexes = acc.movements.map((_, index) => index); // Créé un tableau d'indices
  indexes.sort((a, b) => acc.movements[a] - acc.movements[b]); // Tri le tableau d'indices

  // Réarrange dans un nouveau tableau les éléments de movementsDates avec les indices de movements
  let sortedDates = indexes.map((index) => acc.movementsDates[index]);

  // Boucle qui va rentrer les informations de chaque opérations dans le html
  movements.forEach(function (mov, i) {
    const operation = mov > 0 ? "deposit" : "withdrawal";
    
    // Vérifie si le tri est actif pour décider d'utiliser le tableau de dates triées ou non
    const date = sort
      ? new Date(sortedDates[i])
      : new Date(acc.movementsDates[i]);

    // Ajout de la date
    const displayDates = formatedMovementDate(date, acc.locale);

    // Stockage du bloc html actualisé
    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${operation}">${
      i + 1
    } ${operation}</div>
    <div class="movements__date">${displayDates}</div>
    <div class="movements__value">${formatedCurrency(
      mov.toFixed(2),
      acc.locale,
      acc.currency
    )}</div>
  </div>
    `;
    // Puis insertion du bloc à chaque itération
    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

// Ajoute les initiales du nom complet en tant que nom utilisateur sur chaque Objets comptes à défaut de les rentrer en dur
const createUserNames = (accs) => {
  accs.forEach((acc) => {
    acc.user = acc.owner
      .toLowerCase()
      .split(" ")
      .map((el) => el[0])
      .join("");
  });
};

// Oublie pas d'appeler
createUserNames(accounts);

// La même chose pour les fonds de chaque comptes
const createUserBalance = (accs) => {
  accs.forEach((acc) => {
    acc.balance = acc.movements.reduce((a, b) => a + b, 0);
  });
};
createUserBalance(accounts);

// Calcul et affichage des fonds
const calcDisplayBalance = (acc) => {
  const currentBalance = acc.movements.reduce((a, b) => a + b, 0);
  labelBalance.textContent = formatedCurrency(
    currentBalance,
    acc.locale,
    acc.currency
  );
};

// Calcul des revenus, dépenses et intérêts
const calcDisplaySummary = (acc) => {
  const income = acc.movements
    .filter((mov) => mov > 0)
    .reduce((a, b) => a + b, 0);
  const out = acc.movements.filter((mov) => mov < 0).reduce((a, b) => a + b, 0);
  const interest = acc.movements
    .filter((mov) => mov > 0)
    .map((depot) => depot * 0.012)
    .filter((num) => num >= 1)
    .reduce((a, b) => a + b, 0);
  labelSumInterest.textContent = formatedCurrency(
    interest.toFixed(2),
    acc.locale,
    acc.currency
  );
  labelSumIn.textContent = formatedCurrency(
    income.toFixed(2),
    acc.locale,
    acc.currency
  );
  labelSumOut.textContent = formatedCurrency(
    Math.abs(out).toFixed(2),
    acc.locale,
    acc.currency
  );
};

let currentAccount;

let sorted = false;

// Actualisation de l'interface des informations
const refresh = (acc) => {
  sorted ? displayMovements(acc, sorted) : displayMovements(acc); // Si tri actif, tri conservé après actualisation des opérations
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
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

  // Validation du code PIN
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(" ")[0]
    }.`;
    containerApp.style.opacity = 1;

    // Afficher la date avec intl pour la localiser
    const now = new Date();
    // const options = {
    //   //   hour: "numeric",
    //   //   minute: "numeric",
    //   //   day: "numeric",
    //   //   month: "numeric",
    //   //   year: "numeric",
    //   timestyle: "short",
    //   datestyle: "short",
    // };

    labelDate.textContent = `${new Intl.DateTimeFormat(
      currentAccount.locale
    ).format(now)}`;

    // Actualise l'interface
    refresh(currentAccount);

    // (Re)lance le décompte
    startLogOutTimer();
  }

  // On vide les champs user et PIN
  inputLoginUsername.value = "";
  inputLoginPin.value = "";
  inputLoginPin.blur();
});

// Fonction de virement

btnTransfer.addEventListener("click", (a) => {
  a.preventDefault();

  // On définit le montant à verser ainsi que le destinataire
  const amount = Number(inputTransferAmount.value);
  // Parcourt la liste de compte à la recherche du nom rentré dans le champ
  const receiverAcc = accounts.find(
    (acc) => acc.user === inputTransferTo.value
  );
  // On vérifie que :
  if (
    amount > 0 && // Le montant du virement n'est pas nul
    receiverAcc && // Il y a une correspondance entre le nom rentré et un compte existant
    currentAccount.balance >= amount && // Les fonds de l'envoyeur sont suffisants
    receiverAcc.user != currentAccount.user // Ce n'est pas une tentative de blanchiment d'argent
  ) {
    // Officialisation de la transaction
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.balance -= amount;

    // On oublie pas la date
    currentAccount.movementsDates.push(new Date());
    receiverAcc.movementsDates.push(new Date());

    // Ni d'actualiser les informations
    refresh(currentAccount);
  }
  inputTransferAmount.value = inputTransferTo.value = "";
});

// Supprimer un compte

btnClose.addEventListener("click", (a) => {
  a.preventDefault();
  const user = inputCloseUsername.value;
  const pin = Number(inputClosePin.value);

  // Compare le nom utilisateur et PIN rentré à ceux du compte en ligne
  if (user === currentAccount.user && pin === currentAccount.pin) {
    // Récupère l'index du compte actuelle
    const index = accounts.findIndex((n) => n.user === currentAccount.user);

    // Puis le supprime de la liste de comptes
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

  const loanAmount = Math.floor(Number(inputLoanAmount.value));

  // Un dépôt équivalent à 10% du prêt demandé doit exister sur le compte au préalable
  const requestedAmount = currentAccount.movements.some(
    (mov) => mov >= loanAmount * 0.1
  );
  if (loanAmount > 0 && requestedAmount) {
    // Délai simulant le traitement de la demande de crédit
    setTimeout(() => {
      currentAccount.movements.push(loanAmount);
      currentAccount.movementsDates.push(new Date());
      refresh(currentAccount);
    }, 3000); // En millisecondes
    startLogOutTimer();
  }
  inputLoanAmount.value = "";
});

// Bouton triage des opérations (décroissant)

// La variable sorted est déclaré plus tôt ligne 143
btnSort.addEventListener("click", (a) => {
  a.preventDefault();
  // Ici on utilise sorted en argument et on le fait alterner pour permuter entre le tableau des opérations trié ou non
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});
