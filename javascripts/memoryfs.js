window.onload = function (event) {
    /*-- Variables globales */
    var grilleJeu;
    var indiceFruit = 0;
    var XSource = 0, YSource = 0, XDest = 0, YDest = 0, i = 0, j = 0;
    var canevas = null, context = null;
    var score = 0;
    var affichScore = document.getElementById('score');
    nbClick = 0;
    var iCard1 = 0;
    var iCard2 = 0;
    var idCard1 = "";
    var idCard2 = "";
    var maxBar = 240;
    var currentBar = 0;
    var progressBar;
    var intervalId;

    /*--- Fonction qui affiche la progression de la barre du compteur de temps */
    var displayBar = function () {
        currentBar++;
        if (currentBar > maxBar) {
            clearInterval(intervalId);
            progressBar.value = 0;
            if (confirm("Trop tard, temps de jeu terminé !")) initJeu();
        }
        progressBar.value = currentBar;
    }

    // setTimeout(returnCards, 3000);   // memorisation pendant trois seconde

    /********************************************************************** */
    /*--- Initialisation des variables nécessaires au jeu */
    function initJeu() {
        progressBar = document.getElementById("compteur");
        progressBar.value = currentBar;
        progressBar.max = maxBar;
        grilleJeu = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        // Chargement des images du fichier cards.png sur un découpage tous les 100 pixels en hauteur (y)
        loadAndDrawImage("images/cards.png");
        // Lancement du jeu
        alert("Prêt(e) à jouer !");
        intervalId = setInterval(displayBar, 1000); // dysplayBar est appelée toutes les 1000 millisecondes : 1 seconde
    }


    /*-- Fonction qui affiche l'interface graphique et construit les cartes */
    function loadAndDrawImage(url) {
        // Create an image object. This is not attached to the DOM and is not part of the page.
        var image = new Image();
        // Now set the source of the image that we want to load
        image.src = url;
        // When the image has loaded, draw it to the canvas
        image.onload = function () {
            for (let i = 0; i < grilleJeu.length; i++) {
                canevas = document.getElementById('card' + i);
                context = canevas.getContext("2d");
                context.drawImage(image, XSource, grilleJeu[i] * 100, 100, 100, XDest, YDest, 100, 100);
                canevas.parentElement.parentElement.addEventListener('click', flipHandler);
            }
            console.log("grilleJeu : ", grilleJeu);
        }
    }

    /*--- Fonction qui modifie la liste des classes css pour activer l'animation de retournement de la carte */
    function returnCards() {
        var cards = document.getElementsByClassName("flip-card-inner");
        console.log('cards : ', cards);
        for (let i = 0; i < cards.length; i++) {
            cards[i].classList.toggle('flip-action');
        }
    }

    /*--- Fonction qui mélange les indices des images de fruits 
    *---- the Fisher–Yates shuffle algorithm:   google this!   */
    function shuffle(array) {
        var copy = [], n = array.length, i;
        // While there remain elements to shuffle…
        while (n) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * array.length);
            // If not already shuffled, move it to the new array.
            if (i in array) {
                copy.push(array[i]);
                delete array[i];
                n--;
            }
        }
        return copy;
    }

    /*--- Fonction gestionnaire des evts click sur les cartes */
    function flipHandler(evt) {
        nbClick++;
        if (evt.target.localName == "canvas") {
            evt.target.parentElement.parentElement.classList.toggle('flip-action'); // on remote le DOM jusqu'a "flip-card-inner"
            /*todo : ici on va calculer si les 2 images sont identiques via indice de grilleJeu */
            if (nbClick == 1) idCard1 = parseInt(evt.target.id.split('d')[1]);
            else idCard2 = parseInt(evt.target.id.split('d')[1]);  // un morceau d'information est une information !
        } else {
            evt.target.parentElement.classList.toggle('flip-action');
            if (nbClick == 1) idCard1 = parseInt(evt.target.parentElement.children[0].children[0].id.split('d')[1]);
            else idCard2 = parseInt(evt.target.parentElement.children[0].children[0].id.split('d')[1]);
        }
        /* test si une ou deux cartes sont retournées et si elles ont la même image */
        if (nbClick == 2) {
            iCard2 = grilleJeu[idCard2];
            if (iCard1 == iCard2) {
                score += 1;
                affichScore.innerHTML = score;
            } else {
                carte1 = document.getElementById('card' + idCard1);
                carte2 = document.getElementById('card' + idCard2);
                setTimeout(function (evt) { carte1.parentElement.parentElement.classList.toggle('flip-action') }, 1000);
                setTimeout(function (evt) { carte2.parentElement.parentElement.classList.toggle('flip-action') }, 1000);
            }
            nbClick = 0;
        } else {
            iCard1 = grilleJeu[idCard1];
        }
        if (score == 14) { 
            alert("Vous avez gagné en  : " + progressBar.value + " s.");
            clearInterval(intervalId);
        }
    }
    /*--- Appel à l'initialisation du jeu */
    initJeu();
}