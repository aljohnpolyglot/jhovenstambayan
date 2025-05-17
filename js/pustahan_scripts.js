console.log("Jhoven's Pustahan Central JS - Taya na, BAKA TUMAMA KA!");

document.addEventListener('DOMContentLoaded', () => {
    const betOptions = document.querySelectorAll('.bet-option');
    const betSlipModal = document.getElementById('betSlipModal');
    const closeBetModalBtn = document.querySelector('.close-bet-modal');
    const betDescModalElement = document.getElementById('betDescModal');
    const betOddsModalElement = document.getElementById('betOddsModal');
    const betAmountInput = document.getElementById('betAmount');
    const potentialWinDisplay = document.getElementById('potentialWinDisplay');
    const confirmBetBtn = document.getElementById('confirmBetBtn');
    const currentBetsList = document.getElementById('currentBetsList');

    let currentSelectedBet = null;
    let currentSelectedOdds = 0;

    function openBetSlipModal(betDescription, odds) {
        currentSelectedBet = betDescription;
        currentSelectedOdds = parseFloat(odds);

        betDescModalElement.textContent = betDescription;
        betOddsModalElement.textContent = odds;
        calculatePotentialWin(); // Calculate for default amount
        betSlipModal.style.display = "flex"; // Use flex to center
    }

    function closeBetSlipModal() {
        betSlipModal.style.display = "none";
    }

    function calculatePotentialWin() {
        const amount = parseFloat(betAmountInput.value);
        if (!isNaN(amount) && amount >= 10 && currentSelectedOdds > 0) {
            const potential = (amount * currentSelectedOdds).toFixed(0); // No decimals for chichirya points
            potentialWinDisplay.textContent = potential;
        } else {
            potentialWinDisplay.textContent = "--";
        }
    }

    function confirmBet() {
        const amount = parseFloat(betAmountInput.value);
        if (isNaN(amount) || amount < 10) {
            alert("Minimum taya ay 10 Chichirya Points, Paps!");
            return;
        }
        if (!currentSelectedBet) return;

        const tambayBetMessages = [
            `Taya mo na ang ${amount} Chichirya Points sa "${currentSelectedBet}"! Good luck, sana manalo ka ng pang-sisig!`,
            `Lock and loaded! ${amount} points sa "${currentSelectedBet}"! Dasal na, Paps!`,
            `Confirmed! ${amount} na chichirya para sa "${currentSelectedBet}". Pag nanalo ka, balato kay Jhoven ha!`,
            `Okay, taya mo sa "${currentSelectedBet}" for ${amount} points, pasok na! Manalo sana!`
        ];
        alert(tambayBetMessages[Math.floor(Math.random() * tambayBetMessages.length)]);
        
        // Add to "My Bets" list (conceptual)
        if (currentBetsList) {
            const noBetsLi = currentBetsList.querySelector('.no-bets');
            if (noBetsLi) {
                noBetsLi.remove();
            }
            const betLi = document.createElement('li');
            betLi.innerHTML = `<strong>${currentSelectedBet}</strong> - Taya: ${amount}pts @ ${currentSelectedOdds} (Win: ${(amount * currentSelectedOdds).toFixed(0)}pts)`;
            currentBetsList.appendChild(betLi);
        }

        closeBetSlipModal();
    }

    betOptions.forEach(button => {
        button.addEventListener('click', () => {
            const betDesc = button.dataset.betDesc;
            const odds = button.dataset.odds.match(/[\d\.]+/)[0]; // Extract number from odds string
            openBetSlipModal(betDesc, odds);
        });
    });

    if (closeBetModalBtn) {
        closeBetModalBtn.addEventListener('click', closeBetSlipModal);
    }
    if (confirmBetBtn) {
        confirmBetBtn.addEventListener('click', confirmBet);
    }
    if (betAmountInput) {
        betAmountInput.addEventListener('input', calculatePotentialWin);
    }

    // Close modal if clicked outside content
    window.addEventListener('click', (event) => {
        if (event.target == betSlipModal) {
            closeBetSlipModal();
        }
    });

    // Initialize: Display some past games if any are marked with 'past' status
    // (This would be more dynamic in a real app)
    document.querySelectorAll('.game-status-indicator .past').forEach(pastGame => {
        // You could, for example, disable betting buttons for past games.
        const board = pastGame.closest('.betting-board');
        if (board) {
            board.querySelectorAll('.bet-option').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = "0.5";
                btn.style.cursor = "not-allowed";
                btn.innerHTML += " (SARADO NA)";
            });
             const header = board.querySelector('.game-matchup');
             if(header) header.style.opacity = "0.6";
        }
    });

});