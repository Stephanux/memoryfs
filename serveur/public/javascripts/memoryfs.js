window.onload = function (event) {
    $(document).ready(function () {
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
        /*--- => Hook sur la fonction initComplete du Datatable    */
        /*--- pour ajouter une liste déroulante (filtre) pour le   */
        /*--- format de grille.                                    */
        /********************************************************* */
        var datatable = datatable = $("#tabclassement").DataTable({
            initComplete: function () {
                this.api().columns('.select-filter').every(function () {
                    var column = this;
                    console.log("this : ", this);
                    if (this[0] == 2) {
                        var select = $('<select><option value="">Format Grille</option></select>')
                            .appendTo($(column.header()).empty())
                            .on('change', function () {
                                var val = $.fn.dataTable.util.escapeRegex(
                                    $(this).val()
                                );

                                column
                                    .search(val ? '^' + val + '$' : '', true, false)
                                    .draw();
                            });

                        column.data().unique().sort().each(function (d, j) {
                            select.append('<option value="' + d + '">' + d + '</option>')
                        });
                    }
                });
            },
            "dom": '<"top">t<"bottom" p>',
            "select": true,
            "order": [[3, "asc"]],
            "paging": true,
            "processing": true,
            "language": {
                "loadingRecords": "&nbsp;",
                "processing": "DataTables is currently busy",
                "url": "javascripts/French.json"
            }
        });
        datatable.on('order.dt search.dt', function () {
            datatable.column(0, { search: 'applied', order: 'applied' }).nodes().each(function (cell, i) {
                cell.innerHTML = i + 1;
            });
        });
        /********************************************************************* */
        /*--- La liste déroulante pour récupérer le format de la grille de jeu */
        /********************************************************************* */
        formatGrille = document.getElementById('formatgrille');

        /*******************************************************/
        /*--- Construction de la grille HTML via JS            */
        /*******************************************************/
        function drawGrille(lignes, cols) {
            var grille = "";
            var numId = 0;   // utilisé pour identifier les cartes
            for (let ligne = 0; ligne < lignes; ligne++) {
                grille += '<div class="row">';
                for (let col = 0; col < cols; col++) {
                    grille += '<div class="col-lg-1 square">' +
                        '<div class="flip-card">' +
                        '<div class="flip-card-inner">' +
                        '<div class="flip-card-front"><canvas id="card' + numId + '" height="100" width="100"></canvas></div>' +
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
            nbImages = nblignes * nbcols;
            for (let k = 0; k < nbImages / 2; k++) {
                listeIndicesImages.push(k); listeIndicesImages.push(k);  // deux images identiques
            }
            drawGrille(nblignes, nbcols);
            progressBar = document.getElementById("compteur");
            progressBar.value = currentBar;
            progressBar.max = maxBar;
            grilleJeu = shuffle(listeIndicesImages);
            // Chargement des images du fichier cards.png sur un découpage tous les 100 pixels en hauteur (y)
            loadAndDrawImage("images/cards.png");
            // afficher le tableau du classement
            datatable.draw();
            // Enregistrement de l'écouteur d'évènement "click" sur les cartes : flipedHandler, oups de l'ES6. :-)
            document.querySelectorAll('.flip-card-inner').forEach(card => {
                card.addEventListener('click', flipHandler)
            });
            // setTimeout(returnCards, 3000);   // memorisation pendant trois seconde
            // Lancement du jeu
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
                    // première version de la gestion de l'écouteur d'evt click sur les cartes
                    //canevas.parentElement.parentElement.addEventListener('click', flipHandler);  
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
        /*---       Fonction qui mélange les indices des images de fruits via    */
        /*---       the Fisher–Yates shuffle algorithm:   google this!           */
        /*********************************************************************** */
        function shuffle(array) {
            var m = array.length, t, i;
            // Tant qu'il y des éléments dans le tableau à trier…
            while (m) {
                // Calculer un indice du tableau de façon aléatoire dans 'i'
                i = Math.floor(Math.random() * m--);
                // Et l'échanger avec l'élément en cours via 'm'.
                t = array[m];
                array[m] = array[i];
                array[i] = t;
            }
            // On retourne le tableau mélangé
            return array;
        }
        /*********************************************************************** */
        /*---      Fonction gestionnaire des evts click sur les cartes           */
        /*********************************************************************** */
        function flipHandler(evt) {
            let idclicked = null;
            if (evt.target.localName == "canvas") idclicked = parseInt(evt.target.id.split('d')[1]);
            else idclicked = parseInt(evt.target.parentElement.children[0].children[0].id.split('d')[1]);
            if (flipedCards.indexOf(idclicked) == -1) {
                nbClick++;
                if (evt.target.localName == "canvas") {
                    /*todo : ici on va calculer si les 2 images sont identiques via indice de grilleJeu */
                    if (nbClick == 1) idCard1 = idclicked;
                    else idCard2 = idclicked;  // un morceau d'information est une information !
                    evt.target.parentElement.parentElement.classList.toggle('flip-action'); // on remote le DOM jusqu'a "flip-card-inner"
                } else {
                    if (nbClick == 1) idCard1 = idclicked;
                    else idCard2 = idclicked;
                    evt.target.parentElement.classList.toggle('flip-action');
                }
                /******************************************************************************* */
                /*--- Savoir si une ou deux cartes sont retournées et si elles ont la même image */
                /******************************************************************************* */
                if (nbClick == 2) {
                    iCard2 = grilleJeu[idCard2];
                    // les deux cartes retournées ont le même numéro d'indice d'image mais sont pas à la même place (click 2 fois sur la même carte)
                    if ((iCard1 == iCard2) && (idCard1 != idCard2)) {  
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
                if (score == nbImages / 2) {
                    // ON arrête de suite le chrono ;-)
                    clearInterval(intervalId);
                    // On demande le surnom (nickname) du joueur pour l'enregistrement dans le classement
                    var nickname = prompt("Vous avez gagné en  : " + progressBar.value + " s", "Entrez votre Nickname pour figurer au classement...");
                    if (nickname) {   // requpete Ajax JS Jquery et vanilla :-)
                        var jqxhr = $.get("/setmemscore?nickname=" + nickname + "&score=" + progressBar.value + "&format=" + formatGrille.value, function () {
                            console.log("success");
                        }).done(function (data) {
                            console.log("second success data : " + data);
                            window.location.reload(); // reload page pour maj tableau classement
                        }).fail(function (err) {
                            console.log("error : " + err);
                        }).always(function () {
                            console.log("finished");
                        });
                        // On créé un objet XMLHttpRequest en Vanilla JS
                        //let xhr = new XMLHttpRequest();
                        // On initialise notre requête avec la fonction open()
                        // xhr.open("GET", "/setmemscore?nickname=" + nickname + "&score=" + progressBar.value + "&format=" + formatGrille.value, true);
                        // réponse format JSON
                        //xhr.responseType = "json";
                        // On envoie la requête
                        //xhr.send(null);
                        // Dès que la réponse est arrivée...
                        //xhr.onload = function () {
                        /*    if (xhr.status != 200) {
                                alert('Erreur : ' + xhr.status + " : " + xhr.status);
                            } else {
                                console.log(xhr.response.length + " octets téléchargés\n" + JSON.stringify(xhr.response));
                            }
                            window.location.reload(); // reload page pour maj tableau classement
                        };
                        // Fonction de gestion d'une erreur de requête Ajax
                        xhr.onerror = function (err) {
                            console.log("La requête à échoouée : " + err);
                        }*/
                    }
                }
            } else {
                console.log("On ne peut pas cliquer sur une image déjà retournée !");
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
        formatGrille.addEventListener('change', function (evt) {
            clearInterval(intervalId);
            let nbLignes = this.value.split('x')[0];
            let nbCols = this.value.split('x')[1];
            alert("Prêt(e) à jouer");
            initJeu(nbLignes, nbCols);
        });
    });
}


