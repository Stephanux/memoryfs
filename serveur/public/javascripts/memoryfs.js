window.onload = function (event) {
    $( document ).ready(function() {
        /*************************/
        /*-- Variables globales  */
        /*************************/
        var grilleJeu;
        var listeIndicesImages = [];
        var nbImages;
        var formatGrille
        var flipedCards = [];
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

        /********************************************************* */
        /*---  Initialisation du tableau de classement Datatable   */
        /********************************************************* */
        var datatable = datatable = $("#tabclassement").DataTable({
            "dom": '<"top">t<"bottom" ip><"clear">',
            "order": [[3, "asc"]],
            "paging": true,
            "processing": true,
            "language": {
                "loadingRecords": "&nbsp;",
                "processing": "DataTables is currently busy",
                "url": "javascripts/French.json"
            }
        });
        datatable.on( 'order.dt search.dt', function () {
            datatable.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
                cell.innerHTML = i+1;
            } );
        });
        /********************************************************************* */
        /*--- La liste déroulante pour récupérer le format de la grille de jeu */
        /********************************************************************* */
        formatGrille = document.getElementById('formatgrille');

        /*******************************************************/
        /*--- Construction de la grille HTML via JS            */
        /*******************************************************/
        function drawGrille(lignes,cols) {
            var grille = "";
            var numId = 0;   // utilisé pour identifier les cartes
            for (let ligne = 0; ligne < lignes; ligne ++) {
                grille += '<div class="row">';
                for (let col = 0; col < cols; col++) {
                    grille += '<div class="col-lg-1 square">' +
                                    '<div class="flip-card">' + 
                                        '<div class="flip-card-inner">' +
                                            '<div class="flip-card-front"><canvas id="card'+ numId + '" height="100" width="100"></canvas></div>'+
                                            '<div class="flip-card-back"></div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>';
                    numId++;
                }
                grille += '</div>';  // fermeture div row !
            }
            document.querySelector("#grillejeu").innerHTML = grille;
        }

        /********************************************************** */
        /*--- Initialisation des variables nécessaires au jeu       */
        /************************************************************/
        function initJeu(nblignes, nbcols) {
            nbImages = nblignes*nbcols;
            for (let k=0;k< nbImages/2;k++) {
                listeIndicesImages.push(k); listeIndicesImages.push(k);  // deux images identiques
            }
            drawGrille(nblignes,nbcols);
            progressBar = document.getElementById("compteur");
            progressBar.value = currentBar;
            progressBar.max = maxBar;
            grilleJeu = shuffle(listeIndicesImages);
            // Chargement des images du fichier cards.png sur un découpage tous les 100 pixels en hauteur (y)
            loadAndDrawImage("images/cards.png");
            // Lancement du jeu
            datatable.draw();
            // setTimeout(returnCards, 3000);   // memorisation pendant trois seconde
            intervalId = setInterval(displayBar, 1000); // displayBar est appelée toutes les 1000 millisecondes : 1 seconde
        }

        /************************************************************************/
        /*-- Fonction qui affiche l'interface graphique et construit les cartes */
        /************************************************************************/
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
        /************************************************************************************************************/
        /*--- Fonction qui modifie la liste des classes css pour activer l'animation de retournement de la carte    */
        /************************************************************************************************************/
        function returnCards() {
            var cards = document.getElementsByClassName("flip-card-inner");
            console.log('cards : ', cards);
            for (let i = 0; i < cards.length; i++) {
                cards[i].classList.toggle('flip-action');
            }
        }

        /*********************************************************************** */
        /*---       Fonction qui mélange les indices des images de fruits        */
        /*---       the Fisher–Yates shuffle algorithm:   google this!           */
        /*********************************************************************** */
        function shuffle(array) {
            var copy = [], n = array.length, i;
            // Tant qu'il y a des éléments dans le tableau…
            while (n) {
                // Choisir un élément au hasard en calculant un indice
                i = Math.floor(Math.random() * array.length);
                // Si cet indice calculé est dans le tableau d'entrée on le copie dans le tableau de sortie
                // et on le supprime ensuite du tableau d'entré pour pas reprendre l'élément.
                if (i in array) {
                    copy.push(array[i]);
                    delete array[i];
                    n--;
                }
            }
            // renvoie le tableau mélangé avec les indice des images dans le désordre.
            return copy;
        }
        /*********************************************************************** */
        /*---      Fonction gestionnaire des evts click sur les cartes           */
        /*********************************************************************** */
        function flipHandler(evt) {
            nbClick++;
            if (evt.target.localName == "canvas") {
                /*todo : ici on va calculer si les 2 images sont identiques via indice de grilleJeu */
                if (nbClick == 1) idCard1 = parseInt(evt.target.id.split('d')[1]);
                else idCard2 = parseInt(evt.target.id.split('d')[1]);  // un morceau d'information est une information !
                /*if (flipedCards.indexOf(idCard1) !== -1 || flipedCards.indexOf(idCard2) !== -1) {
                    return;
                } else*/ evt.target.parentElement.parentElement.classList.toggle('flip-action'); // on remote le DOM jusqu'a "flip-card-inner"
            } else {
                if (nbClick == 1) idCard1 = parseInt(evt.target.parentElement.children[0].children[0].id.split('d')[1]);
                else idCard2 = parseInt(evt.target.parentElement.children[0].children[0].id.split('d')[1]);
                /*if (flipedCards.indexOf(idCard1) !== -1 || flipedCards.indexOf(idCard2) !== -1) {
                    return;
                } else*/ evt.target.parentElement.classList.toggle('flip-action');

            }
            /******************************************************************************* */
            /*--- Savoir si une ou deux cartes sont retournées et si elles ont la même image */
            /******************************************************************************* */
            if (nbClick == 2) {
                iCard2 = grilleJeu[idCard2];
                if (iCard1 == iCard2) {  // les deux cartes retournées ont le même numéro d'indice d'image
                    score += 1;
                    affichScore.innerHTML = score;
                    flipedCards.push(idCard1);
                    flipedCards.push(idCard2);
                } else {
                    carte1 = document.getElementById('card' + idCard1);
                    carte2 = document.getElementById('card' + idCard2);
                    setTimeout(function (evt) { carte1.parentElement.parentElement.classList.toggle('flip-action') }, 500);
                    setTimeout(function (evt) { carte2.parentElement.parentElement.classList.toggle('flip-action') }, 500);
                }
                nbClick = 0;
            } else {
                iCard1 = grilleJeu[idCard1];
            }
            /*********************************************************************************** */
            /*--- Savoir si toutes les paires d'images ont été trouvées, si oui Ajax du résultat */
            /*********************************************************************************** */
            if (score == nbImages/2) {
                // ON arrête de suite le chrono ;-)
                clearInterval(intervalId);
                // On demande le surnom (nickname) du joueur pour l'enregistrement dans le classement
                var nickname = prompt("Vous avez gagné en  : " + progressBar.value + " s", "Entrez votre Nickname pour figurer au classement...");
                if (nickname) {   // requpete Ajax JS vanilla :-)
                    // On créé un objet XMLHttpRequest
                    let xhr = new XMLHttpRequest();
                    // On initialise notre requête avec la fonction open()
                    xhr.open("GET", "/setmemscore?nickname=" + nickname + "&score=" + progressBar.value + "&format=" + formatGrille.value);
                    // réponse format JSON
                    xhr.responseType = "json";
                    // On envoie la requête
                    xhr.send();
                    // Dès que la réponse est arrivée...
                    xhr.onload = function () {
                        if (xhr.status != 200) {
                            alert('Erreur : ' + xhr.status + " : " + xhr.statusText);
                        } else {
                            console.log(xhr.responseText.length + " octets téléchargés\n" + JSON.stringify(xhr.responseText));
                        }
                    };
                    // Fonction de gestion d'une erreur de requête Ajax
                    xhr.onerror = function (err) {
                        console.log("La requête à échoouée : " + err);
                    }
                }
            }
        }

        /*--- Fonction qui affiche la progression de la barre du compteur de temps */
        var displayBar = function () {
            currentBar++;
            if (currentBar > maxBar) {
                clearInterval(intervalId);
                currentBar = 0;
                if (alert("Trop tard, perdu ! Temps de jeu terminé !"));
            }
            document.getElementById('secondes').innerHTML = currentBar;
            progressBar.value = currentBar;
        }

        /*--- Appel à l'initialisation du jeu */
        formatGrille.addEventListener('change', function(evt) {
            clearInterval(intervalId);
            let nbLignes = this.value.split('x')[0];
            let nbCols = this.value.split('x')[1];
            alert("Prêt(e) à jouer");
            initJeu(nbLignes, nbCols);
        });
    });
}


