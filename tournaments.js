const ADMIN_PIN = '1234';







const STORAGE_KEY_PLAYERS = 'tournoi_joueurs';
const STORAGE_KEY_LOGO = 'tournoi_logo_club';
const STORAGE_KEY_TOURNAMENTS_CACHE = 'tournoi_archives_cache';
const SUPABASE_PROJECT_NAME = 'TournoisBillardclub';
const SUPABASE_URL = window.SUPABASE_URL || "https://iwtuwtvgrocmxfkmidlk.supabase.co";
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dHV3dHZncm9jbXhma21pZGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTM5NzUsImV4cCI6MjA5MzkyOTk3NX0.ISCfQxrD4dAnygL-teYon-KoJWrzDuTEHFZpe9tslmY";
const MAX_BILLARDS = 2;
const DEPARTAGE_VERSION = 2;
const MIN_FINALISTES_TABLEAU = 2;

document.addEventListener('DOMContentLoaded', () => {

    const datalistEl = document.getElementById('liste-joueurs');
    const typeTournoiEl = document.getElementById('type-tournoi');
    const regleConditionEl = document.getElementById('regle-condition');
    const regleNombreEl = document.getElementById('regle-nombre');
    const regleNombreWrapEl = document.getElementById('regle-nombre-wrap');
    const regleMixteWrapEl = document.getElementById('regle-mixte-wrap');
    const mixteAmaAmaEl = document.getElementById('mixte-ama-ama');
    const mixtePrePreEl = document.getElementById('mixte-pre-pre');
    const mixteAmaPreAmaEl = document.getElementById('mixte-ama-pre-ama');
    const mixteAmaPrePreEl = document.getElementById('mixte-ama-pre-pre');
    const pointsVictoireEl = document.getElementById('points-victoire');
    const pointsNulEl = document.getElementById('points-nul');
    const pointsDefaiteEl = document.getElementById('points-defaite');
    const sortantsPoulesWrapEl = document.getElementById('sortants-poules-wrap');
    const sortantsPoulesEl = document.getElementById('sortants-poules');
    const sortantsPoulesHelpEl = document.getElementById('sortants-poules-help');
    const playersChecklistEl = document.getElementById('players-checklist');
    const validateSelectionBtn = document.getElementById('validate-selection-btn');
    const editSelectionBtn = document.getElementById('edit-selection-btn');
    const selectedPlayersListEl = document.getElementById('selected-players-list');
    const selectedPlayersHelpEl = document.getElementById('selected-players-help');
    const tournoiFormEl = document.getElementById('tournoi-form');
    const adminToggleBtn = document.getElementById('admin-toggle');
    const adminPanelEl = document.getElementById('admin-panel');
    const newPlayerInputEl = document.getElementById('new-player-name');
    const newPlayerAmateurEl = document.getElementById('new-player-amateur');
    const newPlayerPrestigeEl = document.getElementById('new-player-prestige');
    const newPlayerGuestEl = document.getElementById('new-player-guest');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const assoconnectCsvInputEl = document.getElementById('assoconnect-csv-input');



    const playersAdminListEl = document.getElementById('players-admin-list');
    const adminLogoutBtn = document.getElementById('admin-logout');
    const configScreenEl = document.getElementById('config-screen');
    const openDashboardBtn = document.getElementById('open-dashboard-btn');
    const dashboardScreenEl = document.getElementById('dashboard-screen');
    const retourConfigDepuisDashboardBtn = document.getElementById('retour-config-depuis-dashboard');
    const dashboardPalmaresBodyEl = document.getElementById('dashboard-palmares-body');
    const dashboardChartEl = document.getElementById('dashboard-chart');
    const exportDbBtn = document.getElementById('export-db-btn');
    const clearDbBtn = document.getElementById('clear-db-btn');
    const archiverTournoiBtn = document.getElementById('archiver-tournoi-btn');
    const tournoiScreenEl = document.getElementById('tournoi-screen');
    const tournoiMetaEl = document.getElementById('tournoi-meta');
    const retourConfigBtn = document.getElementById('retour-config');
    const matchsEnCoursEl = document.getElementById('matchs-en-cours');
    const matchsAttenteEl = document.getElementById('matchs-attente');
    const classementBodyEl = document.getElementById('classement-body');
    const resultatsBodyEl = document.getElementById('resultats-body');
    const statusRowEl = document.getElementById('status-row');
    const actionVersFinaleEl = document.getElementById('action-vers-finale');
    const actionVersFinaleHelpEl = document.getElementById('action-vers-finale-help');
    const continuerCartesienBtn = document.getElementById('continuer-cartesien');
    const arreterCartesienBtn = document.getElementById('arreter-cartesien');
    const ouvrirParametrageFinalBtn = document.getElementById('ouvrir-parametrage-final');
    const sortantsScreenEl = document.getElementById('sortants-screen');
    const finalistesListEl = document.getElementById('finalistes-list');
    const tirerFinalisteBtn = document.getElementById('tirer-finaliste-btn');
    const reinitTirageBtn = document.getElementById('reinit-tirage-btn');
    const tirageOrdreListEl = document.getElementById('tirage-ordre-list');
    const tiragePoolListEl = document.getElementById('tirage-pool-list');
    const tirageHelpEl = document.getElementById('tirage-help');
    const roundSettingsEl = document.getElementById('round-settings');
    const roundSettingsHelpEl = document.getElementById('round-settings-help');
    const tournoiCategorieEl = document.getElementById('tournoi-categorie');
    const petiteFinaleCheckbox = document.getElementById('petite-finale-checkbox');
    const retourTournoiDepuisSortantsBtn = document.getElementById('retour-tournoi-depuis-sortants');
    const lancerTableauFinalBtn = document.getElementById('lancer-tableau-final');
    const tableauFinalScreenEl = document.getElementById('tableau-final-screen');
    const retourSortantsBtn = document.getElementById('retour-sortants');
    const tableauFinalMetaEl = document.getElementById('tableau-final-meta');
    const tableauFinalStatusRowEl = document.getElementById('tableau-final-status-row');
    const tableauFinalBracketEl = document.getElementById('tableau-final-bracket');
    const tableauFinalMatchsEnCoursEl = document.getElementById('tableau-final-matchs-en-cours');
    const tableauFinalMatchsAttenteEl = document.getElementById('tableau-final-matchs-attente');
    const tableauFinalResultatsBodyEl = document.getElementById('tableau-final-resultats-body');
    const tableauFinalGagnantEl = document.getElementById('tableau-final-gagnant');
    const clubLogoInputEl = document.getElementById('club-logo-input');
    const resetClubLogoBtn = document.getElementById('reset-club-logo');
    const clubLogoHelpEl = document.getElementById('club-logo-help');
    const poulesConfigWrapEl = document.getElementById('poules-config-wrap');
    const nbPoulesEl = document.getElementById('nb-poules');
    const joueursParPouleInputEl = document.getElementById('joueurs-par-poule-input');
    const labelJoueursParPouleEl = document.getElementById('label-joueurs-par-poule');
    const repartitionPoulesEl = document.getElementById('repartition-poules');
    const repartitionManuelleWrapEl = document.getElementById('repartition-manuelle-wrap');
    const poulesContainerEl = document.getElementById('poules-container');
    const qualifiesParPouleEl = document.getElementById('qualifies-par-poule');
    const structureFinalePoulesEl = document.getElementById('structure-finale-poules');
    const defaultTournoiLayoutEl = document.getElementById('default-tournoi-layout');
    const poulesTournoiContainerEl = document.getElementById('poules-tournoi-container');

    let isAdmin = false;
    let joueurs = [];
    let joueursSelectionnes = [];
    let selectionParticipantsVerrouillee = false;
    let tournoiActuel = null;
    let decisionSortantsPrise = false;
    let continuerCartesien = true;
    let ouverturePhaseFinaleEnAttente = false;
    let parametrageFinalDisponible = false;
    let sortantsConnusPourFinale = [];
    let ordreTirageFinale = [];
    let poolTirageFinale = [];
    let logoClubDataUrl = '';
    let logoPaletteRequestId = 0;

    /*
     * ============================================================
     * SOMMAIRE RAPIDE DES FONCTIONS (repères développeur)
     * ============================================================
     * 1) Utilitaires UI + règles générales
     *    - appliquerThemeCartesien, appliquerVisibiliteSortantsPoules,
     *      texteSecurise, libelleType, getRegleMatchDepuisForm, etc.
     *
     * 2) Participants & administration
     *    - getSelectionChecklist, rendreChecklistParticipants,
     *      validerSelectionParticipants, chargerJoueurs, ajouterJoueur, etc.
     *
     * 3) Moteur du tournoi cartésien (round robin + scheduling)
     *    - genererRoundsRoundRobin, creerTournoiCartesien,
     *      lancerMatchsAutomatiquement, terminerMatch, repousserMatch, etc.
     *
     * 4) Qualification & logique vers phase finale
     *    - getEtatQualification, verifierSortantsConnusEtDemanderSuite,
     *      renderActionVersFinale, arreterCartesienEtPreparerFinale, etc.
     *
     * 5) Tableau final (knockout)
     *    - initialiserTableauFinal, propagerGagnantsTableauFinal,
     *      terminerMatchTableauFinal, lancerTableauFinalDepuisSortants, etc.
     *
     * 6) Rendu écran principal + écran tableau final
     *    - renderTournoi, renderMatchsEnCours, renderClassement,
     *      renderTableauFinal, renderTableauFinalBracket, etc.
     *
     * 7) Câblage des événements + initialisation
     *    - addEventListener(...) + chargement initial en fin de script.
     * ============================================================
     */

    // ===== 0) Supabase & Dashboard =====
    let supabaseClient = null;
    let supabaseActive = false;
    let dashboardChartInstance = null;

    function lireCacheTournoisLocal() {
        try {
            const brut = localStorage.getItem(STORAGE_KEY_TOURNAMENTS_CACHE);
            if (!brut) return [];
            const parses = JSON.parse(brut);
            return Array.isArray(parses) ? parses : [];
        } catch {
            return [];
        }
    }

    function ecrireCacheTournoisLocal(tournois) {
        localStorage.setItem(STORAGE_KEY_TOURNAMENTS_CACHE, JSON.stringify(Array.isArray(tournois) ? tournois : []));
    }

    async function initDB() {
        const hasSupabaseLib = typeof window.supabase?.createClient === 'function';
        const hasCredentials = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

        if (!hasSupabaseLib || !hasCredentials) {
            supabaseActive = false;
            console.warn(`Supabase non configuré pour ${SUPABASE_PROJECT_NAME}. L'application continue en mode local.`);
            return { mode: 'local' };
        }

        if (window.supabaseClient) {
            supabaseClient = window.supabaseClient;
        } else {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    storage: window.sessionStorage,
                    persistSession: true
                }
            });
            window.supabaseClient = supabaseClient;
        }

        try {
            const { error } = await supabaseClient
                .from('app_settings')
                .select('setting_key')
                .limit(1);

            if (error) {
                supabaseActive = false;
                console.error('Supabase joignable mais schéma non prêt ou accès refusé:', error.message);
                return { mode: 'local' };
            }
        } catch (err) {
            supabaseActive = false;
            console.error('Supabase connection failed:', err);
            return { mode: 'local' };
        }

        supabaseActive = true;
        return { mode: 'supabase' };
    }

    async function saveTournamentToDB(tournoiData) {
        tournoiData.id = tournoiData.id || Date.now().toString();
        tournoiData.dateArchive = tournoiData.dateArchive || new Date().toISOString();

        const cache = lireCacheTournoisLocal();
        const sansCourant = cache.filter((t) => t?.id !== tournoiData.id);
        ecrireCacheTournoisLocal([tournoiData, ...sansCourant]);

        if (!supabaseActive || !supabaseClient) return;

        const { error } = await supabaseClient
            .from('tournaments')
            .upsert({
                id: tournoiData.id,
                date_archive: tournoiData.dateArchive,
                winner: tournoiData.gagnantFinal || null,
                payload: tournoiData
            }, { onConflict: 'id' });

        if (error) throw error;
    }

    async function getAllTournamentsFromDB() {
        if (!supabaseActive || !supabaseClient) {
            return lireCacheTournoisLocal();
        }

        const { data, error } = await supabaseClient
            .from('tournaments')
            .select('id, date_archive, payload')
            .order('date_archive', { ascending: false });

        if (error) {
            console.error('Lecture Supabase impossible, fallback local:', error.message);
            return lireCacheTournoisLocal();
        }

        const tournois = (data || []).map((row) => ({
            ...(row.payload || {}),
            id: row.id,
            dateArchive: row.date_archive
        }));
        ecrireCacheTournoisLocal(tournois);
        return tournois;
    }

    async function clearDB() {
        ecrireCacheTournoisLocal([]);

        if (!supabaseActive || !supabaseClient) return;

        const { error } = await supabaseClient
            .from('tournaments')
            .delete()
            .neq('id', '');

        if (error) throw error;
    }

    async function getRemotePlayers() {
        if (!supabaseActive || !supabaseClient) return [];
        const { data, error } = await supabaseClient
            .from('players')
            .select('name, categories, photo')
            .order('name', { ascending: true });
        if (error) throw error;
        return Array.isArray(data) ? data : [];
    }

    async function saveRemotePlayers(playersList) {
        if (!supabaseActive || !supabaseClient) return;

        const payload = (playersList || [])
            .map((joueur) => ({
                name: getNomJoueur(joueur),
                categories: getCategoriesJoueur(joueur),
                photo: getPhotoJoueur(joueur)
            }))
            .filter((joueur) => joueur.name);

        const { error: deleteError } = await supabaseClient
            .from('players')
            .delete()
            .neq('name', '');
        if (deleteError) throw deleteError;

        if (!payload.length) return;

        const { error: insertError } = await supabaseClient
            .from('players')
            .insert(payload);
        if (insertError) throw insertError;
    }

    async function uploadPlayerPhotoRemote(file, playerName) {
        if (!supabaseActive || !supabaseClient) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `avatar_${playerName.replace(/\s+/g, '_')}_${Date.now()}.${fileExt}`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabaseClient.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            console.error('Erreur upload Supabase Storage:', uploadError.message);
            return null;
        }

        const { data } = supabaseClient.storage
            .from('images')
            .getPublicUrl(filePath);

        return data?.publicUrl || null;
    }

    async function getRemoteLogo() {
        if (!supabaseActive || !supabaseClient) return '';
        const { data, error } = await supabaseClient
            .from('app_settings')
            .select('setting_value')
            .eq('setting_key', 'club_logo_data_url')
            .maybeSingle();
        if (error) throw error;
        return String(data?.setting_value || '');
    }

    async function saveRemoteLogo(dataUrl) {
        if (!supabaseActive || !supabaseClient) return;

        const { error } = await supabaseClient
            .from('app_settings')
            .upsert({
                setting_key: 'club_logo_data_url',
                setting_value: String(dataUrl || '')
            }, { onConflict: 'setting_key' });

        if (error) throw error;
    }



    // Enregistre en temps réel l'état complet du tournoi actif (non archivé) dans Supabase.
    // Appelée après chaque action de jeu (validation de score, avancée de round, tirage).
    async function syncActiveTournament() {
        if (!tournoiActuel || tournoiActuel.estArchive) return;
        try {
            // On enrichit le payload avec les variables d'état secondaires nécessaires à la restauration.
            tournoiActuel._etatSortants = {
                sortantsConnusPourFinale: [...sortantsConnusPourFinale],
                ordreTirageFinale: [...ordreTirageFinale],
                poolTirageFinale: [...poolTirageFinale],
                ouverturePhaseFinaleEnAttente,
                decisionSortantsPrise,
                continuerCartesien,
                parametrageFinalDisponible
            };
            await saveTournamentToDB(tournoiActuel);
        } catch (err) {
            console.warn('syncActiveTournament: sauvegarde non critique ignorée.', err.message);
        }
    }

    // Au démarrage, cherche un tournoi en cours (non archivé) et le restaure.
    // Recharge les variables d'état globales et bascule sur le bon écran.
    async function restaurerTournoiActuelDepuisDB() {
        try {
            const tousLesTournois = await getAllTournamentsFromDB();
            const tournoiEnCours = tousLesTournois.find(t => t.estArchive !== true && t.id);
            if (!tournoiEnCours) return;

            tournoiActuel = tournoiEnCours;

            // Restauration des variables d'état secondaires
            const etat = tournoiActuel._etatSortants || {};
            sortantsConnusPourFinale = Array.isArray(etat.sortantsConnusPourFinale) ? etat.sortantsConnusPourFinale : [];
            ordreTirageFinale = Array.isArray(etat.ordreTirageFinale) ? etat.ordreTirageFinale : [];
            poolTirageFinale = Array.isArray(etat.poolTirageFinale) ? etat.poolTirageFinale : [];
            ouverturePhaseFinaleEnAttente = etat.ouverturePhaseFinaleEnAttente ?? false;
            decisionSortantsPrise = etat.decisionSortantsPrise ?? false;
            continuerCartesien = etat.continuerCartesien ?? true;
            parametrageFinalDisponible = etat.parametrageFinalDisponible ?? false;

            // Détermine sur quel écran revenir
            const phaseFinale = tournoiActuel.phaseFinale;
            if (phaseFinale && phaseFinale.matches && phaseFinale.matches.length > 0) {
                renderTableauFinal();
                ouvrirEcranTableauFinal();
            } else if (sortantsConnusPourFinale.length > 0) {
                rendrePageSortants();
                ouvrirEcranSortants();
            } else {
                renderTournoi();
                ouvrirEcranTournoi();
            }
        } catch (err) {
            console.warn('restaurerTournoiActuelDepuisDB: restauration ignorée.', err.message);
        }
    }

    async function archiverLeTournoi() {

        if (!tournoiActuel) return;
        const btn = archiverTournoiBtn;
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'Archivage en cours...';
        }

        const tournoiAStocker = {
            ...tournoiActuel,
            gagnantFinal: getPhaseFinale()?.winner || null
        };

        try {
            await saveTournamentToDB(tournoiAStocker);
            tournoiActuel.estArchive = true;
            alert('Le tournoi a été archivé avec succès dans les statistiques annuelles !');
            renderTableauFinalResultats();
        } catch (err) {
            alert('Erreur lors de l’archivage : ' + err.message);
            if (btn) {
                btn.disabled = false;
                btn.textContent = '💾 Archiver le tournoi dans les statistiques';
            }
        }
    }

    function ouvrirDashboard() {
        configScreenEl.classList.add('hidden');
        tournoiScreenEl.classList.add('hidden');
        sortantsScreenEl.classList.add('hidden');
        tableauFinalScreenEl.classList.add('hidden');
        if (dashboardScreenEl) dashboardScreenEl.classList.remove('hidden');
        renderDashboard();
    }

    function fermerDashboard() {
        if (dashboardScreenEl) dashboardScreenEl.classList.add('hidden');
        configScreenEl.classList.remove('hidden');
    }

    async function renderDashboard() {
        try {
            const tousLesTournois = await getAllTournamentsFromDB();
            // On n'inclut que les tournois explicitement archivés pour les statistiques annuelles.
            // Un tournoi en cours ne doit pas fausser les classements.
            const tournois = tousLesTournois.filter(t => t.estArchive === true);

            const statsMap = {};
            tournois.forEach(t => {
                const gagnantFinal = t.gagnantFinal;
                if (gagnantFinal) {
                    if (!statsMap[gagnantFinal]) statsMap[gagnantFinal] = { victoires: 0, points: 0, participations: 0 };
                    statsMap[gagnantFinal].victoires += 1;
                    // Le vainqueur du tournoi n'a plus le +100 fixe, ses points sont calculés sur ses matchs.
                }

                if (t.players) {
                    t.players.forEach(p => {
                        if (!statsMap[p]) statsMap[p] = { victoires: 0, points: 0, participations: 0 };
                        statsMap[p].participations += 1;
                        // La participation n'a plus le +10 fixe.
                    });
                }

                // Récupération de tous les matchs du tournoi
                let allMatches = [];
                if (t.matches && Array.isArray(t.matches)) allMatches.push(...t.matches);
                if (t.phaseFinale && t.phaseFinale.matches && Array.isArray(t.phaseFinale.matches)) allMatches.push(...t.phaseFinale.matches);
                if (t.poules && Array.isArray(t.poules)) {
                    t.poules.forEach(p => {
                        if (p.matches && Array.isArray(p.matches)) allMatches.push(...p.matches);
                    });
                }

                allMatches.forEach(m => {
                    if (m.status === 'finished' && m.winner && m.winner !== 'draw') {
                        const winnerName = m.winner;
                        const loserName = winnerName === m.playerA ? m.playerB : m.playerA;

                        if (!statsMap[winnerName]) statsMap[winnerName] = { victoires: 0, points: 0, participations: 0 };

                        let pts = 0;
                        const catTournoi = t.categorie || 'amateur';

                        if (catTournoi === 'prestige') {
                            pts = 10;
                        } else if (catTournoi === 'amateur') {
                            pts = 2;
                        } else if (catTournoi === 'mixte') {
                            // On cherche les catégories des joueurs dans la base globale "joueurs"
                            const jW = joueurs.find(j => (j.nom || '').trim() === winnerName);
                            const jL = joueurs.find(j => (j.nom || '').trim() === loserName);

                            const catW = jW && Array.isArray(jW.categories) && jW.categories.includes('prestige') ? 'prestige' : 'amateur';
                            const catL = jL && Array.isArray(jL.categories) && jL.categories.includes('prestige') ? 'prestige' : 'amateur';

                            if (catW === 'amateur' && catL === 'prestige') {
                                pts = 10; // Un amateur bat un prestige
                            } else if (catW === 'prestige' && catL === 'amateur') {
                                pts = 1; // Un prestige bat un amateur
                            } else if (catW === 'amateur' && catL === 'amateur') {
                                pts = 2; // Amateur vs Amateur
                            } else if (catW === 'prestige' && catL === 'prestige') {
                                pts = 10; // Prestige vs Prestige
                            }
                        } else {
                            pts = 2; // Valeur par défaut
                        }

                        statsMap[winnerName].points += pts;
                    }
                });
            });

            const palmares = Object.entries(statsMap)
                .map(([joueur, stats]) => ({ joueur, ...stats }))
                .sort((a, b) => b.victoires - a.victoires || b.points - a.points);

            if (dashboardPalmaresBodyEl) {
                if (palmares.length === 0) {
                    dashboardPalmaresBodyEl.innerHTML = '<tr><td colspan="4" class="txt-muted" style="text-align:center; padding:15px;">La base est vide. Jouez et archivez un tournoi !</td></tr>';
                } else {
                    dashboardPalmaresBodyEl.innerHTML = palmares.map((p, index) => `
                            <tr>
                                <td>${index + 1}</td>
                                <td><strong>${texteSecurise(p.joueur)}</strong></td>
                                <td>${p.victoires}</td>
                                <td>${p.points}</td>
                            </tr>
                        `).join('');
                }
            }

            if (dashboardChartEl) {
                const top5 = palmares.slice(0, 5);
                const labels = top5.map(p => p.joueur);
                const dataVictoires = top5.map(p => p.victoires);

                if (dashboardChartInstance) dashboardChartInstance.destroy();

                const ctx = dashboardChartEl.getContext('2d');
                if (window.Chart) {
                    dashboardChartInstance = new window.Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: 'Tournois Gagnés',
                                data: dataVictoires,
                                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                                borderColor: 'rgba(34, 197, 94, 1)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            scales: {
                                y: { beginAtZero: true, ticks: { stepSize: 1 } },
                                x: { grid: { display: false } }
                            }
                        }
                    });
                }
            }

        } catch (err) {
            console.error(err);
            if (dashboardPalmaresBodyEl) dashboardPalmaresBodyEl.innerHTML = '<tr><td colspan="4">Erreur de chargement.</td></tr>';
        }
    }

    async function exportDB() {
        try {
            const tournois = await getAllTournamentsFromDB();
            const json = JSON.stringify(tournois, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `archive_tournois_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            alert("Erreur d'exportation : " + err.message);
        }
    }

    // ===== 1) Utilitaires UI + règles générales =====
    // Fonction: appliquerThemeCartesien - rôle métier documenté pour faciliter la maintenance.
    function appliquerThemeCartesien() {
        const estCartesien = typeTournoiEl.value === 'cartesien';
        document.body.classList.toggle('mode-cartesien', estCartesien);
    }

    // Fonction: appliquerVisibiliteSortantsPoules - rôle métier documenté pour faciliter la maintenance.
    function appliquerVisibiliteSortantsPoules() {
        const type = typeTournoiEl.value;
        const estCartesien = type === 'cartesien';
        const estPoules = type === 'poules';

        if (sortantsPoulesWrapEl) {
            // Masqué si ce n'est pas cartésien (car Poules a ses propres paramètres de sortants)
            sortantsPoulesWrapEl.classList.toggle('hidden', !estCartesien);
        }
        if (sortantsPoulesEl) sortantsPoulesEl.disabled = !estCartesien;
    }

    // Fonction: nomCanoniqueDepuisBase - rôle métier documenté pour faciliter la maintenance.
    function nomCanoniqueDepuisBase(nomSaisi) {
        const cible = String(nomSaisi || '').trim().toLowerCase();
        if (!cible) return null;
        return joueurs.find(n => n.toLowerCase() === cible) || null;
    }

    // Fonction: texteSecurise - rôle métier documenté pour faciliter la maintenance.
    function texteSecurise(value) {
        return String(value || '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    // Fonction: libelleType - rôle métier documenté pour faciliter la maintenance.
    function libelleType(type) {
        const map = {
            cartesien: 'Cartésien',
            elimination: 'Élimination Directe',
            poules: 'Poules',
            double: 'Double Élimination',
            champ: 'Championnat'
        };
        return map[type] || type;
    }

    // Fonction: getRegleMatchDepuisForm - rôle métier documenté pour faciliter la maintenance.
    function getRegleMatchDepuisForm() {
        const condition = regleConditionEl?.value || 'total';
        const isMixte = getCategorieTournoiSelectionnee() === 'mixte';
        const nombre = Number.parseInt(regleNombreEl.value, 10);

        const mixteAmaAma = Number.parseInt(mixteAmaAmaEl?.value, 10) || 2;
        const mixtePrePre = Number.parseInt(mixtePrePreEl?.value, 10) || 3;
        const mixteAmaPreAma = Number.parseInt(mixteAmaPreAmaEl?.value, 10) || 2;
        const mixteAmaPrePre = Number.parseInt(mixteAmaPrePreEl?.value, 10) || 3;

        const sortantsPoules = Number.parseInt(sortantsPoulesEl.value, 10);
        const pointsVictoire = Number.parseFloat(pointsVictoireEl.value);
        const pointsNul = Number.parseFloat(pointsNulEl.value);
        const pointsDefaite = Number.parseFloat(pointsDefaiteEl.value);
        return {
            condition,
            isMixte,
            mixteAmaAma,
            mixtePrePre,
            mixteAmaPreAma,
            mixteAmaPrePre,
            nombre: Number.isInteger(nombre) && nombre > 0 ? nombre : 1,
            sortantsPoules: Number.isInteger(sortantsPoules) && sortantsPoules > 0 ? sortantsPoules : 1,
            pointsVictoire: Number.isFinite(pointsVictoire) && pointsVictoire >= 0 ? pointsVictoire : 3,
            pointsNul: Number.isFinite(pointsNul) && pointsNul >= 0 ? pointsNul : 1,
            pointsDefaite: Number.isFinite(pointsDefaite) && pointsDefaite >= 0 ? pointsDefaite : 0
        };
    }

    // Fonction: libelleRegle - rôle métier documenté pour faciliter la maintenance.
    function libelleRegle(settings) {
        if (!settings) return 'Règle non définie';
        if (settings.isMixte) {
            return 'Objectifs ajustés (Handicap)';
        }
        if (settings.condition === 'gagnantes') {
            return `${settings.nombre} manche(s) gagnante(s)`;
        }
        return `${settings.nombre} manche(s) au total`;
    }

    // Fonction: libelleBareme - rôle métier documenté pour faciliter la maintenance.
    function libelleBareme(settings) {
        if (!settings) return 'V/N/D: 3/1/0';
        return `V/N/D: ${settings.pointsVictoire}/${settings.pointsNul}/${settings.pointsDefaite}`;
    }

    // Fonction: puissanceDeuxSuperieureOuEgale - rôle métier documenté pour faciliter la maintenance.
    function puissanceDeuxSuperieureOuEgale(n) {
        let p = 1;
        while (p < n) p *= 2;
        return p;
    }

    // Fonction: getLibelleTourFinal - rôle métier documenté pour faciliter la maintenance.
    function getLibelleTourFinal(indexTour, totalTours, tailleEntreeTour) {
        if (indexTour === totalTours) return 'Finale';
        if (tailleEntreeTour === 4) return 'Demi-finales';
        if (tailleEntreeTour === 8) return 'Quarts de finale';
        if (tailleEntreeTour === 16) return 'Huitièmes de finale';
        return `Tour ${indexTour}`;
    }

    // Fonction: getDefinitionToursTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function getDefinitionToursTableauFinal(nbQualifies) {
        const tailleBracket = puissanceDeuxSuperieureOuEgale(Math.max(2, nbQualifies));
        const totalTours = Math.log2(tailleBracket);
        const tours = [];

        for (let r = 1; r <= totalTours; r++) {
            const tailleEntreeTour = tailleBracket / Math.pow(2, r - 1);
            tours.push({
                round: r,
                label: getLibelleTourFinal(r, totalTours, tailleEntreeTour),
                tailleEntreeTour
            });
        }

        return tours;
    }

    // Fonction: synchroniserTirageFinalistes - rôle métier documenté pour faciliter la maintenance.
    function synchroniserTirageFinalistes(forceReset = false) {
        const base = [...sortantsConnusPourFinale];
        const keyBase = [...base].sort((a, b) => a.localeCompare(b, 'fr')).join('|');
        const keyActuel = [...ordreTirageFinale, ...poolTirageFinale].sort((a, b) => a.localeCompare(b, 'fr')).join('|');

        if (forceReset || keyBase !== keyActuel) {
            ordreTirageFinale = [];
            poolTirageFinale = [...base];
        }
    }

    // Fonction: renderTirageFinalistes - rôle métier documenté pour faciliter la maintenance.
    function renderTirageFinalistes() {
        if (!sortantsConnusPourFinale.length) {
            tirageOrdreListEl.innerHTML = '';
            tiragePoolListEl.innerHTML = '';
            tirageHelpEl.textContent = 'Aucun sortant disponible pour un tirage.';
            tirerFinalisteBtn.disabled = true;
            reinitTirageBtn.disabled = true;
            return;
        }

        const total = sortantsConnusPourFinale.length;
        tirageOrdreListEl.innerHTML = Array.from({ length: total }, (_, idx) => {
            const nom = ordreTirageFinale[idx];
            return `<span class="tirage-slot ${nom ? 'done' : ''}">Case ${idx + 1}: ${formaterNomJoueurHTML(nom || '—')}</span>`;
        }).join('');

        tiragePoolListEl.innerHTML = poolTirageFinale.length
            ? poolTirageFinale.map(nom => `<span class="finaliste-chip">${formaterNomJoueurHTML(nom)}</span>`).join('')
            : '<span class="help">Tous les joueurs ont été tirés.</span>';

        if (!ordreTirageFinale.length) {
            tirageHelpEl.textContent = `Tirage non lancé (${total} joueur(s) à tirer).`;
        } else if (ordreTirageFinale.length < total) {
            tirageHelpEl.textContent = `${ordreTirageFinale.length}/${total} case(s) remplies. Clique pour tirer le prochain joueur.`;
        } else {
            tirageHelpEl.textContent = '✅ Tirage complet. Le tableau final utilisera cet ordre.';
        }

        tirerFinalisteBtn.disabled = poolTirageFinale.length === 0;
        reinitTirageBtn.disabled = ordreTirageFinale.length === 0;
        syncActiveTournament();
    }

    function synchroniserInfosPoules(source = 'nb') {
        const nbJoueurs = (joueursSelectionnes || []).length;
        if (nbJoueurs === 0) {
            if (labelJoueursParPouleEl) labelJoueursParPouleEl.textContent = "(Aucun joueur sélectionné)";
            return;
        }

        if (source === 'nb') {
            const nbPoules = Math.max(1, parseInt(nbPoulesEl.value) || 1);
            const parPoule = Math.floor(nbJoueurs / nbPoules);
            const reste = nbJoueurs % nbPoules;

            if (joueursParPouleInputEl) joueursParPouleInputEl.value = parPoule || 1;
            if (labelJoueursParPouleEl) {
                labelJoueursParPouleEl.textContent = reste > 0
                    ? `(soit ${nbPoules - reste} poule(s) de ${parPoule} et ${reste} poule(s) de ${parPoule + 1} joueurs)`
                    : `(soit ${nbPoules} poules de ${parPoule} joueurs)`;
            }
        } else {
            const parPoule = Math.max(2, parseInt(joueursParPouleInputEl.value) || 2);
            const nbPoules = Math.max(1, Math.ceil(nbJoueurs / parPoule));

            if (nbPoulesEl) nbPoulesEl.value = nbPoules;
            const reste = nbJoueurs % nbPoules;
            const parPouleReel = Math.floor(nbJoueurs / nbPoules);

            if (labelJoueursParPouleEl) {
                labelJoueursParPouleEl.textContent = reste > 0
                    ? `(soit ${nbPoules - reste} poule(s) de ${parPouleReel} et ${reste} poule(s) de ${parPouleReel + 1} joueurs)`
                    : `(soit ${nbPoules} poules de ${parPouleReel} joueurs)`;
            }
        }

        const estManuel = repartitionPoulesEl?.value === 'manuelle';
        if (repartitionManuelleWrapEl) repartitionManuelleWrapEl.classList.toggle('hidden', !estManuel);

        if (estManuel && nbJoueurs > 0) {
            genererBucketsPoules(parseInt(nbPoulesEl.value) || 1);
        }
    }

    function genererBucketsPoules(nb) {
        if (!poulesContainerEl) return;
        poulesContainerEl.innerHTML = '';
        for (let i = 0; i < nb; i++) {
            const div = document.createElement('div');
            div.className = 'chakra-choice';
            div.style.minHeight = '100px';
            div.style.marginTop = '10px';
            div.innerHTML = `
                    <p class="chakra-label" style="font-size:0.85rem;"><span class="chakra-icon icon-blue" style="width:16px; height:16px; font-size:0.6rem;"></span> Poule ${String.fromCharCode(65 + i)}</p>
                    <div id="poule-bucket-${i}" class="poule-bucket" style="border: 1px dashed var(--border); border-radius: 8px; padding: 8px; min-height: 60px; display: flex; flex-wrap: wrap; gap: 5px;"></div>
                `;
            poulesContainerEl.appendChild(div);
        }
        distribuerJoueursDansBuckets();
    }

    function distribuerJoueursDansBuckets() {
        const players = [...joueursSelectionnes];
        const bucketA = document.getElementById('poule-bucket-0');
        if (!bucketA) return;

        bucketA.innerHTML = players.map(name => `
                <div class="participant-chip" style="cursor: move;" draggable="true" data-name="${texteSecurise(name)}">
                    ${texteSecurise(name)}
                    <div style="display:flex; gap:2px;">
                        <button type="button" onclick="deplacerJoueurPoule('${texteSecurise(name)}', -1)" style="padding:2px 5px; background:var(--accent-deep); border-radius:4px; font-size:10px;">←</button>
                        <button type="button" onclick="deplacerJoueurPoule('${texteSecurise(name)}', 1)" style="padding:2px 5px; background:var(--accent-deep); border-radius:4px; font-size:10px;">→</button>
                    </div>
                </div>
            `).join('');
    }

    window.deplacerJoueurPoule = function (name, direction) {
        const allBuckets = document.querySelectorAll('.poule-bucket');
        let currentBucket = null;
        let currentIdx = -1;

        allBuckets.forEach((b, idx) => {
            if (b.querySelector(`[data-name="${texteSecurise(name)}"]`)) {
                currentIdx = idx;
                currentBucket = b;
            }
        });

        if (currentIdx === -1) return;

        const targetIdx = currentIdx + direction;
        if (targetIdx >= 0 && targetIdx < allBuckets.length) {
            const chip = currentBucket.querySelector(`[data-name="${texteSecurise(name)}"]`);
            document.getElementById(`poule-bucket-${targetIdx}`).appendChild(chip);
        }
    };

    // Fonction: tirerProchainFinalisteAleatoire - rôle métier documenté pour faciliter la maintenance.
    function tirerProchainFinalisteAleatoire() {
        if (!poolTirageFinale.length) return;
        const index = Math.floor(Math.random() * poolTirageFinale.length);
        const [nom] = poolTirageFinale.splice(index, 1);
        ordreTirageFinale.push(nom);
        renderTirageFinalistes();
    }

    // Fonction: reinitialiserTirageFinalistes - rôle métier documenté pour faciliter la maintenance.
    function reinitialiserTirageFinalistes() {
        synchroniserTirageFinalistes(true);
        renderTirageFinalistes();
    }

    // Fonction: getOrdreFinalistesPourTableau - rôle métier documenté pour faciliter la maintenance.
    function getOrdreFinalistesPourTableau() {
        if (ordreTirageFinale.length > 0 && ordreTirageFinale.length === sortantsConnusPourFinale.length) {
            return [...ordreTirageFinale];
        }
        // Force le recalcul pour les poules, afin d'ignorer une éventuelle liste erronée en cache
        if (tournoiActuel && tournoiActuel.type === 'poules') {
            return getSortantsPoules();
        }
        return [...sortantsConnusPourFinale];
    }

    // Fonction: rendrePageSortants - rôle métier documenté pour faciliter la maintenance.
    function rendrePageSortants() {
        if (!tournoiActuel || !sortantsConnusPourFinale.length) {
            finalistesListEl.innerHTML = '<p class="help">Aucun sortant connu pour le moment.</p>';
            roundSettingsEl.innerHTML = '';
            renderTirageFinalistes();
            return;
        }

        synchroniserTirageFinalistes();

        finalistesListEl.innerHTML = sortantsConnusPourFinale
            .map(nom => `<span class="finaliste-chip">${formaterNomJoueurHTML(nom)}</span>`)
            .join('');

        renderTirageFinalistes();

        const tours = getDefinitionToursTableauFinal(sortantsConnusPourFinale.length);
        const regleParDefaut = tournoiActuel.settings || { condition: 'total', nombre: 1 };

        roundSettingsEl.innerHTML = tours.map(t => `
                <div class="round-setting-row">
                    <p class="help" style="margin-bottom:8px;"><strong>${texteSecurise(t.label)}</strong></p>
                    <div class="inline">
                        <select id="final-regle-condition-${t.round}" class="chakra-select">
                            <option value="total" ${regleParDefaut.condition === 'total' ? 'selected' : ''}>Nombre total de manches</option>
                            <option value="gagnantes" ${regleParDefaut.condition === 'gagnantes' ? 'selected' : ''}>Nombre de manches gagnantes</option>
                        </select>
                        <input id="final-regle-nombre-${t.round}" class="chakra-input" type="number" min="1" step="1" value="${Math.max(1, Number.parseInt(regleParDefaut.nombre, 10) || 1)}" />
                    </div>
                </div>
            `).join('');

        roundSettingsHelpEl.textContent = `${tours.length} tour(s) configurables.`;
        syncActiveTournament();
    }

    // Fonction: lireReglesParTourTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function lireReglesParTourTableauFinal() {
        const tours = getDefinitionToursTableauFinal(sortantsConnusPourFinale.length);
        const regles = {};

        for (const t of tours) {
            const conditionEl = document.getElementById(`final-regle-condition-${t.round}`);
            const nombreEl = document.getElementById(`final-regle-nombre-${t.round}`);
            const condition = conditionEl?.value || 'total';
            const nombre = Number.parseInt(nombreEl?.value || '', 10);

            if (!Number.isInteger(nombre) || nombre <= 0) {
                alert(`Le nombre est invalide pour ${t.label}.`);
                return null;
            }

            regles[t.round] = {
                condition,
                nombre,
                label: t.label
            };
        }

        return regles;
    }

    function getObjectifsPourMatch(settings, playerA, playerB) {
        if (!settings.isMixte) {
            return { objectifA: settings.nombre, objectifB: settings.nombre };
        }
        const jA = joueurs.find((j) => getNomJoueur(j) === playerA);
        const jB = joueurs.find((j) => getNomJoueur(j) === playerB);
        const catA = jA && getCategoriesJoueur(jA).includes('prestige') ? 'prestige' : 'amateur';
        const catB = jB && getCategoriesJoueur(jB).includes('prestige') ? 'prestige' : 'amateur';

        if (catA === 'amateur' && catB === 'amateur') {
            return { objectifA: settings.mixteAmaAma, objectifB: settings.mixteAmaAma };
        }
        if (catA === 'prestige' && catB === 'prestige') {
            return { objectifA: settings.mixtePrePre, objectifB: settings.mixtePrePre };
        }
        if (catA === 'amateur' && catB === 'prestige') {
            return { objectifA: settings.mixteAmaPreAma, objectifB: settings.mixteAmaPrePre };
        }
        return { objectifA: settings.mixteAmaPrePre, objectifB: settings.mixteAmaPreAma };
    }

    // Fonction: validerScoreSelonRegle - rôle métier documenté pour faciliter la maintenance.
    function validerScoreSelonRegle(scoreA, scoreB, settings, playerA, playerB) {
        if (!settings) return null;

        const { objectifA, objectifB } = getObjectifsPourMatch(settings, playerA, playerB);

        if (settings.condition === 'gagnantes') {
            const aValide = scoreA === objectifA && scoreB < objectifB;
            const bValide = scoreB === objectifB && scoreA < objectifA;
            if (!aValide && !bValide) {
                if (objectifA !== objectifB) {
                    return `Handicap : ${playerA} doit atteindre ${objectifA}, et ${playerB} doit atteindre ${objectifB}. Le perdant doit être strictement en dessous de son objectif.`;
                }
                return `Règle ${objectifA} gagnante(s) : un joueur doit atteindre ${objectifA} et l'autre doit être strictement en dessous.`;
            }
            return null;
        }

        // Si condition = 'total'
        const total = settings.nombre; // En mode total, on utilise le réglage brut, le handicap par type de joueur n'a pas de sens.
        if (scoreA + scoreB !== total) {
            return `Règle ${total} manches au total : la somme doit être exactement ${total}.`;
        }
        return null;
    }

    // Fonction: genererScoresRapides - rôle métier documenté pour faciliter la maintenance.
    function genererScoresRapides(settings, playerA, playerB) {
        if (!settings) return [];
        const res = [];
        const { objectifA, objectifB } = getObjectifsPourMatch(settings, playerA, playerB);

        if (settings.condition === 'gagnantes') {
            for (let b = 0; b < objectifB; b++) res.push([objectifA, b]);
            for (let a = 0; a < objectifA; a++) res.push([a, objectifB]);
            return res;
        }

        const total = objectifA;
        for (let a = total; a >= 0; a--) {
            res.push([a, total - a]);
        }
        return res;
    }

    function rafraichirControleLogoAdmin() {
        const doitAfficherActionsLogo = isAdmin;
        if (clubLogoInputEl) {
            clubLogoInputEl.classList.toggle('hidden', !doitAfficherActionsLogo);
            clubLogoInputEl.disabled = !doitAfficherActionsLogo;
        }
        if (resetClubLogoBtn) {
            resetClubLogoBtn.classList.toggle('hidden', !doitAfficherActionsLogo);
            resetClubLogoBtn.disabled = !doitAfficherActionsLogo;
        }
    }

    function appliquerLogoClub() {
        const logos = document.querySelectorAll('.club-logo-sync');
        const logoActif = typeof logoClubDataUrl === 'string' && logoClubDataUrl.startsWith('data:image/');
        if (logoActif) {
            document.documentElement.style.setProperty('--logo-bg-image', `url("${logoClubDataUrl}")`);
            document.body.classList.add('logo-en-fond');
        } else {
            document.documentElement.style.setProperty('--logo-bg-image', 'none');
            document.body.classList.remove('logo-en-fond');
        }
        logos.forEach((img) => {
            if (logoActif) {
                img.src = logoClubDataUrl;
                img.classList.remove('hidden');
            } else {
                img.removeAttribute('src');
                img.classList.add('hidden');
            }
        });
        if (clubLogoHelpEl) {
            clubLogoHelpEl.textContent = isAdmin
                ? (logoActif
                    ? 'Logo actif. Il est sauvegardé localement et aussi appliqué en fond effet vitre sablée.'
                    : 'Importe un logo (PNG, JPG, SVG) pour personnaliser l\'application.')
                : (logoActif
                    ? 'Logo actif. Sa modification est disponible uniquement en mode admin.'
                    : 'Aucun logo actif. Active le mode admin pour en importer un.');
        }
    }

    async function chargerLogoClub() {
        const stocke = localStorage.getItem(STORAGE_KEY_LOGO);
        logoClubDataUrl = stocke && stocke.startsWith('data:image/') ? stocke : '';

        if (supabaseActive) {
            try {
                const remoteLogo = await getRemoteLogo();
                if (remoteLogo && remoteLogo.startsWith('data:image/')) {
                    logoClubDataUrl = remoteLogo;
                    localStorage.setItem(STORAGE_KEY_LOGO, remoteLogo);
                }
            } catch (error) {
                console.error('Chargement logo Supabase impossible:', error.message);
            }
        }

        appliquerLogoClub();
    }

    function enregistrerLogoClub(dataUrl) {
        logoClubDataUrl = dataUrl;
        localStorage.setItem(STORAGE_KEY_LOGO, dataUrl);
        appliquerLogoClub();

        saveRemoteLogo(dataUrl).catch((error) => {
            console.error('Sauvegarde logo Supabase impossible:', error.message);
        });
    }

    function importerLogoClub(event) {
        if (!isAdmin) {
            alert('Seul le mode admin peut modifier le logo du club.');
            event.target.value = '';
            return;
        }
        const fichier = event.target.files?.[0];
        if (!fichier) return;
        if (!fichier.type.startsWith('image/')) {
            alert('Le fichier sélectionné n\'est pas une image.');
            event.target.value = '';
            return;
        }
        if (fichier.size > 1500000) {
            alert('Image trop volumineuse. Utilise un logo inférieur à 1,5 Mo.');
            event.target.value = '';
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            try {
                enregistrerLogoClub(String(reader.result || ''));
            } catch (error) {
                alert('Impossible de sauvegarder ce logo localement. Essaie une image plus légère.');
            }
        };
        reader.readAsDataURL(fichier);
    }

    function retirerLogoClub() {
        enregistrerLogoClub('');
    }

    // ===== 2) Participants & administration =====
    function normaliserCategoriesJoueur(categories) {
        const categoriesValides = ['amateur', 'prestige', 'invite'];
        const source = Array.isArray(categories) ? categories : [];
        const categoriesNormalisees = categoriesValides.filter((categorie) => source.includes(categorie));
        return categoriesNormalisees.length ? categoriesNormalisees : ['amateur', 'prestige'];
    }

    function creerFicheJoueur(nom, categories, photo = '') {
        return {
            nom: String(nom || '').trim(),
            categories: normaliserCategoriesJoueur(categories),
            photo: photo || ''
        };
    }

    function getNomJoueur(joueur) {
        if (typeof joueur === 'string') return joueur.trim();
        return String(joueur?.nom || '').trim();
    }

    function getCategoriesJoueur(joueur) {
        if (typeof joueur === 'string') return ['amateur'];
        return normaliserCategoriesJoueur(joueur?.categories);
    }

    function getPhotoJoueur(joueur) {
        if (typeof joueur === 'string') return '';
        return joueur?.photo || '';
    }

    function trouverJoueur(nom) {
        if (!nom) return null;
        const nomNormalise = nom.trim().toLowerCase();
        return joueurs.find(j => getNomJoueur(j).toLowerCase() === nomNormalise) || null;
    }

    function estJoueurInvite(nom) {
        const j = trouverJoueur(nom);
        return j ? getCategoriesJoueur(j).includes('invite') : false;
    }

    function formaterNomJoueurHTML(nom) {
        const nomSec = texteSecurise(nom);
        if (estJoueurInvite(nom)) {
            return `${nomSec} <span class="guest-badge-pill">👤 Invité</span>`;
        }
        return nomSec;
    }

    function getInitiales(nom) {
        if (!nom) return '?';
        const parts = nom.split(' ').filter(Boolean);
        if (parts.length === 0) return '?';
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function obtenirAvatarHTML(joueur, sizeClass = '') {
        const nom = getNomJoueur(joueur);
        const photo = getPhotoJoueur(joueur);
        const categories = getCategoriesJoueur(joueur);
        const isPrestige = categories.includes('prestige');
        const catClass = isPrestige ? 'cat-prestige' : 'cat-amateur';

        if (photo) {
            return `<div class="avatar ${sizeClass} ${catClass}"><img src="${photo}" alt="${nom}"></div>`;
        }
        return `<div class="avatar ${sizeClass} ${catClass}">${getInitiales(nom)}</div>`;
    }

    function getCategorieTournoiSelectionnee() {
        return tournoiCategorieEl ? tournoiCategorieEl.value : 'amateur';
    }

    function joueurCorrespondCategorie(joueur, categorie) {
        if (categorie === 'mixte') return true;
        return getCategoriesJoueur(joueur).includes(categorie);
    }

    function getJoueursDisponiblesPourCategorie(categorie = getCategorieTournoiSelectionnee()) {
        return joueurs
            .filter((joueur) => joueurCorrespondCategorie(joueur, categorie))
            .map((joueur) => getNomJoueur(joueur))
            .filter(Boolean);
    }

    function getCategoriesNouveauJoueur() {
        const categories = [];
        if (newPlayerAmateurEl?.checked) categories.push('amateur');
        if (newPlayerPrestigeEl?.checked) categories.push('prestige');
        if (newPlayerGuestEl?.checked) categories.push('invite');
        return categories;
    }

    function sauvegarderCategoriesNouveauJoueur() {
        if (newPlayerAmateurEl) localStorage.setItem('newPlayerAmateur', newPlayerAmateurEl.checked);
        if (newPlayerPrestigeEl) localStorage.setItem('newPlayerPrestige', newPlayerPrestigeEl.checked);
        if (newPlayerGuestEl) localStorage.setItem('newPlayerGuest', newPlayerGuestEl.checked);
    }

    function reinitialiserCategoriesNouveauJoueur() {
        const savedAmateur = localStorage.getItem('newPlayerAmateur');
        const savedPrestige = localStorage.getItem('newPlayerPrestige');
        const savedGuest = localStorage.getItem('newPlayerGuest');

        if (newPlayerAmateurEl) {
            newPlayerAmateurEl.checked = savedAmateur !== null ? savedAmateur === 'true' : true;
            newPlayerAmateurEl.addEventListener('change', sauvegarderCategoriesNouveauJoueur);
        }
        if (newPlayerPrestigeEl) {
            newPlayerPrestigeEl.checked = savedPrestige !== null ? savedPrestige === 'true' : true;
            newPlayerPrestigeEl.addEventListener('change', sauvegarderCategoriesNouveauJoueur);
        }
        if (newPlayerGuestEl) {
            newPlayerGuestEl.checked = savedGuest !== null ? savedGuest === 'true' : false;
            newPlayerGuestEl.addEventListener('change', sauvegarderCategoriesNouveauJoueur);
        }
    }

    function synchroniserSelectionCategorie() {
        const joueursDisponibles = new Set(
            getJoueursDisponiblesPourCategorie().map((nom) => nom.toLowerCase())
        );
        const tailleAvant = joueursSelectionnes.length;
        joueursSelectionnes = joueursSelectionnes.filter((nom) => joueursDisponibles.has(nom.toLowerCase()));
        if (joueursSelectionnes.length !== tailleAvant) {
            selectionParticipantsVerrouillee = false;
        }
    }

    // Fonction: getSelectionChecklist - rôle métier documenté pour faciliter la maintenance.
    function getSelectionChecklist() {
        const checks = Array.from(playersChecklistEl.querySelectorAll('input[type="checkbox"][data-player]'));
        return checks
            .filter(c => c.checked)
            .map(c => c.dataset.player)
            .filter(Boolean);
    }

    // Fonction: rendreChecklistParticipants - rôle métier documenté pour faciliter la maintenance.
    function rendreChecklistParticipants() {
        const joueursDisponibles = getJoueursDisponiblesPourCategorie();
        const categorieLabel = getCategorieTournoiSelectionnee() === 'mixte' ? 'Mixte' : (getCategorieTournoiSelectionnee() === 'prestige' ? 'Prestige' : 'Amateur');

        if (!joueurs.length) {
            playersChecklistEl.innerHTML = '<span class="help">Aucun joueur en base. Active le mode admin pour en ajouter.</span>';
            playersChecklistEl.classList.remove('locked');
            validateSelectionBtn.classList.remove('hidden');
            editSelectionBtn.classList.add('hidden');
            return;
        }

        if (!joueursDisponibles.length) {
            playersChecklistEl.innerHTML = `<span class="help">Aucun joueur n'est classé dans la catégorie ${categorieLabel}. Active le mode admin pour ajuster les catégories.</span>`;
            playersChecklistEl.classList.remove('locked');
            validateSelectionBtn.classList.remove('hidden');
            editSelectionBtn.classList.add('hidden');
            return;
        }

        playersChecklistEl.innerHTML = joueursDisponibles
            .map(nom => {
                const joueur = joueurs.find(j => getNomJoueur(j) === nom);
                const checked = joueursSelectionnes.some(sel => sel.toLowerCase() === nom.toLowerCase()) ? 'checked' : '';
                const disabled = selectionParticipantsVerrouillee ? 'disabled' : '';
                return `
                        <label class="checklist-row">
                            <input type="checkbox" data-player="${nom}" ${checked} ${disabled}>
                            <div class="player-row-with-photo">
                                ${obtenirAvatarHTML(joueur, 'avatar-small')}
                                <span>${formaterNomJoueurHTML(nom)}</span>
                            </div>
                        </label>
                    `;
            })
            .join('');

        playersChecklistEl.classList.toggle('locked', selectionParticipantsVerrouillee);
        validateSelectionBtn.classList.toggle('hidden', selectionParticipantsVerrouillee);
        editSelectionBtn.classList.toggle('hidden', !selectionParticipantsVerrouillee);
    }

    // Fonction: rendreParticipantsSelectionnes - rôle métier documenté pour faciliter la maintenance.
    function rendreParticipantsSelectionnes() {
        if (!joueursSelectionnes.length) {
            selectedPlayersListEl.innerHTML = '<p class="help" style="margin:0;">Aucun participant validé.</p>';
            selectedPlayersHelpEl.textContent = selectionParticipantsVerrouillee
                ? 'Aucun participant validé. Clique sur « Modifier la sélection ».'
                : 'Sélectionne au moins 2 joueurs puis valide.';
            return;
        }

        selectedPlayersListEl.innerHTML = joueursSelectionnes
            .map(nom => {
                const joueur = joueurs.find(j => getNomJoueur(j) === nom);
                return `
                        <div class="participant-chip">
                            ${obtenirAvatarHTML(joueur, 'avatar-small')}
                            <span>${formaterNomJoueurHTML(nom)}</span>
                        </div>
                    `;
            })
            .join('');

        selectedPlayersHelpEl.textContent = selectionParticipantsVerrouillee
            ? `${joueursSelectionnes.length} participant(s) validé(s).`
            : `${joueursSelectionnes.length} joueur(s) coché(s). Clique sur « Valider la sélection ».`;
    }

    // Fonction: validerSelectionParticipants - rôle métier documenté pour faciliter la maintenance.
    function validerSelectionParticipants() {
        const selection = getSelectionChecklist();
        if (selection.length < 2) {
            alert('Il faut cocher au moins 2 joueurs pour valider la sélection.');
            return;
        }

        joueursSelectionnes = selection;
        selectionParticipantsVerrouillee = true;
        rendreChecklistParticipants();
        rendreParticipantsSelectionnes();

        if (typeTournoiEl.value === 'poules') {
            synchroniserInfosPoules();
        }
    }

    // Fonction: modifierSelectionParticipants - rôle métier documenté pour faciliter la maintenance.
    function modifierSelectionParticipants() {
        selectionParticipantsVerrouillee = false;
        rendreChecklistParticipants();
        rendreParticipantsSelectionnes();
    }

    // Fonction: lireJoueursDepuisDatalist - rôle métier documenté pour faciliter la maintenance.
    function lireJoueursDepuisDatalist() {
        return Array.from(datalistEl.querySelectorAll('option'))
            .map(opt => creerFicheJoueur(opt.value, ['amateur']))
            .filter(joueur => getNomJoueur(joueur));
    }

    // Fonction: chargerJoueurs - rôle métier documenté pour faciliter la maintenance.
    async function chargerJoueurs() {
        const brut = localStorage.getItem(STORAGE_KEY_PLAYERS);
        let localPlayers = [];
        try {
            if (brut) {
                const parses = JSON.parse(brut);
                if (Array.isArray(parses)) {
                    localPlayers = parses
                        .map((joueur) => {
                            if (typeof joueur === 'string') {
                                return creerFicheJoueur(joueur, ['amateur']);
                            }
                            return creerFicheJoueur(joueur?.nom, joueur?.categories, joueur?.photo);
                        })
                        .filter((joueur) => getNomJoueur(joueur));
                }
            }
        } catch (_) { }

        if (supabaseActive) {
            try {
                const remotePlayers = await getRemotePlayers();
                if (remotePlayers.length) {
                    joueurs = remotePlayers
                        .map((joueur) => creerFicheJoueur(joueur?.name, joueur?.categories, joueur?.photo))
                        .filter((joueur) => getNomJoueur(joueur));
                    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(joueurs));
                    return;
                } else if (localPlayers.length) {
                    // Auto-guérison : si la base distante est vide mais qu'on a un cache local, on téléverse vers Supabase
                    joueurs = localPlayers;
                    console.log("Self-healing : Envoi du cache local des joueurs vers Supabase vide...");
                    await saveRemotePlayers(joueurs);
                    return;
                }
            } catch (error) {
                console.error('Chargement joueurs Supabase impossible:', error.message);
            }
        }

        if (!brut) {
            joueurs = lireJoueursDepuisDatalist();
            sauvegarderJoueurs();
            return;
        }

        if (localPlayers.length) {
            joueurs = localPlayers;
        } else {
            joueurs = lireJoueursDepuisDatalist();
            sauvegarderJoueurs();
        }
    }

    // Fonction: sauvegarderJoueurs - rôle métier documenté pour faciliter la maintenance.
    function sauvegarderJoueurs() {
        localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(joueurs));

        saveRemotePlayers(joueurs).catch((error) => {
            console.error('Sauvegarde joueurs Supabase impossible:', error.message);
        });
    }

    // Fonction: rendreDatalist - rôle métier documenté pour faciliter la maintenance.
    function rendreDatalist() {
        datalistEl.innerHTML = joueurs.map((joueur) => `<option value="${getNomJoueur(joueur)}"></option>`).join('');
    }

    // Fonction: rendreListeAdmin - rôle métier documenté pour faciliter la maintenance.
    function rendreListeAdmin() {
        if (!isAdmin) {
            playersAdminListEl.innerHTML = '';
            return;
        }

        if (!joueurs.length) {
            playersAdminListEl.innerHTML = '<p class="help">Aucun joueur enregistré.</p>';
            return;
        }

        playersAdminListEl.innerHTML = joueurs.map((joueur, index) => {
            const nom = getNomJoueur(joueur);
            const categories = getCategoriesJoueur(joueur);
            const photo = getPhotoJoueur(joueur);
            return `
                <div class="player-item">
                    <div class="player-main">
                        <div class="player-row-with-photo">
                            <div style="cursor:pointer;" onclick="lancerUploadPhotoJoueur(${index})" title="Changer la photo">
                                ${obtenirAvatarHTML(joueur)}
                            </div>
                            <div>
                                <div class="player-name">${formaterNomJoueurHTML(nom)}</div>
                                <div class="player-categories">
                                    <label class="admin-category-chip admin-category-chip-small"><input type="checkbox" onchange="modifierCategorieJoueur(${index}, 'amateur', this.checked)" ${categories.includes('amateur') ? 'checked' : ''}> Amateur</label>
                                    <label class="admin-category-chip admin-category-chip-small"><input type="checkbox" onchange="modifierCategorieJoueur(${index}, 'prestige', this.checked)" ${categories.includes('prestige') ? 'checked' : ''}> Prestige</label>
                                    <label class="admin-category-chip admin-category-chip-small"><input type="checkbox" onchange="modifierCategorieJoueur(${index}, 'invite', this.checked)" ${categories.includes('invite') ? 'checked' : ''}> 👤 Invité</label>
                                </div>
                                <button type="button" class="btn-photo-upload" onclick="lancerUploadPhotoJoueur(${index})">
                                    ${photo ? 'Changer photo' : 'Ajouter photo'}
                                </button>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="player-remove" onclick="supprimerJoueur(${index})">Supprimer</button>
                </div>
            `;
        }).join('');
    }

    // Fonction: rafraichirUI - rôle métier documenté pour faciliter la maintenance.
    function rafraichirUI() {
        try {
            if (adminPanelEl) {
                adminPanelEl.style.display = isAdmin ? 'block' : 'none';
                const adminCard = adminPanelEl.closest('.admin-card');
                if (adminCard) {
                    adminCard.classList.toggle('active', isAdmin);
                    adminCard.style.opacity = '1';
                    adminCard.style.visibility = 'visible';
                }
            }
            if (adminToggleBtn) {
                adminToggleBtn.textContent = isAdmin ? 'Admin actif' : 'Mode admin';
                adminToggleBtn.className = isAdmin ? 'btn-main' : 'btn-alt';
            }
            if (typeof rafraichirControleLogoAdmin === 'function') rafraichirControleLogoAdmin();
            if (typeof synchroniserSelectionCategorie === 'function') synchroniserSelectionCategorie();
            if (typeof rendreDatalist === 'function') rendreDatalist();
            if (typeof rendreListeAdmin === 'function') rendreListeAdmin();
            if (typeof rendreChecklistParticipants === 'function') rendreChecklistParticipants();
            if (typeof rendreParticipantsSelectionnes === 'function') rendreParticipantsSelectionnes();
            if (typeof rendreFondEcranAdmin === 'function') rendreFondEcranAdmin();
            if (typeof appliquerLogoClub === 'function') appliquerLogoClub();
        } catch (e) {
            console.error("Erreur dans rafraichirUI:", e);
        }
    }

    // Fonction: nomExisteDeja - rôle métier documenté pour faciliter la maintenance.
    function nomExisteDeja(nouveauNom) {
        return joueurs.some(joueur => getNomJoueur(joueur).toLowerCase() === nouveauNom.toLowerCase());
    }

    // Fonction: ajouterJoueur - rôle métier documenté pour faciliter la maintenance.
    function ajouterJoueur() {
        if (!isAdmin) return;
        const nom = newPlayerInputEl.value.trim();
        const categories = getCategoriesNouveauJoueur();
        if (!nom) {
            alert('Entre un nom de joueur.');
            return;
        }
        if (!categories.length) {
            alert('Sélectionne au moins une catégorie pour ce joueur.');
            return;
        }
        if (nomExisteDeja(nom)) {
            alert('Ce joueur existe déjà dans la base.');
            return;
        }

        joueurs.push(creerFicheJoueur(nom, categories));
        joueurs.sort((a, b) => getNomJoueur(a).localeCompare(getNomJoueur(b), 'fr'));
        sauvegarderJoueurs();
        newPlayerInputEl.value = '';
        reinitialiserCategoriesNouveauJoueur();
        rafraichirUI();
    }

    // Fonction: parseAssoconnectCsv - rôle métier documenté pour faciliter la maintenance.
    function parseAssoconnectCsv(csvText) {
        const lines = csvText.split(/\r?\n/).filter(l => l.trim() !== '');
        if (lines.length < 2) return [];

        const headerLine = lines[0];
        const separator = headerLine.includes(';') ? ';' : ',';
        const headers = headerLine.split(separator).map(h => h.trim().toLowerCase());

        let indexNom = headers.findIndex(h => h.includes('nom'));
        let indexPrenom = headers.findIndex(h => h.includes('prénom') || h.includes('prenom'));
        let indexIdentite = headers.findIndex(h => h.includes('identité') || h.includes('identite'));

        const importedNames = [];

        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(separator).map(c => c.trim().replace(/^"|"$/g, ''));
            if (cols.length < Math.max(indexNom, indexPrenom, indexIdentite, 0)) continue;

            let fullName = '';
            if (indexNom >= 0 && indexPrenom >= 0 && cols[indexNom] && cols[indexPrenom]) {
                fullName = `${cols[indexPrenom]} ${cols[indexNom]}`;
            } else if (indexNom >= 0 && cols[indexNom]) {
                fullName = cols[indexNom];
            } else if (indexIdentite >= 0 && cols[indexIdentite]) {
                fullName = cols[indexIdentite];
            }

            if (fullName) {
                const formattedName = fullName.split(' ')
                    .filter(Boolean)
                    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
                    .join(' ');
                importedNames.push(formattedName);
            }
        }
        return importedNames;
    }

    // Fonction: importerAssoconnectCsv - rôle métier documenté pour faciliter la maintenance.
    function importerAssoconnectCsv(event) {
        if (!isAdmin) return;
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const text = e.target.result;
            const parsedNames = parseAssoconnectCsv(text);

            if (parsedNames.length === 0) {
                alert('Aucun joueur trouvé. Vérifiez que le fichier CSV d\'AssoConnect contient des colonnes "Nom" et "Prénom" ou "Identité" ou "Prenom".');
                event.target.value = '';
                return;
            }

            let addedCount = 0;
            parsedNames.forEach(nom => {
                if (!nomExisteDeja(nom)) {
                    joueurs.push(creerFicheJoueur(nom, ['amateur', 'prestige']));
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                joueurs.sort((a, b) => getNomJoueur(a).localeCompare(getNomJoueur(b), 'fr'));
                sauvegarderJoueurs();
                rafraichirUI();
                alert(`${addedCount} joueur(s) importé(s) avec succès !`);
            } else {
                alert('Tous les joueurs du fichier sont déjà présents dans la base locale.');
            }
            event.target.value = '';
        };
        reader.onerror = function () {
            alert('Erreur lors de la lecture du fichier.');
            event.target.value = '';
        };
        reader.readAsText(file);
    }

    // Fonction: supprimerJoueur - rôle métier documenté pour faciliter la maintenance.
    function supprimerJoueur(index) {
        if (!isAdmin) return;
        const nom = getNomJoueur(joueurs[index]);
        if (!nom) return;

        const ok = confirm(`Supprimer ${nom} de la base joueurs ?`);
        if (!ok) return;

        joueurs.splice(index, 1);
        joueursSelectionnes = joueursSelectionnes.filter(n => n.toLowerCase() !== nom.toLowerCase());
        sauvegarderJoueurs();
        rafraichirUI();
        rendreParticipantsSelectionnes();
    }

    function modifierCategorieJoueur(index, categorie, estActive) {
        if (!isAdmin) return;
        const joueur = joueurs[index];
        const nom = getNomJoueur(joueur);
        const photo = getPhotoJoueur(joueur);
        if (!nom) return;

        const categories = new Set(getCategoriesJoueur(joueur));
        if (estActive) {
            categories.add(categorie);
        } else {
            categories.delete(categorie);
        }

        if (!categories.size) {
            alert('Un joueur doit appartenir à au moins une catégorie.');
            rafraichirUI();
            return;
        }

        joueurs[index] = creerFicheJoueur(nom, Array.from(categories), photo);
        sauvegarderJoueurs();
        rafraichirUI();
    }

    function modifierPhotoJoueur(index, dataUrl) {
        if (!isAdmin) return;
        const joueur = joueurs[index];
        const nom = getNomJoueur(joueur);
        const categories = getCategoriesJoueur(joueur);

        joueurs[index] = creerFicheJoueur(nom, categories, dataUrl);
        sauvegarderJoueurs();
        rafraichirUI();
    }

    function lancerUploadPhotoJoueur(index) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => chargerPhotoJoueur(index, e);
        input.click();
    }

    async function chargerPhotoJoueur(index, event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const joueur = joueurs[index];
        const nom = getNomJoueur(joueur);

        if (supabaseActive && supabaseClient) {
            try {
                const remoteUrl = await uploadPlayerPhotoRemote(file, nom);
                if (remoteUrl) {
                    modifierPhotoJoueur(index, remoteUrl);
                    return;
                }
            } catch (e) {
                console.error("Échec upload distant, repli local...", e);
            }
        }

        // Repli Local (Base64) si Supabase échoue ou est inactif
        if (file.size > 800000) {
            alert('La photo est trop lourde pour le stockage local (max 800Ko).');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            modifierPhotoJoueur(index, e.target.result);
        };
        reader.readAsDataURL(file);
    }

    window.supprimerJoueur = supprimerJoueur;
    window.modifierCategorieJoueur = modifierCategorieJoueur;
    window.lancerUploadPhotoJoueur = lancerUploadPhotoJoueur;

    // Fonction: activerModeAdmin - rôle métier documenté pour faciliter la maintenance.
    function activerModeAdmin() {
        const pin = prompt('Code admin requis :');
        if (pin === null) return;
        if (pin !== ADMIN_PIN) {
            alert('Code admin incorrect.');
            return;
        }
        isAdmin = true;
        rafraichirUI();
    }

    // Fonction: quitterModeAdmin - rôle métier documenté pour faciliter la maintenance.
    function quitterModeAdmin() {
        isAdmin = false;
        rafraichirUI();
    }

    // ===== 3) Moteur Cartésien (matchmaking, tables, scores) =====
    // Fonction: genererRoundsRoundRobin - rôle métier documenté pour faciliter la maintenance.
    function genererRoundsRoundRobin(participants) {
        const list = [...participants];
        const aUnBye = list.length % 2 !== 0;
        if (aUnBye) list.push('BYE');

        const totalRounds = list.length - 1;
        const demi = list.length / 2;
        const rotation = [...list];
        const rounds = [];

        for (let r = 1; r <= totalRounds; r++) {
            const matchsRound = [];
            for (let i = 0; i < demi; i++) {
                const a = rotation[i];
                const b = rotation[rotation.length - 1 - i];
                if (a !== 'BYE' && b !== 'BYE') {
                    matchsRound.push({ playerA: a, playerB: b, round: r });
                }
            }

            rounds.push(matchsRound);
            const fixed = rotation[0];
            const rest = rotation.slice(1);
            rest.unshift(rest.pop());
            rotation.splice(0, rotation.length, fixed, ...rest);
        }

        return rounds;
    }

    // Fonction: creerTournoiCartesien - rôle métier documenté pour faciliter la maintenance.
    function creerTournoiCartesien(participants, settings) {
        const rounds = genererRoundsRoundRobin(participants);
        let idSeq = 1;
        const matches = rounds.flatMap(roundMatches => roundMatches.map(m => ({
            id: idSeq++,
            round: m.round,
            playerA: m.playerA,
            playerB: m.playerB,
            matchType: 'regular',
            status: 'waiting',
            table: null,
            scoreA: null,
            scoreB: null,
            winner: null,
            finishedAt: null
        })));

        return {
            type: 'cartesien',
            categorie: tournoiCategorieEl ? tournoiCategorieEl.value : 'amateur',
            players: [...participants],
            settings,
            tieBreakWinners: {},
            departageGroupes: [],
            departageVersion: DEPARTAGE_VERSION,
            matches,
            completedMatchCount: 0,
            postponedSequence: 0,
            startedAt: new Date().toISOString()
        };
    }

    // Fonction: obtenirTablesLibres - rôle métier documenté pour faciliter la maintenance.
    function obtenirTablesLibres() {
        const prises = tournoiActuel.matches
            .filter(m => m.status === 'in_progress' && m.table !== null)
            .map(m => m.table);

        const libres = [];
        for (let t = 1; t <= MAX_BILLARDS; t++) {
            if (!prises.includes(t)) libres.push(t);
        }
        return libres;
    }

    // Fonction: getJoueursEnCours - rôle métier documenté pour faciliter la maintenance.
    function getJoueursEnCours() {
        if (!tournoiActuel) return new Set();
        const set = new Set();
        tournoiActuel.matches
            .filter(m => m.status === 'in_progress')
            .forEach(m => {
                set.add(m.playerA);
                set.add(m.playerB);
            });
        return set;
    }

    // Fonction: getCompteurMatchsEngages - rôle métier documenté pour faciliter la maintenance.
    function getCompteurMatchsEngages() {
        if (!tournoiActuel) return {};

        const compteur = Object.fromEntries(tournoiActuel.players.map(p => [p, 0]));
        tournoiActuel.matches
            .filter(m => m.status === 'in_progress' || m.status === 'finished')
            .forEach(m => {
                compteur[m.playerA] += 1;
                compteur[m.playerB] += 1;
            });

        return compteur;
    }

    // Fonction: tousLesMatchsReguliersTermines - rôle métier documenté pour faciliter la maintenance.
    function tousLesMatchsReguliersTermines() {
        if (!tournoiActuel) return false;
        return tournoiActuel.matches
            .filter(m => m.matchType !== 'tiebreak')
            .every(m => m.status === 'finished');
    }

    // Fonction: aTieBreakEnAttenteOuEnCours - rôle métier documenté pour faciliter la maintenance.
    function aTieBreakEnAttenteOuEnCours() {
        if (!tournoiActuel) return false;
        return tournoiActuel.matches.some(
            m => m.matchType === 'tiebreak' && m.status !== 'finished'
        );
    }

    // Fonction: getCleEgaliteStats - rôle métier documenté pour faciliter la maintenance.
    function getCleEgaliteStats(ligne) {
        return `${ligne.pts}|${ligne.v}|${ligne.n}|${ligne.d}`;
    }

    // Fonction: getGroupesEgaliteParfaite - rôle métier documenté pour faciliter la maintenance.
    function getGroupesEgaliteParfaite(stats) {
        const groupes = new Map();
        Object.values(stats).forEach(s => {
            const key = getCleEgaliteStats(s);
            if (!groupes.has(key)) groupes.set(key, []);
            groupes.get(key).push(s.joueur);
        });
        return Array.from(groupes.values()).filter(g => g.length >= 2);
    }

    // Fonction: getStatsTieBreak - rôle métier documenté pour faciliter la maintenance.
    function getStatsTieBreak() {
        if (!tournoiActuel) return {};
        const stats = Object.fromEntries(
            tournoiActuel.players.map(p => [p, { tbV: 0, tbD: 0, tbPts: 0 }])
        );

        tournoiActuel.matches
            .filter(m => m.matchType === 'tiebreak' && m.status === 'finished' && m.winner)
            .forEach(m => {
                const perdant = m.winner === m.playerA ? m.playerB : m.playerA;
                stats[m.winner].tbV += 1;
                stats[m.winner].tbPts += 1;
                stats[perdant].tbD += 1;
            });

        return stats;
    }

    // Fonction: existeTieBreakActifPourPair - rôle métier documenté pour faciliter la maintenance.
    function existeTieBreakActifPourPair(joueurA, joueurB) {
        if (!tournoiActuel) return false;
        const key = getTieBreakPairKey(joueurA, joueurB);
        return tournoiActuel.matches.some(
            m => m.matchType === 'tiebreak' && getTieBreakPairKey(m.playerA, m.playerB) === key && m.status !== 'finished'
        );
    }

    // Fonction: existeTieBreakDejaCreePourPair - rôle métier documenté pour faciliter la maintenance.
    function existeTieBreakDejaCreePourPair(joueurA, joueurB) {
        if (!tournoiActuel) return false;
        const key = getTieBreakPairKey(joueurA, joueurB);
        return tournoiActuel.matches.some(
            m => m.matchType === 'tiebreak' && getTieBreakPairKey(m.playerA, m.playerB) === key
        );
    }

    // Fonction: creerMatchTieBreak - rôle métier documenté pour faciliter la maintenance.
    function creerMatchTieBreak(joueurA, joueurB) {
        if (!tournoiActuel) return;
        if (existeTieBreakDejaCreePourPair(joueurA, joueurB)) return;
        if (getWinnerTieBreak(joueurA, joueurB)) return;

        tournoiActuel.matches.push({
            id: getNextMatchId(),
            round: getNextTieBreakRound(),
            playerA: joueurA,
            playerB: joueurB,
            matchType: 'tiebreak',
            status: 'waiting',
            table: null,
            scoreA: null,
            scoreB: null,
            winner: null,
            finishedAt: null
        });
    }

    // Fonction: getMaximumPointsParMatch - rôle métier documenté pour faciliter la maintenance.
    function getMaximumPointsParMatch(settings) {
        const v = Number.isFinite(settings?.pointsVictoire) ? settings.pointsVictoire : 3;
        const n = Number.isFinite(settings?.pointsNul) ? settings.pointsNul : 1;
        const d = Number.isFinite(settings?.pointsDefaite) ? settings.pointsDefaite : 0;
        return Math.max(v, n, d);
    }

    // Fonction: getTieBreakPairKey - rôle métier documenté pour faciliter la maintenance.
    function getTieBreakPairKey(joueurA, joueurB) {
        return [joueurA, joueurB].sort((a, b) => a.localeCompare(b, 'fr')).join('||');
    }

    // Fonction: getWinnerTieBreak - rôle métier documenté pour faciliter la maintenance.
    function getWinnerTieBreak(joueurA, joueurB) {
        if (!tournoiActuel) return null;
        return tournoiActuel.tieBreakWinners?.[getTieBreakPairKey(joueurA, joueurB)] || null;
    }

    // ===== Départage manuel (tirage au sort ou jeu de partage) =====

    function getDepartageGroupeKey(joueurs) {
        return joueurs.slice().sort((a, b) => a.localeCompare(b, 'fr')).join('||');
    }

    function getDepartageGroupes() {
        return tournoiActuel?.departageGroupes || [];
    }

    function normaliserDepartageStockage() {
        if (!tournoiActuel) return;
        if (!Array.isArray(tournoiActuel.departageGroupes)) {
            tournoiActuel.departageGroupes = [];
        }
        if (tournoiActuel.departageVersion !== DEPARTAGE_VERSION) {
            tournoiActuel.departageGroupes = [];
            tournoiActuel.departageVersion = DEPARTAGE_VERSION;
        }
    }

    function invaliderDepartageGroupes() {
        if (!tournoiActuel) return;
        tournoiActuel.departageGroupes = [];
        tournoiActuel.departageVersion = DEPARTAGE_VERSION;
    }

    function getDepartageGroupePourPaire(joueurA, joueurB) {
        if (!tournoiActuel) return null;
        return getDepartageGroupes().find(dg =>
            Array.isArray(dg?.joueurs)
            && Array.isArray(dg?.ordre)
            && dg.joueurs.includes(joueurA)
            && dg.joueurs.includes(joueurB)
            && dg.ordre.includes(joueurA)
            && dg.ordre.includes(joueurB)
        ) || null;
    }

    function storerDepartageGroupe(joueurs, qualifies) {
        if (!tournoiActuel) return;
        if (!tournoiActuel.departageGroupes) tournoiActuel.departageGroupes = [];
        const key = getDepartageGroupeKey(joueurs);
        const listeQualifiesBrute = Array.isArray(qualifies) ? qualifies : [qualifies];
        const listeQualifies = listeQualifiesBrute
            .filter(j => joueurs.includes(j))
            .filter((j, idx, arr) => arr.indexOf(j) === idx);
        if (!listeQualifies.length) return;

        const reste = joueurs
            .filter(j => !listeQualifies.includes(j))
            .sort((a, b) => a.localeCompare(b, 'fr'));
        const ordre = [...listeQualifies, ...reste];
        const existant = tournoiActuel.departageGroupes.find(dg => dg.key === key);
        if (existant) {
            existant.ordre = ordre;
            existant.qualifies = [...listeQualifies];
        } else {
            tournoiActuel.departageGroupes.push({ key, joueurs: joueurs.slice(), ordre, qualifies: [...listeQualifies] });
        }
    }

    // Détermine si deux entrées de classement sont encore à égalité résiduelle
    // en appliquant exactement les mêmes critères automatiques que le comparateur.
    function estEgaliteResiduelle(a, b) {
        const ab = comparerClassement(a, b);
        const ba = comparerClassement(b, a);
        return ab === 0 && ba === 0;
    }

    // Détecte un groupe en égalité résiduelle au point de coupure (seulement si tous les matchs réguliers sont finis)
    function detecterEgaliteNonResolue() {
        if (!tournoiActuel) return null;
        normaliserDepartageStockage();
        if (!tousLesMatchsReguliersTermines()) return null;
        const nbSortants = getNombreSortants();
        if (nbSortants <= 0 || nbSortants >= tournoiActuel.players.length) return null;

        const stats = construireStatsTournoi();
        if (Object.values(stats).every(s => (s.joues ?? 0) === 0)) return null;
        const classement = Object.values(stats).sort(comparerClassement);
        if (classement.length <= nbSortants) return null;

        const atCutoff = classement[nbSortants - 1];
        const afterCutoff = classement[nbSortants];
        if (!estEgaliteResiduelle(atCutoff, afterCutoff)) return null;

        const groupe = classement
            .filter(l => estEgaliteResiduelle(l, atCutoff))
            .map(l => l.joueur);
        if (groupe.length < 2) return null;

        const indexPremierGroupe = classement.findIndex(l => groupe.includes(l.joueur));
        if (indexPremierGroupe === -1) return null;
        const nbPlaces = nbSortants - indexPremierGroupe;
        if (nbPlaces <= 0 || nbPlaces >= groupe.length) return null;

        // Déjà traité ? Seulement si l'ordre stocké départage vraiment la coupure.
        const key = getDepartageGroupeKey(groupe);
        const existant = getDepartageGroupes().find(dg => dg.key === key);
        if (existant && Array.isArray(existant.ordre)) {
            const posCutoff = existant.ordre.indexOf(atCutoff.joueur);
            const posAfter = existant.ordre.indexOf(afterCutoff.joueur);
            if (posCutoff !== -1 && posAfter !== -1 && posCutoff !== posAfter) {
                return null;
            }
        }

        return { groupe, nbPlaces };
    }

    let departageModalOuvert = false;
    let departageGroupeEnCours = null;
    let tirageTempResult = null;
    let departageModalInitialise = false;
    let departagePromptOuvert = false;

    function demanderDepartageSimple(contexte) {
        const groupe = contexte?.groupe;
        const nbPlaces = contexte?.nbPlaces;
        if (!Array.isArray(groupe) || groupe.length < 2) return;
        if (!Number.isInteger(nbPlaces) || nbPlaces <= 0 || nbPlaces >= groupe.length) return;
        if (departagePromptOuvert) return;

        departagePromptOuvert = true;
        try {
            const liste = groupe.map((joueur, index) => `${index + 1}. ${joueur}`).join('\n');
            alert(
                'Egalite parfaite detectee.\n\n'
                + `Il faut indiquer ${nbPlaces} joueur(s) qui passe(nt).\n`
                + 'Saisis les numeros ou noms, separes par virgule.\n\n'
                + liste
            );

            const saisie = prompt(`Indique ${nbPlaces} joueur(s) (ex: 1,3 ou Anne,Sebastien) :`);
            if (saisie === null) return;

            const brut = String(saisie).trim();
            if (!brut) {
                alert('Aucune saisie. Merci d\'indiquer les joueurs qui passent.');
                return;
            }

            const tokens = brut
                .split(/[;,]/)
                .map(t => t.trim())
                .filter(Boolean);

            const selection = [];
            tokens.forEach(token => {
                let choisi = null;
                const numero = Number.parseInt(token, 10);
                if (Number.isInteger(numero) && numero >= 1 && numero <= groupe.length) {
                    choisi = groupe[numero - 1];
                }
                if (!choisi) {
                    choisi = groupe.find(j => j.toLowerCase() === token.toLowerCase()) || null;
                }
                if (!choisi) {
                    const partiels = groupe.filter(j => j.toLowerCase().includes(token.toLowerCase()));
                    if (partiels.length === 1) choisi = partiels[0];
                }
                if (choisi && !selection.includes(choisi)) selection.push(choisi);
            });

            if (selection.length !== nbPlaces) {
                alert(`Saisie invalide. Il faut choisir exactement ${nbPlaces} joueur(s).`);
                return;
            }

            storerDepartageGroupe(groupe, selection);
            renderTournoi();
        } finally {
            departagePromptOuvert = false;
        }
    }

    function domModalDepartagePret() {
        return !!(
            document.getElementById('dept-overlay')
            && document.getElementById('dept-desc')
            && document.getElementById('dept-joueurs-list')
            && document.getElementById('dept-tirage-section')
            && document.getElementById('dept-btn-confirmer-tirage')
            && document.getElementById('dept-roulette-display')
        );
    }

    function ouvrirModalDepartage(groupe) {
        if (departageModalOuvert) return;
        if (!domModalDepartagePret()) {
            window.addEventListener('DOMContentLoaded', () => ouvrirModalDepartage(groupe), { once: true });
            return;
        }
        departageModalOuvert = true;
        departageGroupeEnCours = groupe;
        tirageTempResult = null;

        document.getElementById('dept-desc').textContent =
            `Ces ${groupe.length} joueurs sont à égalité parfaite. Un tirage au sort automatique va déterminer le vainqueur.`;
        document.getElementById('dept-joueurs-list').innerHTML =
            groupe.map(j => `<span class="dept-joueur-chip">${texteSecurise(j)}</span>`).join('');

        const confirmerBtn = document.getElementById('dept-btn-confirmer-tirage');
        if (confirmerBtn) confirmerBtn.classList.add('hidden');

        const r = document.getElementById('dept-roulette-display');
        if (r) { r.textContent = '—'; r.className = 'dept-roulette-display'; }
        document.getElementById('dept-overlay').classList.remove('hidden');

        // Lancement automatique du tirage au sort après un très court délai de courtoisie
        setTimeout(() => {
            if (departageGroupeEnCours) lancerTirageAnimation(departageGroupeEnCours);
        }, 800);
    }

    function fermerModalDepartage() {
        departageModalOuvert = false;
        departageGroupeEnCours = null;
        tirageTempResult = null;
        document.getElementById('dept-overlay').classList.add('hidden');
    }

    function enregistrerVainqueurDepartage(vainqueur) {
        if (!departageGroupeEnCours) return;
        storerDepartageGroupe(departageGroupeEnCours, vainqueur);
        fermerModalDepartage();
        renderTournoi();
    }
    window.enregistrerVainqueurDepartage = enregistrerVainqueurDepartage;

    function lancerTirageAnimation(joueurs) {
        const roulette = document.getElementById('dept-roulette-display');
        const confirmerBtn = document.getElementById('dept-btn-confirmer-tirage');
        if (!roulette || !joueurs.length) return;

        const vainqueur = joueurs[Math.floor(Math.random() * joueurs.length)];
        tirageTempResult = vainqueur;

        if (confirmerBtn) confirmerBtn.classList.add('hidden');
        roulette.className = 'dept-roulette-display spinning';

        const totalSteps = 38;
        const seq = [];
        for (let r = 0; r < totalSteps - 1; r++) seq.push(joueurs[r % joueurs.length]);
        seq.push(vainqueur); // le dernier est toujours le vainqueur

        let step = 0;
        function suivant() {
            if (step >= seq.length) {
                roulette.textContent = '🏆 ' + vainqueur;
                roulette.className = 'dept-roulette-display winner-glow';
                if (confirmerBtn) confirmerBtn.classList.remove('hidden');
                return;
            }
            roulette.textContent = seq[step];
            step++;
            const progress = step / seq.length;
            setTimeout(suivant, 55 + Math.pow(progress, 2) * 520);
        }
        suivant();
    }

    function initModalDepartage() {
        if (departageModalInitialise) return;

        const btnConfirmer = document.getElementById('dept-btn-confirmer-tirage');
        const btnFermer = document.getElementById('dept-btn-fermer');

        // Le modal est défini après le script; on attend le DOM complet.
        if (!btnConfirmer || !btnFermer) return;

        departageModalInitialise = true;

        btnConfirmer.addEventListener('click', () => {
            if (tirageTempResult) enregistrerVainqueurDepartage(tirageTempResult);
        });
        btnFermer.addEventListener('click', fermerModalDepartage);
    }

    // Fonction: getNextMatchId - rôle métier documenté pour faciliter la maintenance.
    function getNextMatchId() {
        if (!tournoiActuel || !tournoiActuel.matches.length) return 1;
        return Math.max(...tournoiActuel.matches.map(m => m.id)) + 1;
    }

    // Fonction: getNextTieBreakRound - rôle métier documenté pour faciliter la maintenance.
    function getNextTieBreakRound() {
        if (!tournoiActuel || !tournoiActuel.matches.length) return 1;
        return Math.max(...tournoiActuel.matches.map(m => Number.parseInt(m.round, 10) || 0)) + 1;
    }

    // Fonction: getMatchTournoiById - comparaison tolérante string/number pour supporter tous les types d'ID.
    function getMatchTournoiById(matchId) {
        if (!tournoiActuel) return null;
        return tournoiActuel.matches.find(m => String(m.id) === String(matchId)) || null;
    }

    // Fonction: formatRoundLabel - rôle métier documenté pour faciliter la maintenance.
    function formatRoundLabel(match) {
        return match.matchType === 'tiebreak' ? 'TB' : `Round ${match.round}`;
    }

    // Fonction: getScoresRapidesPourMatch - rôle métier documenté pour faciliter la maintenance.
    function getScoresRapidesPourMatch(match, settings) {
        if (match.matchType === 'tiebreak') {
            return [[1, 0], [2, 1], [0, 1], [1, 2]];
        }
        return genererScoresRapides(settings, match.playerA, match.playerB);
    }

    // Fonction: marquerScoreEnAttenteValidation - rôle métier documenté pour faciliter la maintenance.
    function marquerScoreEnAttenteValidation(matchId, scope = 'cartesien') {
        const prefix = scope === 'final' ? 'final-match-card-' : 'match-card-';
        const card = document.getElementById(`${prefix}${matchId}`);
        if (!card) return;
        if (card) card.classList.add('pending-score');
    }

    window.marquerScoreEnAttenteValidation = marquerScoreEnAttenteValidation;

    // Fonction: getScoresRapidesTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function getScoresRapidesTableauFinal(settings) {
        const base = genererScoresRapides(settings);

        if (settings?.condition !== 'total') return base;

        const n = Number.parseInt(settings.nombre, 10);
        if (!Number.isInteger(n) || n <= 0 || n % 2 !== 0) {
            return base;
        }

        const egalite = n / 2;
        const extra = [
            [egalite + 1, egalite],
            [egalite, egalite + 1]
        ];

        extra.forEach(([a, b]) => {
            if (!base.some(([x, y]) => x === a && y === b)) {
                base.push([a, b]);
            }
        });

        return base;
    }

    // Fonction: getPhaseFinale - rôle métier documenté pour faciliter la maintenance.
    function getPhaseFinale() {
        return tournoiActuel?.phaseFinale || null;
    }

    // Fonction: getRegleRoundFinal - rôle métier documenté pour faciliter la maintenance.
    function getRegleRoundFinal(round) {
        const phaseFinale = getPhaseFinale();
        return phaseFinale?.reglesParTour?.[round] || tournoiActuel?.settings || { condition: 'total', nombre: 1 };
    }

    // ===== 5) Tableau final (phase knockout) =====
    // Fonction: initialiserTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function initialiserTableauFinal(sortants, reglesParTour, avecPetiteFinale) {
        if (!tournoiActuel || !Array.isArray(sortants) || sortants.length < 2) return null;

        const tailleBracket = puissanceDeuxSuperieureOuEgale(sortants.length);
        const totalTours = Math.log2(tailleBracket);
        const nbByes = tailleBracket - sortants.length;
        
        let finalSortants = [...sortants];
        
        // Si des joueurs doivent être exemptés (BYE), on force les meilleurs classés à prendre ces places
        if (nbByes > 0 && sortantsConnusPourFinale && sortantsConnusPourFinale.length === sortants.length) {
            const joueursPrivilegies = sortantsConnusPourFinale.slice(0, nbByes);
            finalSortants = finalSortants.filter(j => !joueursPrivilegies.includes(j));
            finalSortants = [...joueursPrivilegies, ...finalSortants];
        }
        
        let seedOrder = [1, 2];
        for (let currentSize = 2; currentSize < tailleBracket; currentSize *= 2) {
            let nextMatches = [];
            for (let i = 0; i < seedOrder.length; i++) {
                nextMatches.push(seedOrder[i]);
                nextMatches.push(2 * currentSize + 1 - seedOrder[i]);
            }
            seedOrder = nextMatches;
        }
        
        const slots = [];
        for (let i = 0; i < tailleBracket; i++) {
            const seedIndex = seedOrder[i] - 1;
            slots.push(finalSortants[seedIndex] || null);
        }

        let idSeq = 1;
        const rounds = [];

        for (let r = 1; r <= totalTours; r++) {
            const nbMatchs = tailleBracket / Math.pow(2, r);
            const liste = [];
            for (let i = 0; i < nbMatchs; i++) {
                liste.push({
                    id: idSeq++,
                    round: r,
                    label: getLibelleTourFinal(r, totalTours, tailleBracket / Math.pow(2, r - 1)),
                    status: 'waiting',
                    table: null,
                    playerA: null,
                    playerB: null,
                    scoreA: null,
                    scoreB: null,
                    winner: null,
                    nextMatchId: null,
                    nextSlot: null
                });
            }
            rounds.push(liste);
        }

        rounds[0].forEach((m, i) => {
            m.playerA = slots[i * 2] || null;
            m.playerB = slots[(i * 2) + 1] || null;
        });

        for (let r = 1; r < rounds.length; r++) {
            const prev = rounds[r - 1];
            const curr = rounds[r];
            prev.forEach((m, i) => {
                const next = curr[Math.floor(i / 2)];
                if (!next) return;
                m.nextMatchId = next.id;
                m.nextSlot = i % 2 === 0 ? 'A' : 'B';
            });
        }

        const matches = rounds.flat();
        let petiteFinaleMatchId = null;

        if (avecPetiteFinale && totalTours > 1) {
            petiteFinaleMatchId = idSeq++;
            matches.push({
                id: petiteFinaleMatchId,
                round: totalTours,
                label: 'Petite Finale (3ème place)',
                matchType: 'petite_finale',
                status: 'waiting',
                table: null,
                playerA: null,
                playerB: null,
                scoreA: null,
                scoreB: null,
                winner: null,
                nextMatchId: null,
                nextSlot: null
            });

            const semiFinals = matches.filter(m => m.round === totalTours - 1);
            if (semiFinals.length === 2) {
                semiFinals[0].petiteFinaleMatchId = petiteFinaleMatchId;
                semiFinals[0].petiteFinaleSlot = 'A';
                semiFinals[1].petiteFinaleMatchId = petiteFinaleMatchId;
                semiFinals[1].petiteFinaleSlot = 'B';
            }
        }

        const phaseFinale = {
            qualifies: [...sortants],
            tailleBracket,
            totalTours,
            avecPetiteFinale,
            reglesParTour,
            matches,
            startedAt: new Date().toISOString(),
            winner: null
        };

        tournoiActuel.phaseFinale = phaseFinale;
        propagerGagnantsTableauFinal();
        lancerMatchsTableauFinalAutomatiquement();
        return phaseFinale;
    }

    // Fonction: getMatchFinalById - rôle métier documenté pour faciliter la maintenance.
    function getMatchFinalById(id) {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) return null;
        return phaseFinale.matches.find(m => m.id === id) || null;
    }

    // Fonction: marquerVictoireParForfaitFinal - rôle métier documenté pour faciliter la maintenance.
    function marquerVictoireParForfaitFinal(match, winnerName) {
        if (!match || !winnerName) return;
        match.status = 'finished';
        match.winner = winnerName;
        match.scoreA = winnerName === match.playerA ? 1 : 0;
        match.scoreB = winnerName === match.playerB ? 1 : 0;
        match.table = null;
    }

    // Fonction: getMatchsAmontTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function getMatchsAmontTableauFinal(matchId) {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) return [];
        return phaseFinale.matches.filter(m => m.nextMatchId === matchId || m.petiteFinaleMatchId === matchId);
    }

    // Fonction: peutAppliquerForfaitAuto - rôle métier documenté pour faciliter la maintenance.
    function peutAppliquerForfaitAuto(match) {
        if (!match || match.status !== 'waiting') return false;
        const unSeulJoueur = (match.playerA && !match.playerB) || (!match.playerA && match.playerB);
        if (!unSeulJoueur) return false;

        const amont = getMatchsAmontTableauFinal(match.id);
        // Forfait auto autorisé uniquement sur un match d'entrée de tableau (BYE initial).
        if (!amont.length) return true;

        // Si ce match dépend d'autres matchs, on attend explicitement leurs résultats.
        return false;
    }

    // Fonction: propagerGagnantsTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function propagerGagnantsTableauFinal() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) return;

        let changed = true;
        let guard = 0;

        while (changed && guard < 1000) {
            changed = false;
            guard += 1;

            phaseFinale.matches.forEach(m => {
                if (m.status === 'in_progress' && (!m.playerA || !m.playerB)) {
                    m.status = 'waiting';
                    m.table = null;
                    changed = true;
                }

                if (peutAppliquerForfaitAuto(m)) {
                    const gagnantForfait = m.playerA || m.playerB;
                    marquerVictoireParForfaitFinal(m, gagnantForfait);
                    changed = true;
                }

                if (m.status === 'finished' && m.winner) {
                    if (m.nextMatchId) {
                        const next = getMatchFinalById(m.nextMatchId);
                        if (!next) return;
                        const cle = m.nextSlot === 'A' ? 'playerA' : 'playerB';
                        if (next[cle] !== m.winner) {
                            next[cle] = m.winner;
                            changed = true;
                        }

                        if (next.status === 'finished' && next.winner && next.winner !== next.playerA && next.winner !== next.playerB) {
                            next.status = 'waiting';
                            next.winner = null;
                            next.scoreA = null;
                            next.scoreB = null;
                            next.table = null;
                            changed = true;
                        }
                    }

                    if (m.petiteFinaleMatchId) {
                        const pfMatch = getMatchFinalById(m.petiteFinaleMatchId);
                        if (!pfMatch) return;
                        const loser = m.winner === m.playerA ? m.playerB : m.playerA;
                        const cle = m.petiteFinaleSlot === 'A' ? 'playerA' : 'playerB';
                        if (pfMatch[cle] !== loser) {
                            pfMatch[cle] = loser;
                            changed = true;
                        }

                        if (pfMatch.status === 'finished' && pfMatch.winner && pfMatch.winner !== pfMatch.playerA && pfMatch.winner !== pfMatch.playerB) {
                            pfMatch.status = 'waiting';
                            pfMatch.winner = null;
                            pfMatch.scoreA = null;
                            pfMatch.scoreB = null;
                            pfMatch.table = null;
                            changed = true;
                        }
                    }
                }
            });
        }

        const finale = phaseFinale.matches.find(m => m.round === phaseFinale.totalTours && m.matchType !== 'petite_finale');
        phaseFinale.winner = finale?.status === 'finished' ? (finale.winner || null) : null;
    }

    // Fonction: getJoueursFinalEnCours - rôle métier documenté pour faciliter la maintenance.
    function getJoueursFinalEnCours() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) return new Set();
        const set = new Set();
        phaseFinale.matches
            .filter(m => m.status === 'in_progress')
            .forEach(m => {
                if (m.playerA) set.add(m.playerA);
                if (m.playerB) set.add(m.playerB);
            });
        return set;
    }

    // Fonction: lancerMatchsTableauFinalAutomatiquement - rôle métier documenté pour faciliter la maintenance.
    function lancerMatchsTableauFinalAutomatiquement() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale || phaseFinale.winner) return;

        const libres = [];
        const prises = phaseFinale.matches.filter(m => m.status === 'in_progress' && Number.isInteger(m.table)).map(m => m.table);
        for (let t = 1; t <= MAX_BILLARDS; t++) {
            if (!prises.includes(t)) libres.push(t);
        }
        if (!libres.length) return;

        const waitingPlayable = phaseFinale.matches
            .filter(m => m.status === 'waiting' && m.playerA && m.playerB)
            .sort((a, b) => (a.round - b.round) || (a.id - b.id));

        if (!waitingPlayable.length) return;

        const roundCible = waitingPlayable[0].round;
        const candidats = waitingPlayable.filter(m => m.round === roundCible);
        const occupes = getJoueursFinalEnCours();

        libres.forEach(tableNum => {
            const index = candidats.findIndex(m => !occupes.has(m.playerA) && !occupes.has(m.playerB));
            if (index < 0) return;
            const m = candidats.splice(index, 1)[0];
            m.status = 'in_progress';
            m.table = tableNum;
            occupes.add(m.playerA);
            occupes.add(m.playerB);
        });
    }

    // Fonction: normaliserEtValiderScoreTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function normaliserEtValiderScoreTableauFinal(match, scoreA, scoreB) {
        if (!match) return null;

        if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
            alert('Score invalide for le tableau final. Utilise des entiers positifs.');
            return null;
        }

        const regle = getRegleRoundFinal(match.round);
        const n = Number.parseInt(regle?.nombre, 10);
        const estTotalPair = regle?.condition === 'total' && Number.isInteger(n) && n > 0 && n % 2 === 0;

        // Si égalité possible sur n manches (n pair), proposer la manche décisive.
        if (estTotalPair && scoreA === scoreB && (scoreA + scoreB === n)) {
            const choix = prompt(
                `Égalité ${scoreA}-${scoreB} sur ${n} manches (${match.label}).\n` +
                'Qui gagne la manche décisive ?\n' +
                `1 = ${match.playerA}\n2 = ${match.playerB}`
            );

            if (choix === null) return null;
            const val = String(choix).trim();
            if (val === '1') scoreA += 1;
            else if (val === '2') scoreB += 1;
            else {
                alert('Choix invalide. Tape 1 ou 2 for la manche décisive.');
                return null;
            }
        }

        if (scoreA === scoreB) {
            alert('En tableau final, le score nul est interdit.');
            return null;
        }

        const estScoreDecisiveTotal = estTotalPair
            && (scoreA + scoreB === n + 1)
            && (
                (scoreA === (n / 2) + 1 && scoreB === (n / 2))
                ||
                (scoreB === (n / 2) + 1 && scoreA === (n / 2))
            );

        const erreur = estScoreDecisiveTotal ? null : validerScoreSelonRegle(scoreA, scoreB, regle, match.playerA, match.playerB);
        if (erreur) {
            alert(`${match.label} : ${erreur}`);
            return null;
        }

        return { scoreA, scoreB };
    }

    // Fonction: appliquerResultatTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function appliquerResultatTableauFinal(match, scoreA, scoreB) {
        match.status = 'finished';
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        const roundConfig = tournoiActuel?.finalSettings?.[match.round] || { condition: 'total', nombre: 1 };
        const pseudoSettings = { ...tournoiActuel?.settings, condition: roundConfig.condition, nombre: roundConfig.nombre };

        if (pseudoSettings.condition === 'gagnantes') {
            const { objectifA, objectifB } = getObjectifsPourMatch(pseudoSettings, match.playerA, match.playerB);
            if (scoreA === objectifA && scoreB < objectifB) match.winner = match.playerA;
            else if (scoreB === objectifB && scoreA < objectifA) match.winner = match.playerB;
            else match.winner = scoreA > scoreB ? match.playerA : match.playerB;
        } else {
            match.winner = scoreA > scoreB ? match.playerA : match.playerB;
        }
        match.table = null;

        propagerGagnantsTableauFinal();
        lancerMatchsTableauFinalAutomatiquement();
        renderTableauFinal();
    }

    // Fonction: reinitialiserBrancheAvalTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function reinitialiserBrancheAvalTableauFinal(matchId) {
        let courant = getMatchFinalById(matchId);
        while (courant) {
            courant.status = 'waiting';
            courant.table = null;
            courant.playerA = null;
            courant.playerB = null;
            courant.scoreA = null;
            courant.scoreB = null;
            courant.winner = null;
            courant = courant.nextMatchId ? getMatchFinalById(courant.nextMatchId) : null;
        }
    }

    // Fonction: terminerMatchTableauFinal - rôle métier documenté pour faciliter la maintenance.
    function terminerMatchTableauFinal(matchId, scoreA, scoreB) {
        const phaseFinale = getPhaseFinale();
        const match = getMatchFinalById(matchId);
        if (!phaseFinale || !match) return;

        // Autorise 'in_progress' ou 'waiting' (si on veut enregistrer un match en file)
        if (match.status !== 'in_progress' && match.status !== 'waiting') return;

        const scoreValide = normaliserEtValiderScoreTableauFinal(match, scoreA, scoreB);
        if (!scoreValide) return;

        appliquerResultatTableauFinal(match, scoreValide.scoreA, scoreValide.scoreB);
    }

    // Fonction: validerScoreMatchFinal - rôle métier documenté pour faciliter la maintenance.
    function validerScoreMatchFinal(matchId) {
        const scoreAEl = document.getElementById(`final-score-a-${matchId}`);
        const scoreBEl = document.getElementById(`final-score-b-${matchId}`);
        const scoreA = Number.parseInt(scoreAEl?.value ?? '', 10);
        const scoreB = Number.parseInt(scoreBEl?.value ?? '', 10);
        terminerMatchTableauFinal(matchId, scoreA, scoreB);
    }

    // Fonction: presetScoreMatchFinal - rôle métier documenté pour faciliter la maintenance.
    function presetScoreMatchFinal(matchId, scoreA, scoreB) {
        const scoreAEl = document.getElementById(`final-score-a-${matchId}`);
        const scoreBEl = document.getElementById(`final-score-b-${matchId}`);
        if (!scoreAEl || !scoreBEl) return;
        scoreAEl.value = String(scoreA);
        scoreBEl.value = String(scoreB);
        marquerScoreEnAttenteValidation(matchId, 'final');
    }

    // Fonction: modifierScoreMatchFinal - rôle métier documenté pour faciliter la maintenance.
    function modifierScoreMatchFinal(matchId) {
        const phaseFinale = getPhaseFinale();
        const match = getMatchFinalById(matchId);
        if (!phaseFinale || !match || match.status !== 'finished') return;

        const valeur = prompt(
            `Nouveau score pour ${match.playerA} vs ${match.playerB} (format A-B)`,
            `${match.scoreA}-${match.scoreB}`
        );
        if (valeur === null) return;

        const propre = String(valeur).trim().replace(':', '-').replaceAll(' ', '');
        const morceaux = propre.split('-');
        if (morceaux.length !== 2) {
            alert('Format invalide. Utilise le format A-B (ex: 2-1).');
            return;
        }

        const scoreA = Number.parseInt(morceaux[0], 10);
        const scoreB = Number.parseInt(morceaux[1], 10);
        const scoreValide = normaliserEtValiderScoreTableauFinal(match, scoreA, scoreB);
        if (!scoreValide) return;

        if (match.nextMatchId) {
            const ok = confirm('Modifier ce résultat va réinitialiser les matchs suivants de cette branche. Continuer ?');
            if (!ok) return;
            reinitialiserBrancheAvalTableauFinal(match.nextMatchId);
        }

        appliquerResultatTableauFinal(match, scoreValide.scoreA, scoreValide.scoreB);
    }

    function enregistrerMatchFinalAttente(matchId) {
        const phaseFinale = getPhaseFinale();
        const match = getMatchFinalById(matchId);
        if (!phaseFinale || !match || match.status !== 'waiting') return;

        if (!match.playerA || !match.playerB) {
            alert("Impossible d'enregistrer un match dont les joueurs ne sont pas encore définis.");
            return;
        }

        const valeur = prompt(`Enregistrer le score pour ${match.playerA} vs ${match.playerB} (format A-B) :`, "");
        if (valeur === null) return;

        const propre = String(valeur).trim().replace(':', '-').replaceAll(' ', '');
        const morceaux = propre.split('-');
        if (morceaux.length !== 2) {
            alert('Format invalide. Utilise le format A-B (ex: 2-1).');
            return;
        }

        const scoreA = Number.parseInt(morceaux[0], 10);
        const scoreB = Number.parseInt(morceaux[1], 10);
        terminerMatchTableauFinal(matchId, scoreA, scoreB);
    }

    window.validerScoreMatchFinal = validerScoreMatchFinal;
    window.presetScoreMatchFinal = presetScoreMatchFinal;
    window.modifierScoreMatchFinal = modifierScoreMatchFinal;
    window.enregistrerMatchFinalAttente = enregistrerMatchFinalAttente;

    // ===== 4) Qualification & transition vers phase finale =====
    // Fonction: getNombreSortants - rôle métier documenté pour faciliter la maintenance.
    function getNombreSortants() {
        if (!tournoiActuel) return 0;
        const brut = Number.parseInt(tournoiActuel.settings?.sortantsPoules, 10);
        const borne = Number.isInteger(brut) && brut > 0 ? brut : 1;
        return Math.min(borne, tournoiActuel.players.length);
    }

    // Fonction: getContexteImportanceMatch - rôle métier documenté pour faciliter la maintenance.
    function getContexteImportanceMatch(enAttenteCount) {
        const etat = getEtatQualification();
        const nbSortants = etat.nbSortants || 1;
        const cutoffPts = etat.classement[Math.max(0, nbSortants - 1)]?.pts ?? 0;
        const guaranteedSet = new Set(etat.sortantsGarantis);
        const stats = etat.stats || {};
        const rangParJoueur = Object.fromEntries(
            etat.classement.map((ligne, index) => [ligne.joueur, index + 1])
        );
        const eliminesSet = new Set(
            Object.values(stats)
                .filter(s => !guaranteedSet.has(s.joueur) && s.maxPts < cutoffPts)
                .map(s => s.joueur)
        );

        return {
            stats,
            cutoffPts,
            guaranteedSet,
            eliminesSet,
            rangParJoueur,
            nbSortants,
            sortantsConnus: etat.sortantsConnus,
            maxPointsParMatch: getMaximumPointsParMatch(tournoiActuel?.settings),
            estDernierePhase: enAttenteCount <= Math.max(4, (tournoiActuel?.players?.length || 0))
        };
    }

    // Fonction: calculerImportanceMatch - rôle métier documenté pour faciliter la maintenance.
    function calculerImportanceMatch(match, contexte) {
        const a = contexte.stats[match.playerA] || { pts: 0, maxPts: 0 };
        const b = contexte.stats[match.playerB] || { pts: 0, maxPts: 0 };

        const aGaranti = contexte.guaranteedSet.has(match.playerA);
        const bGaranti = contexte.guaranteedSet.has(match.playerB);
        const aElimine = contexte.eliminesSet.has(match.playerA);
        const bElimine = contexte.eliminesSet.has(match.playerB);

        const aImpact = !aGaranti && !aElimine;
        const bImpact = !bGaranti && !bElimine;

        let importance = 0;

        if (aImpact && bImpact) importance += 8;
        else if (aImpact || bImpact) importance += 4;

        const zone = Math.max(1, contexte.maxPointsParMatch);
        if (Math.abs(a.pts - contexte.cutoffPts) <= zone) importance += 2;
        if (Math.abs(b.pts - contexte.cutoffPts) <= zone) importance += 2;

        if ((aGaranti && bGaranti) || (aElimine && bElimine)) importance -= 8;
        if ((aGaranti && bElimine) || (bGaranti && aElimine)) importance -= 6;

        if (contexte.estDernierePhase) {
            importance += 3;
        }

        return importance;
    }

    // Fonction: estMatchDecisifQualification - rôle métier documenté pour faciliter la maintenance.
    function estMatchDecisifQualification(match, contexte) {
        if (!contexte) return false;

        // Si les sortants sont déjà connus, aucun match n'est décisif for cette phase.
        if ((contexte.sortantsConnus?.length || 0) >= (contexte.nbSortants || 0)) return false;

        // On ne tague qu'en fin de phase, quand la qualification se joue réellement.
        if (!contexte.estDernierePhase) return false;

        const a = match.playerA;
        const b = match.playerB;

        const aGaranti = contexte.guaranteedSet.has(a);
        const bGaranti = contexte.guaranteedSet.has(b);
        const aElimine = contexte.eliminesSet.has(a);
        const bElimine = contexte.eliminesSet.has(b);

        // Un match entre 2 joueurs déjà fixés (qualifiés ou éliminés) n'est pas décisif.
        if ((aGaranti || aElimine) && (bGaranti || bElimine)) return false;

        // Match décisif uniquement si au moins un des deux est autour de la bulle.
        const rangA = contexte.rangParJoueur[a] ?? 999;
        const rangB = contexte.rangParJoueur[b] ?? 999;
        const zoneBulleMin = Math.max(1, (contexte.nbSortants || 1) - 1);
        const zoneBulleMax = (contexte.nbSortants || 1) + 1;
        const aDansBulle = rangA >= zoneBulleMin && rangA <= zoneBulleMax;
        const bDansBulle = rangB >= zoneBulleMin && rangB <= zoneBulleMax;

        if (!(aDansBulle || bDansBulle)) return false;

        // Dernier filtre: importance suffisamment forte selon le moteur.
        return calculerImportanceMatch(match, contexte) >= 10;
    }

    // Fonction: choisirMeilleurMatch - rôle métier documenté pour faciliter la maintenance.
    function choisirMeilleurMatch(candidats, compteur, joueursOccupes, contexte) {
        const filtres = candidats.filter(m => !joueursOccupes.has(m.playerA) && !joueursOccupes.has(m.playerB));
        if (!filtres.length) return null;

        filtres.sort((a, b) => {
            const aA = compteur[a.playerA] ?? 0;
            const aB = compteur[a.playerB] ?? 0;
            const bA = compteur[b.playerA] ?? 0;
            const bB = compteur[b.playerB] ?? 0;

            const aMax = Math.max(aA, aB);
            const bMax = Math.max(bA, bB);
            if (aMax !== bMax) return aMax - bMax;

            const aMin = Math.min(aA, aB);
            const bMin = Math.min(bA, bB);
            if (aMin !== bMin) return aMin - bMin;

            const impA = calculerImportanceMatch(a, contexte);
            const impB = calculerImportanceMatch(b, contexte);
            if (impA !== impB) return impB - impA;

            const aDelta = Math.abs(aA - aB);
            const bDelta = Math.abs(bA - bB);
            if (aDelta !== bDelta) return aDelta - bDelta;

            if (a.round !== b.round) return a.round - b.round;
            return Math.random() - 0.5;
        });

        return filtres[0];
    }

    // Fonction: estMatchReporteEnPause - rôle métier documenté pour faciliter la maintenance.
    function estMatchReporteEnPause(match) {
        if (!match || match.status !== 'waiting') return false;
        const reactiverApres = Number.parseInt(match.reactivationApresFin ?? '', 10);
        if (!Number.isInteger(reactiverApres)) return false;
        const fins = Number.isInteger(tournoiActuel?.completedMatchCount) ? tournoiActuel.completedMatchCount : 0;
        return fins < reactiverApres;
    }

    // Fonction: choisirMatchRepoussePrioritaire - rôle métier documenté pour faciliter la maintenance.
    function choisirMatchRepoussePrioritaire(enAttente, joueursOccupes) {
        const prioritaires = enAttente
            .filter(m => m.prioriteReport)
            .sort((a, b) => (a.reportOrder ?? Number.MAX_SAFE_INTEGER) - (b.reportOrder ?? Number.MAX_SAFE_INTEGER));

        return prioritaires.find(m => !joueursOccupes.has(m.playerA) && !joueursOccupes.has(m.playerB)) || null;
    }

    // Fonction: lancerMatchsAutomatiquement - rôle métier documenté pour faciliter la maintenance.
    function lancerMatchsAutomatiquement() {
        if (!tournoiActuel) return;
        const libres = obtenirTablesLibres();
        if (!libres.length) return;

        let enAttente = tournoiActuel.matches
            .filter(m => m.status === 'waiting' && !estMatchReporteEnPause(m))
            .sort((a, b) => (a.round - b.round) || (a.id - b.id));

        // Si le Cartésien est en pause, on autorise quand même les manches décisives.
        if (tournoiActuel.type === 'cartesien' && !continuerCartesien) {
            enAttente = enAttente.filter(m => m.matchType === 'tiebreak');
        }

        if (!enAttente.length) return;

        const joueursOccupes = getJoueursEnCours();
        const compteur = getCompteurMatchsEngages();

        libres.forEach((tableNum) => {
            const contexte = getContexteImportanceMatch(enAttente.length);
            const prioritaire = choisirMatchRepoussePrioritaire(enAttente, joueursOccupes);
            const m = prioritaire || choisirMeilleurMatch(enAttente, compteur, joueursOccupes, contexte);
            if (!m) return;

            m.status = 'in_progress';
            m.table = tableNum;
            m.prioriteReport = false;
            m.reactivationApresFin = null;

            joueursOccupes.add(m.playerA);
            joueursOccupes.add(m.playerB);
            compteur[m.playerA] = (compteur[m.playerA] || 0) + 1;
            compteur[m.playerB] = (compteur[m.playerB] || 0) + 1;

            const idx = enAttente.findIndex(x => x.id === m.id);
            if (idx >= 0) enAttente.splice(idx, 1);
        });
    }

    // Fonction: terminerMatch - rôle métier documenté pour faciliter la maintenance.
    function terminerMatch(matchId, scoreA, scoreB) {
        if (!tournoiActuel) return;
        const match = getMatchTournoiById(matchId);
        if (!match) return;

        // Autorise 'in_progress' ou 'waiting' (si on veut enregistrer un match en file)
        if (match.status !== 'in_progress' && match.status !== 'waiting') return;

        if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
            alert('Score invalide. Utilise des nombres entiers positifs (ex: 2-1, 1-1).');
            return;
        }

        if (match.matchType === 'tiebreak') {
            if (scoreA === scoreB) {
                alert('Manche décisive: le score nul est interdit.');
                return;
            }
        } else {
            const erreurRegle = validerScoreSelonRegle(scoreA, scoreB, tournoiActuel.settings, match.playerA, match.playerB);
            if (erreurRegle) {
                alert(erreurRegle);
                return;
            }
        }

        match.status = 'finished';
        match.scoreA = scoreA;
        match.scoreB = scoreB;
        if (match.matchType === 'tiebreak') {
            match.winner = scoreA > scoreB ? match.playerA : (scoreB > scoreA ? match.playerB : null);
        } else {
            const regle = tournoiActuel?.settings;
            if (regle && regle.condition === 'gagnantes') {
                const { objectifA, objectifB } = getObjectifsPourMatch(regle, match.playerA, match.playerB);
                if (scoreA === objectifA && scoreB < objectifB) match.winner = match.playerA;
                else if (scoreB === objectifB && scoreA < objectifA) match.winner = match.playerB;
                else match.winner = 'draw';
            } else {
                match.winner = scoreA > scoreB ? match.playerA : (scoreB > scoreA ? match.playerB : 'draw');
            }
        }
        match.finishedAt = new Date().toISOString();
        match.table = null;
        tournoiActuel.completedMatchCount = (tournoiActuel.completedMatchCount || 0) + 1;

        if (match.matchType !== 'tiebreak') {
            invaliderDepartageGroupes();
        }

        if (match.matchType === 'tiebreak' && match.winner) {
            if (!tournoiActuel.tieBreakWinners) tournoiActuel.tieBreakWinners = {};
            tournoiActuel.tieBreakWinners[getTieBreakPairKey(match.playerA, match.playerB)] = match.winner;
        }

        verifierSortantsConnusEtDemanderSuite();
        lancerMatchsAutomatiquement();
        renderTournoi();
    }

    // Fonction: repousserMatch - rôle métier documenté pour faciliter la maintenance.
    function repousserMatch(matchId) {
        if (!tournoiActuel) return;
        const match = getMatchTournoiById(matchId);
        if (!match || match.status !== 'in_progress') return;

        const ok = confirm(`Repousser le match ${match.playerA} vs ${match.playerB} ?\nIl redeviendra prioritaire après la prochaine fin de match.`);
        if (!ok) return;

        const finsActuelles = Number.isInteger(tournoiActuel.completedMatchCount) ? tournoiActuel.completedMatchCount : 0;
        tournoiActuel.postponedSequence = (tournoiActuel.postponedSequence || 0) + 1;

        match.status = 'waiting';
        match.table = null;
        match.prioriteReport = true;
        match.reportOrder = tournoiActuel.postponedSequence;
        match.reactivationApresFin = finsActuelles + 1;

        lancerMatchsAutomatiquement();

        const nbEnCours = tournoiActuel.matches.filter(m => m.status === 'in_progress').length;
        if (nbEnCours === 0) {
            // Sécurité anti-blocage: si aucun match ne tourne, on réactive immédiatement.
            match.reactivationApresFin = finsActuelles;
            lancerMatchsAutomatiquement();
        }

        renderTournoi();
    }

    // Fonction: validerScoreMatch - rôle métier documenté pour faciliter la maintenance.
    function validerScoreMatch(matchId) {
        if (!tournoiActuel) return;
        const match = getMatchTournoiById(matchId);
        if (!match) return;

        const scoreAEl = document.getElementById(`score-a-${matchId}`);
        const scoreBEl = document.getElementById(`score-b-${matchId}`);
        const scoreA = Number.parseInt(scoreAEl?.value ?? '', 10);
        const scoreB = Number.parseInt(scoreBEl?.value ?? '', 10);
        terminerMatch(matchId, scoreA, scoreB);
    }

    // Fonction: presetScoreMatch - rôle métier documenté pour faciliter la maintenance.
    function presetScoreMatch(matchId, scoreA, scoreB) {
        const scoreAEl = document.getElementById(`score-a-${matchId}`);
        const scoreBEl = document.getElementById(`score-b-${matchId}`);
        if (!scoreAEl || !scoreBEl) return;
        scoreAEl.value = String(scoreA);
        scoreBEl.value = String(scoreB);
        marquerScoreEnAttenteValidation(matchId, 'cartesien');
    }

    function enregistrerMatchAttente(matchId) {
        if (!tournoiActuel) return;
        const match = getMatchTournoiById(matchId);
        if (!match || match.status !== 'waiting') return;

        const valeur = prompt(`Enregistrer le score pour ${match.playerA} vs ${match.playerB} (format A-B) :`, "");
        if (valeur === null) return;

        const propre = String(valeur).trim().replace(':', '-').replaceAll(' ', '');
        const morceaux = propre.split('-');
        if (morceaux.length !== 2) {
            alert('Format invalide. Utilise le format A-B (ex: 2-1).');
            return;
        }

        const scoreA = Number.parseInt(morceaux[0], 10);
        const scoreB = Number.parseInt(morceaux[1], 10);
        terminerMatch(matchId, scoreA, scoreB);
    }

    window.terminerMatch = terminerMatch;
    window.repousserMatch = repousserMatch;
    window.validerScoreMatch = validerScoreMatch;
    window.presetScoreMatch = presetScoreMatch;
    window.enregistrerMatchAttente = enregistrerMatchAttente;

    // Fonction: modifierScoreMatch - rôle métier documenté pour faciliter la maintenance.
    function modifierScoreMatch(matchId) {
        if (!tournoiActuel) return;
        const match = getMatchTournoiById(matchId);
        if (!match || match.status !== 'finished') return;

        const valeur = prompt(
            `Nouveau score for ${match.playerA} vs ${match.playerB} (format A-B)`,
            `${match.scoreA}-${match.scoreB}`
        );
        if (valeur === null) return;

        const propre = String(valeur).trim().replace(':', '-').replace(' ', '');
        const morceaux = propre.split('-');
        if (morceaux.length !== 2) {
            alert('Format invalide. Utilise le format A-B (ex: 2-1).');
            return;
        }

        const scoreA = Number.parseInt(morceaux[0], 10);
        const scoreB = Number.parseInt(morceaux[1], 10);
        if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
            alert('Score invalide. Utilise des entiers positifs.');
            return;
        }

        if (match.matchType === 'tiebreak') {
            if (scoreA === scoreB) {
                alert('Manche décisive: le score nul est interdit.');
                return;
            }
        } else {
            const erreurRegle = validerScoreSelonRegle(scoreA, scoreB, tournoiActuel.settings, match.playerA, match.playerB);
            if (erreurRegle) {
                alert(erreurRegle);
                return;
            }
        }

        match.scoreA = scoreA;
        match.scoreB = scoreB;
        if (match.matchType === 'tiebreak') {
            match.winner = scoreA > scoreB ? match.playerA : (scoreB > scoreA ? match.playerB : null);
        } else {
            const regle = tournoiActuel?.settings;
            if (regle && regle.condition === 'gagnantes') {
                const { objectifA, objectifB } = getObjectifsPourMatch(regle, match.playerA, match.playerB);
                if (scoreA === objectifA && scoreB < objectifB) match.winner = match.playerA;
                else if (scoreB === objectifB && scoreA < objectifA) match.winner = match.playerB;
                else match.winner = 'draw';
            } else {
                match.winner = scoreA > scoreB ? match.playerA : (scoreB > scoreA ? match.playerB : 'draw');
            }
        }

        if (match.matchType === 'tiebreak') {
            if (!tournoiActuel.tieBreakWinners) tournoiActuel.tieBreakWinners = {};
            const key = getTieBreakPairKey(match.playerA, match.playerB);
            if (match.winner) tournoiActuel.tieBreakWinners[key] = match.winner;
            else delete tournoiActuel.tieBreakWinners[key];
        } else {
            invaliderDepartageGroupes();
        }

        renderTournoi();
    }

    window.modifierScoreMatch = modifierScoreMatch;

    // Fonction: construireStatsTournoi - rôle métier documenté for faciliter la maintenance.
    function construireStatsTournoi(playersFilter = null) {
        if (!tournoiActuel) return {};
        const pointsVictoire = Number.isFinite(tournoiActuel.settings?.pointsVictoire) ? tournoiActuel.settings.pointsVictoire : 3;
        const pointsNul = Number.isFinite(tournoiActuel.settings?.pointsNul) ? tournoiActuel.settings.pointsNul : 1;
        const pointsDefaite = Number.isFinite(tournoiActuel.settings?.pointsDefaite) ? tournoiActuel.settings.pointsDefaite : 0;
        const maxPointsParMatch = Math.max(pointsVictoire, pointsNul, pointsDefaite);

        const players = playersFilter || tournoiActuel.players;
        const stats = Object.fromEntries(
            players.map(p => [p, { joueur: p, v: 0, n: 0, d: 0, pts: 0, joues: 0, restants: 0, maxPts: 0, manchesGagnees: 0, manchesJouees: 0 }])
        );

        tournoiActuel.matches
            .filter(m => m.matchType !== 'tiebreak')
            .filter(m => !playersFilter || (playersFilter.includes(m.playerA) && playersFilter.includes(m.playerB)))
            .forEach(m => {
                if (m.status === 'finished' && m.scoreA !== null && m.scoreB !== null) {
                    stats[m.playerA].joues += 1;
                    stats[m.playerB].joues += 1;
                    stats[m.playerA].manchesGagnees += m.scoreA;
                    stats[m.playerA].manchesJouees += m.scoreA + m.scoreB;
                    stats[m.playerB].manchesGagnees += m.scoreB;
                    stats[m.playerB].manchesJouees += m.scoreA + m.scoreB;

                    if (m.winner === 'draw') {
                        stats[m.playerA].n += 1;
                        stats[m.playerB].n += 1;
                        stats[m.playerA].pts += pointsNul;
                        stats[m.playerB].pts += pointsNul;
                    } else if (m.winner === m.playerA || m.winner === m.playerB) {
                        const gagnant = m.winner;
                        const perdant = gagnant === m.playerA ? m.playerB : m.playerA;
                        stats[gagnant].v += 1;
                        stats[gagnant].pts += pointsVictoire;
                        stats[perdant].d += 1;
                        stats[perdant].pts += pointsDefaite;
                    } else {
                        // Compatibilité ascendante pour les vieux matchs sans m.winner
                        if (m.scoreA === m.scoreB) {
                            stats[m.playerA].n += 1;
                            stats[m.playerB].n += 1;
                            stats[m.playerA].pts += pointsNul;
                            stats[m.playerB].pts += pointsNul;
                        } else {
                            const gagnant = m.scoreA > m.scoreB ? m.playerA : m.playerB;
                            const perdant = gagnant === m.playerA ? m.playerB : m.playerA;
                            stats[gagnant].v += 1;
                            stats[gagnant].pts += pointsVictoire;
                            stats[perdant].d += 1;
                            stats[perdant].pts += pointsDefaite;
                        }
                    }
                } else {
                    if (stats[m.playerA]) stats[m.playerA].restants += 1;
                    if (stats[m.playerB]) stats[m.playerB].restants += 1;
                }
            });

        Object.values(stats).forEach(s => {
            s.maxPts = s.pts + (s.restants * maxPointsParMatch);
        });

        return stats;
    }

    // Fonction: getStatsConfrontationDirecte - rôle métier documenté for faciliter la maintenance.
    function getStatsConfrontationDirecte(joueurA, joueurB) {
        if (!tournoiActuel) return null;

        const h2h = {
            winsA: 0,
            winsB: 0,
            draws: 0
        };

        tournoiActuel.matches
            .filter(m => m.matchType !== 'tiebreak' && m.status === 'finished' && m.scoreA !== null && m.scoreB !== null)
            .forEach(m => {
                const concerne =
                    (m.playerA === joueurA && m.playerB === joueurB) ||
                    (m.playerA === joueurB && m.playerB === joueurA);

                if (!concerne) return;

                const scoreJoueurA = m.playerA === joueurA ? m.scoreA : m.scoreB;
                const scoreJoueurB = m.playerA === joueurA ? m.scoreB : m.scoreA;

                if (m.winner === joueurA) h2h.winsA += 1;
                else if (m.winner === joueurB) h2h.winsB += 1;
                else if (m.winner === 'draw') h2h.draws += 1;
                else {
                    // Fallback pour les vieux matchs
                    if (scoreJoueurA > scoreJoueurB) h2h.winsA += 1;
                    else if (scoreJoueurB > scoreJoueurA) h2h.winsB += 1;
                    else h2h.draws += 1;
                }
            });

        return h2h;
    }

    // Fonction: comparerClassement - rôle métier documenté for faciliter la maintenance.
    function peutAppliquerConfrontationDirecte(a, b) {
        if (!tournoiActuel) return false;
        const stats = construireStatsTournoi();
        const joueursMemePoints = Object.values(stats)
            .filter(s => s.pts === a.pts)
            .map(s => s.joueur);
        return joueursMemePoints.length === 2
            && joueursMemePoints.includes(a.joueur)
            && joueursMemePoints.includes(b.joueur);
    }

    function comparerClassement(a, b) {
        if (b.pts !== a.pts) return b.pts - a.pts;

        if (peutAppliquerConfrontationDirecte(a, b)) {
            const h2h = getStatsConfrontationDirecte(a.joueur, b.joueur);
            if (h2h && h2h.winsA !== h2h.winsB) {
                return h2h.winsB - h2h.winsA;
            }
        }

        if (b.v !== a.v) return b.v - a.v;
        if (a.d !== b.d) return a.d - b.d;

        const bilanIdentique = a.v === b.v && a.n === b.n && a.d === b.d;
        if (bilanIdentique) {
            // Ratio manches gagnées / jouées
            if (a.manchesJouees > 0 && b.manchesJouees > 0) {
                const ratioA = a.manchesGagnees / a.manchesJouees;
                const ratioB = b.manchesGagnees / b.manchesJouees;
                if (Math.abs(ratioB - ratioA) > 0.0001) return ratioB - ratioA;
            }

            const tbStats = getStatsTieBreak();
            const aTb = tbStats[a.joueur] || { tbPts: 0, tbV: 0, tbD: 0 };
            const bTb = tbStats[b.joueur] || { tbPts: 0, tbV: 0, tbD: 0 };

            if (bTb.tbPts !== aTb.tbPts) return bTb.tbPts - aTb.tbPts;
            if (bTb.tbV !== aTb.tbV) return bTb.tbV - aTb.tbV;
            if (aTb.tbD !== bTb.tbD) return aTb.tbD - bTb.tbD;

            const winnerTB = getWinnerTieBreak(a.joueur, b.joueur);
            if (winnerTB === a.joueur) return -1;
            if (winnerTB === b.joueur) return 1;

            // Départage manuel enregistré (tirage ou jeu de partage)
            const dg = getDepartageGroupePourPaire(a.joueur, b.joueur);
            if (dg) {
                const posA = dg.ordre.indexOf(a.joueur);
                const posB = dg.ordre.indexOf(b.joueur);
                if (posA !== -1 && posB !== -1 && posA !== posB) return posA - posB;
            }
        }

        return 0; // égalité résiduelle — sera traitée par le modal de départage
    }

    // Fonction: comparerClassementSansTieBreak - rôle métier documenté for faciliter la maintenance.
    function comparerClassementSansTieBreak(a, b) {
        if (b.pts !== a.pts) return b.pts - a.pts;

        if (peutAppliquerConfrontationDirecte(a, b)) {
            const h2h = getStatsConfrontationDirecte(a.joueur, b.joueur);
            if (h2h && h2h.winsA !== h2h.winsB) {
                return h2h.winsB - h2h.winsA;
            }
        }

        if (b.v !== a.v) return b.v - a.v;
        if (a.d !== b.d) return a.d - b.d;

        if ((a.manchesJouees ?? 0) > 0 && (b.manchesJouees ?? 0) > 0) {
            const ratioA = a.manchesGagnees / a.manchesJouees;
            const ratioB = b.manchesGagnees / b.manchesJouees;
            if (Math.abs(ratioB - ratioA) > 0.0001) return ratioB - ratioA;
        }

        return 0;
    }

    // Fonction: appliquerPrioriteConfrontationDirecte - rôle métier documenté for faciliter la maintenance.
    function appliquerPrioriteConfrontationDirecte(classement) {
        if (!Array.isArray(classement) || classement.length < 2) return classement;

        let i = 0;
        while (i < classement.length) {
            const pts = classement[i].pts;
            let j = i + 1;
            while (j < classement.length && classement[j].pts === pts) j += 1;

            // Règle demandée: avantage victoire directe quand exactement 2 joueurs ont le même nb de points.
            if (j - i === 2) {
                const a = classement[i];
                const b = classement[i + 1];
                const h2h = getStatsConfrontationDirecte(a.joueur, b.joueur);
                if (h2h && h2h.winsA !== h2h.winsB && h2h.winsB > h2h.winsA) {
                    classement[i] = b;
                    classement[i + 1] = a;
                }
            }

            i = j;
        }

        return classement;
    }

    // Fonction: getGroupeEgaliteBulle - rôle métier documenté for faciliter la maintenance.
    function getGroupeEgaliteBulle(classement, nbSortants) {
        if (!Array.isArray(classement) || classement.length <= nbSortants || nbSortants <= 0) return [];
        const cleAuCutoff = getCleEgaliteStats(classement[nbSortants - 1]);
        const cleApresCutoff = getCleEgaliteStats(classement[nbSortants]);
        if (cleAuCutoff !== cleApresCutoff) return [];

        const groupe = classement
            .filter(ligne => getCleEgaliteStats(ligne) === cleAuCutoff)
            .map(ligne => ligne.joueur);

        // Si la bulle concerne exactement 2 joueurs et que la confrontation directe les départage,
        // on ne crée pas de barrage: l'avantage H2H doit primer.
        if (groupe.length === 2) {
            const h2h = getStatsConfrontationDirecte(groupe[0], groupe[1]);
            if (h2h && h2h.winsA !== h2h.winsB) {
                return [];
            }
        }

        return groupe;
    }

    // Fonction: getClefsTieBreakNecessairesPourGroupe - rôle métier documenté for faciliter la maintenance.
    function getClefsTieBreakNecessairesPourGroupe(groupeBulle) {
        if (!Array.isArray(groupeBulle) || groupeBulle.length < 2) return new Set();
        const keys = new Set();

        for (let i = 0; i < groupeBulle.length; i++) {
            for (let j = i + 1; j < groupeBulle.length; j++) {
                const joueurA = groupeBulle[i];
                const joueurB = groupeBulle[j];
                const key = getTieBreakPairKey(joueurA, joueurB);
                if (!getWinnerTieBreak(joueurA, joueurB)) {
                    keys.add(key);
                }
            }
        }

        return keys;
    }

    // Fonction: nettoyerTieBreaksEnAttenteObsoletes - rôle métier documenté for faciliter la maintenance.
    function nettoyerTieBreaksEnAttenteObsoletes(clefsNecessaires) {
        if (!tournoiActuel) return;
        tournoiActuel.matches = tournoiActuel.matches.filter(m => {
            if (m.matchType !== 'tiebreak') return true;
            if (m.status !== 'waiting') return true;
            const key = getTieBreakPairKey(m.playerA, m.playerB);
            return clefsNecessaires.has(key);
        });
    }

    // Fonction: creerManchesDecisivesSiNecessaire - rôle métier documenté for faciliter la maintenance.
    function creerManchesDecisivesSiNecessaire(stats) {
        if (!tournoiActuel || !tousLesMatchsReguliersTermines()) return;

        const nbSortants = getNombreSortants();
        if (nbSortants <= 0 || nbSortants >= tournoiActuel.players.length) return;

        // Retour arrière demandé: pas de matchs de départage automatiques.
        // On garde uniquement le classement sur confrontation directe + critères existants.
        tournoiActuel.matches = tournoiActuel.matches.filter(m => {
            if (m.matchType !== 'tiebreak') return true;
            return m.status === 'finished';
        });
    }

    // Fonction: getEtatQualification - rôle métier documenté for faciliter la maintenance.
    function getEtatQualification(playersFilter = null, nbQualifiesOverride = null) {
        if (!tournoiActuel) return { classement: [], stats: {}, sortantsConnus: [], sortantsGarantis: [], nbSortants: 0 };

        const stats = construireStatsTournoi(playersFilter);
        // Tie-breaks automatiques non supportés par groupe for le moment, désactivés.
        if (!playersFilter) creerManchesDecisivesSiNecessaire(stats);

        const classement = Object.values(stats).sort(comparerClassement);
        const nbSortants = nbQualifiesOverride !== null ? nbQualifiesOverride : getNombreSortants();

        const classementSansTB = Object.values(stats).sort(comparerClassementSansTieBreak);
        // ... (logique de bulle simplifiée si playersFilter)

        const sortantsGarantis = classement
            .filter(c => {
                const nbAdversairesEncoreDangereux = classement
                    .filter(o => o.joueur !== c.joueur && o.maxPts >= c.pts)
                    .length;
                return nbAdversairesEncoreDangereux <= (nbSortants - 1);
            })
            .map(c => c.joueur);

        const relevantMatches = tournoiActuel.matches.filter(m =>
            !playersFilter || (playersFilter.includes(m.playerA) && playersFilter.includes(m.playerB))
        );
        const restant = relevantMatches.filter(m => m.status !== 'finished').length;

        const barrageBulleEnCours = !playersFilter && aTieBreakEnAttenteOuEnCours();

        const peutAnnoncerSortants = !barrageBulleEnCours && (
            restant === 0 || sortantsGarantis.length >= nbSortants
        );

        const sortantsConnus = peutAnnoncerSortants
            ? classement.slice(0, nbSortants).map(c => c.joueur)
            : [];

        return { classement, stats, sortantsConnus, sortantsGarantis, nbSortants };
    }

    // Fonction: verifierSortantsConnusEtDemanderSuite - rôle métier documenté for faciliter la maintenance.
    function verifierSortantsConnusEtDemanderSuite() {
        if (!tournoiActuel || tournoiActuel.type !== 'cartesien') return;
        if (decisionSortantsPrise) return;

        // Tant qu'une manche décisive est en cours/attente, on ne demande pas d'arrêter/continuer.
        if (aTieBreakEnAttenteOuEnCours()) return;

        const etat = getEtatQualification();
        if (etat.sortantsConnus.length < etat.nbSortants || etat.nbSortants <= 0) return;

        decisionSortantsPrise = true;
        continuerCartesien = true;
        ouverturePhaseFinaleEnAttente = false;
        parametrageFinalDisponible = false;
        sortantsConnusPourFinale = [...etat.sortantsConnus];
        alert(`Les ${etat.nbSortants} sortants sont connus. Tu peux continuer ou arrêter le Cartésien quand tu veux.`);
    }

    // Fonction: essayerOuvrirPageSortants - rôle métier documenté for faciliter la maintenance.
    function essayerOuvrirPageSortants() {
        if (!tournoiActuel) return;

        if (tournoiActuel.type === 'poules') {
            const enCours = tournoiActuel.matches.filter(m => m.status === 'in_progress').length;
            if (enCours > 0) return;

            const sortants = getSortantsPoules();
            if (sortants.length < MIN_FINALISTES_TABLEAU) {
                alert(`Pas assez de qualifiés for lancer une phase finale. Minimum requis: ${MIN_FINALISTES_TABLEAU} joueurs.`);
                return;
            }

            sortantsConnusPourFinale = sortants;
            parametrageFinalDisponible = true;
            ouverturePhaseFinaleEnAttente = false;
            ouvrirEcranSortants();
            rendrePageSortants();
            return;
        }

        if (!ouverturePhaseFinaleEnAttente) return;
        const enCours = tournoiActuel.matches.filter(m => m.status === 'in_progress').length;
        if (enCours > 0) return;

        const etat = getEtatQualification();
        const nbSortants = getNombreSortants();
        const nbSortantsReference = nbSortants > 0 ? nbSortants : etat.nbSortants;
        const sortantsMemorises = decisionSortantsPrise
            && nbSortantsReference > 0
            && sortantsConnusPourFinale.length >= nbSortantsReference;
        if (sortantsMemorises) {
            if (sortantsConnusPourFinale.length < MIN_FINALISTES_TABLEAU) {
                alert(`La phase finale exige au moins ${MIN_FINALISTES_TABLEAU} joueurs qualifiés.`);
                return;
            }
            ouverturePhaseFinaleEnAttente = false;
            parametrageFinalDisponible = true;
            ouvrirEcranSortants();
            rendrePageSortants();
            return;
        }

        if (etat.sortantsConnus.length < etat.nbSortants || etat.nbSortants <= 0) return;

        if (etat.sortantsConnus.length < MIN_FINALISTES_TABLEAU) {
            alert(`La phase finale exige au moins ${MIN_FINALISTES_TABLEAU} joueurs qualifiés.`);
            return;
        }

        sortantsConnusPourFinale = [...etat.sortantsConnus];
        ouverturePhaseFinaleEnAttente = false;
        parametrageFinalDisponible = true;
        ouvrirEcranSortants();
        rendrePageSortants();
    }

    function getSortantsPoules() {
        if (!tournoiActuel || !tournoiActuel.poules) return [];

        const qualifiesParPoule = tournoiActuel.settings.qualifiesParPoule || 1;
        const structure = tournoiActuel.settings.structureFinalePoules || 'auto';

        const resultsPerPoule = tournoiActuel.poules.map(poule => {
            const etat = getEtatQualification(poule.players, qualifiesParPoule);
            return etat.classement.slice(0, qualifiesParPoule).map(l => l.joueur);
        });

        // Grâce au nouveau moteur de tableau final (format ATP / Têtes de série),
        // il suffit de fournir la liste triée par rang (tous les 1ers, puis tous les 2èmes...)
        // L'algorithme se chargera automatiquement de croiser 1A avec 2B, 2A avec 3B, etc.
        const flat = [];
        const maxQualifies = Math.max(...resultsPerPoule.map(r => r.length));
        for (let i = 0; i < maxQualifies; i++) {
            for (let p = 0; p < resultsPerPoule.length; p++) {
                if (resultsPerPoule[p] && resultsPerPoule[p][i]) {
                    flat.push(resultsPerPoule[p][i]);
                }
            }
        }
        return flat;
    }

    // Fonction: renderActionVersFinale - rôle métier documenté for faciliter la maintenance.
    function renderActionVersFinale() {
        if (!tournoiActuel) {
            actionVersFinaleEl.classList.add('hidden');
            return;
        }

        if (tournoiActuel.type === 'poules') {
            const tousFinis = tournoiActuel.matches.every(m => m.status === 'finished');
            if (!tousFinis) {
                actionVersFinaleEl.classList.add('hidden');
                return;
            }

            const nbSortantsPoules = getSortantsPoules().length;

            actionVersFinaleEl.classList.remove('hidden');
            actionVersFinaleHelpEl.textContent = nbSortantsPoules < MIN_FINALISTES_TABLEAU
                ? `⚠️ Tous les matchs de poules sont terminés, mais il faut au moins ${MIN_FINALISTES_TABLEAU} qualifiés for une phase finale.`
                : '✅ Tous les matchs de poules sont terminés !';

            // On cache les boutons spécifiques au Cartésien
            continuerCartesienBtn.classList.add('hidden');
            arreterCartesienBtn.classList.add('hidden');

            ouvrirParametrageFinalBtn.classList.remove('hidden');
            ouvrirParametrageFinalBtn.disabled = nbSortantsPoules < MIN_FINALISTES_TABLEAU;
            ouvrirParametrageFinalBtn.textContent = 'Passer à la phase finale';
            return;
        }

        if (tournoiActuel.type !== 'cartesien') {
            actionVersFinaleEl.classList.add('hidden');
            return;
        }

        const etat = getEtatQualification();
        const sortantsValidesMemoire = decisionSortantsPrise
            && etat.nbSortants > 0
            && sortantsConnusPourFinale.length >= etat.nbSortants;
        const sortantsConnus = sortantsValidesMemoire
            || (etat.nbSortants > 0 && etat.sortantsConnus.length >= etat.nbSortants);
        if (!sortantsConnus) {
            actionVersFinaleEl.classList.add('hidden');
            return;
        }

        actionVersFinaleEl.classList.remove('hidden');
        const tousTermines = tournoiActuel.matches.length > 0 && tournoiActuel.matches.every(m => m.status === 'finished');
        const nbSortantsDisponibles = sortantsConnusPourFinale.length || etat.sortantsConnus.length;
        const finalPossible = nbSortantsDisponibles >= MIN_FINALISTES_TABLEAU;
        if (tousTermines) {
            ouverturePhaseFinaleEnAttente = false;
            parametrageFinalDisponible = finalPossible;
        }

        continuerCartesienBtn.classList.toggle('hidden', tousTermines);
        arreterCartesienBtn.classList.toggle('hidden', tousTermines);
        continuerCartesienBtn.disabled = continuerCartesien;
        arreterCartesienBtn.disabled = !continuerCartesien;

        if (parametrageFinalDisponible) {
            ouvrirParametrageFinalBtn.disabled = !finalPossible;
            actionVersFinaleHelpEl.textContent = finalPossible
                ? (tousTermines
                    ? '✅ Cartésien terminé : tu peux passer aux paramétrages du tableau final.'
                    : '✅ Classement analysable : quand tu veux, passe aux paramétrages du tableau final.')
                : `⚠️ Il faut au moins ${MIN_FINALISTES_TABLEAU} qualifiés for la phase finale.`;
            return;
        }

        if (ouverturePhaseFinaleEnAttente) {
            ouvrirParametrageFinalBtn.disabled = true;
            actionVersFinaleHelpEl.textContent = '⏳ Sortants connus : on attend la fin des matchs en cours avant d’ouvrir les paramétrages du tableau final.';
            return;
        }

        ouvrirParametrageFinalBtn.disabled = true;
        actionVersFinaleHelpEl.textContent = continuerCartesien
            ? 'Les sortants sont connus. Tu peux continuer le Cartésien ou l’arrêter for préparer la phase finale.'
            : 'Cartésien arrêté. Dès que les matchs en cours sont terminés, le paramétrage final sera disponible.';
    }

    // Fonction: arreterCartesienEtPreparerFinale - rôle métier documenté for faciliter la maintenance.
    async function arreterCartesienEtPreparerFinale() {
        try {
            if (!tournoiActuel) return;

            const nbEnCours = tournoiActuel.matches.filter(m => m.status === 'in_progress').length;
            if (nbEnCours > 0) {
                const confirmCancel = confirm(`Il y a ${nbEnCours} match(s) "en cours". Voulez-vous les annuler pour clore immédiatement le Cartésien ?\n\n(OK = Annuler ces matchs et passer à la phase finale)\n(Annuler = Attendre qu'ils soient terminés)`);
                if (confirmCancel) {
                    tournoiActuel.matches = tournoiActuel.matches.filter(m => m.status !== 'in_progress');
                }
            }

            const nbEnAttente = tournoiActuel.matches.filter(m => m.status === 'waiting').length;
            if (nbEnAttente > 0) {
                tournoiActuel.matches = tournoiActuel.matches.filter(m => m.status !== 'waiting');
            }

            await saveTournamentToDB(tournoiActuel);
            continuerCartesien = false;
            ouverturePhaseFinaleEnAttente = true;
            parametrageFinalDisponible = false;
            if (nbEnAttente > 0) {
                alert(`${nbEnAttente} match(s) en attente annulé(s).`);
            }
            essayerOuvrirPageSortants();
            renderTournoi();
        } catch (err) {
            alert("Erreur lors de l'arrêt du Cartésien: " + err.message);
        }
    }

    // Fonction: continuerCartesienApresSortantsConnus - rôle métier documenté for faciliter la maintenance.
    function continuerCartesienApresSortantsConnus() {
        if (!tournoiActuel) return;
        continuerCartesien = true;
        ouverturePhaseFinaleEnAttente = false;
        parametrageFinalDisponible = false;
        lancerMatchsAutomatiquement();
        renderTournoi();
    }

    // Fonction: calculerClassement - rôle métier documenté for faciliter la maintenance.
    function calculerClassement() {
        return getEtatQualification().classement;
    }

    // ===== 6) Rendu UI (écran tournoi principal) =====
    // Fonction: renderStatusPills - rôle métier documenté for faciliter la maintenance.
    function renderStatusPills() {
        if (!tournoiActuel) {
            statusRowEl.innerHTML = '';
            return;
        }

        const total = tournoiActuel.matches.length;
        const enCours = tournoiActuel.matches.filter(m => m.status === 'in_progress').length;
        const finis = tournoiActuel.matches.filter(m => m.status === 'finished').length;
        const attente = tournoiActuel.matches.filter(m => m.status === 'waiting').length;
        const etat = getEtatQualification();

        statusRowEl.innerHTML = `
                <span class="status-pill">Joueurs: <strong>${tournoiActuel.players.length}</strong></span>
                <span class="status-pill">Matchs totaux: <strong>${total}</strong></span>
                <span class="status-pill">En cours: <strong>${enCours}/${MAX_BILLARDS}</strong></span>
                <span class="status-pill">En attente: <strong>${attente}</strong></span>
                <span class="status-pill">Terminés: <strong>${finis}</strong></span>
                <span class="status-pill">Règle: <strong>${texteSecurise(libelleRegle(tournoiActuel.settings))}</strong></span>
                <span class="status-pill">Barème: <strong>${texteSecurise(libelleBareme(tournoiActuel.settings))}</strong></span>
                <span class="status-pill">Sortants connus: <strong>${etat.sortantsConnus.length}/${etat.nbSortants}</strong></span>
                <span class="status-pill">Sortants sûrs Chakra: <strong>${etat.sortantsGarantis.length}</strong></span>
                <span class="status-pill">Suite Cartésien: <strong>${continuerCartesien ? 'Oui' : 'Non'}</strong></span>
                ${ouverturePhaseFinaleEnAttente
                ? '<span class="status-pill" style="border-color: rgba(217, 119, 6, 0.6); color:#92400e; background: rgba(251, 191, 36, 0.2);">⏳ Sortants connus: attente fin des matchs en cours</span>'
                : ''}
                ${etat.sortantsConnus.length >= etat.nbSortants && etat.nbSortants > 0
                ? '<span class="status-pill" style="border-color: rgba(22, 163, 74, 0.6); color:#166534; background: rgba(34, 197, 94, 0.15);">✅ Tous les sortants sont connus</span>'
                : ''}
            `;
    }

    // Fonction: renderMatchsEnCours - rôle métier documenté for faciliter la maintenance.
    function renderMatchsEnCours(customContainerId = null) {
        const container = customContainerId ? document.getElementById(customContainerId) : matchsEnCoursEl;
        if (!tournoiActuel || !container) {
            if (container) container.innerHTML = '';
            return;
        }

        const actifs = tournoiActuel.matches
            .filter(m => m.status === 'in_progress')
            .sort((a, b) => (a.table - b.table) || (a.round - b.round));

        if (!actifs.length) {
            container.innerHTML = '<p class="help">Aucun match en cours.</p>';
            return;
        }

        container.innerHTML = actifs.map(m => {
            const jA = joueurs.find(j => getNomJoueur(j) === m.playerA);
            const jB = joueurs.find(j => getNomJoueur(j) === m.playerB);
            return `
                <div id="match-card-${m.id}" class="match-card in-progress">
                    <div class="match-top">
                        <span class="match-round">${formatRoundLabel(m)}</span>
                        <span class="table-badge">Billard ${m.table}</span>
                    </div>
                    <div class="match-versus">
                        <div class="match-versus-players">
                            <div class="match-player-col">
                                ${obtenirAvatarHTML(jA, 'avatar-large')}
                                <span class="match-player-name">${formaterNomJoueurHTML(m.playerA)}</span>
                                <input id="score-a-${m.id}" class="chakra-input score-input-inline" type="number" min="0" step="1" value="0" aria-label="Score ${texteSecurise(m.playerA)}" oninput="marquerScoreEnAttenteValidation('${String(m.id).replaceAll("'", "\\'")}', 'cartesien')">
                            </div>
                            <span class="match-vs-divider">VS</span>
                            <div class="match-player-col">
                                ${obtenirAvatarHTML(jB, 'avatar-large')}
                                <span class="match-player-name">${formaterNomJoueurHTML(m.playerB)}</span>
                                <input id="score-b-${m.id}" class="chakra-input score-input-inline" type="number" min="0" step="1" value="0" aria-label="Score ${texteSecurise(m.playerB)}" oninput="marquerScoreEnAttenteValidation('${String(m.id).replaceAll("'", "\\'")}', 'cartesien')">
                            </div>
                        </div>
                    </div>
                    <div class="quick-scores">
                        ${getScoresRapidesPourMatch(m, tournoiActuel.settings).map(([a, b]) => `<button type="button" onclick="presetScoreMatch('${String(m.id).replaceAll("'", "\\'")}', ${a}, ${b})">${a}-${b}</button>`).join('')}
                    </div>
                    <div class="match-actions" style="display:flex; gap:8px;">
                        <button class="btn-score-save" type="button" onclick="validerScoreMatch('${String(m.id).replaceAll("'", "\\'")}')">Valider</button>
                        <button class="btn-alt" type="button" onclick="repousserMatch('${String(m.id).replaceAll("'", "\\'")}')">Repousser</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Fonction: renderMatchsAttente - rôle métier documenté for faciliter la maintenance.
    function renderMatchsAttente(customContainerId = null) {
        const container = customContainerId ? document.getElementById(customContainerId) : matchsAttenteEl;
        if (!tournoiActuel || !container) {
            if (container) container.innerHTML = '';
            return;
        }

        const attente = tournoiActuel.matches
            .filter(m => m.status === 'waiting')
            .sort((a, b) => {
                const aPause = estMatchReporteEnPause(a) ? 1 : 0;
                const bPause = estMatchReporteEnPause(b) ? 1 : 0;
                if (aPause !== bPause) return aPause - bPause;

                const aPrio = a.prioriteReport ? 0 : 1;
                const bPrio = b.prioriteReport ? 0 : 1;
                if (aPrio !== bPrio) return aPrio - bPrio;

                return (a.round - b.round) || (a.id - b.id);
            });

        if (!attente.length) {
            matchsAttenteEl.innerHTML = '<p class="help">Aucun match en attente.</p>';
            return;
        }

        const contexte = getContexteImportanceMatch(attente.length);

        matchsAttenteEl.innerHTML = attente.map(m => `
                <div class="match-card">
                    <div class="match-top">
                        <span class="match-round">${formatRoundLabel(m)}</span>
                        ${estMatchReporteEnPause(m)
                ? '<span class="table-badge">Reporté • en pause</span>'
                : (m.prioriteReport
                    ? '<span class="table-badge decider">Reporté • priorité</span>'
                    : (estMatchDecisifQualification(m, contexte)
                        ? '<span class="table-badge decider">Décisif qualification</span>'
                        : '<span class="table-badge">En file</span>'))}
                    </div>
                    <div class="match-versus">${formaterNomJoueurHTML(m.playerA)} vs ${formaterNomJoueurHTML(m.playerB)}</div>
                    <div class="match-actions" style="margin-top:8px;">
                        <button type="button" class="btn-edit-score" style="width:100%;" onclick="enregistrerMatchAttente('${String(m.id).replaceAll("'", "\\'")}')">Enregistrer le score</button>
                    </div>
                </div>
            `).join('');
    }

    // Fonction: renderClassement - rôle métier documenté for faciliter la maintenance.
    function renderClassement() {
        const etat = getEtatQualification();
        const classement = etat.classement;

        if (!classement.length) {
            classementBodyEl.innerHTML = '<tr><td colspan="7" class="txt-muted">Aucune donnée</td></tr>';
            return;
        }

        const knownSet = new Set(etat.sortantsConnus);
        const guaranteedSet = new Set(etat.sortantsGarantis);

        const badgeH2HSet = new Set();
        const groupesParPoints = new Map();
        classement.forEach(ligne => {
            if (!groupesParPoints.has(ligne.pts)) groupesParPoints.set(ligne.pts, []);
            groupesParPoints.get(ligne.pts).push(ligne);
        });

        groupesParPoints.forEach(groupe => {
            if (groupe.length !== 2) return;
            const a = groupe[0];
            const b = groupe[1];
            const h2h = getStatsConfrontationDirecte(a.joueur, b.joueur);
            if (!h2h || h2h.winsA === h2h.winsB) return;
            badgeH2HSet.add(a.joueur);
            badgeH2HSet.add(b.joueur);
        });

        classementBodyEl.innerHTML = classement.map((l, idx) => `
                <tr class="${guaranteedSet.has(l.joueur) ? 'row-guaranteed' : (knownSet.has(l.joueur) ? 'row-qualified' : '')}">
                    <td>${idx + 1}</td>
                    <td class="${guaranteedSet.has(l.joueur) ? 'name-guaranteed' : ''}">${formaterNomJoueurHTML(l.joueur)}</td>
                    <td>${l.v}</td>
                    <td>${l.n}</td>
                    <td>${l.d}</td>
                    <td>${l.pts}</td>
                    <td>
                        ${guaranteedSet.has(l.joueur)
                ? '<span class="badge badge-guaranteed">🟣 Sortant sûr</span>'
                : (knownSet.has(l.joueur)
                    ? '<span class="badge badge-qualified">Sortant</span>'
                    : '<span class="txt-muted">-</span>')}
                        ${badgeH2HSet.has(l.joueur)
                ? '<span class="badge badge-info" style="margin-left:6px;">🔁 Départagé en confrontation directe</span>'
                : ''}
                    </td>
                </tr>
            `).join('');
    }

    // Fonction: renderResultats - rôle métier documenté for faciliter la maintenance.
    function renderResultats() {
        if (!tournoiActuel) {
            resultatsBodyEl.innerHTML = '';
            return;
        }

        const statutLibelle = {
            waiting: 'En attente',
            in_progress: 'En cours',
            finished: 'Terminé'
        };

        resultatsBodyEl.innerHTML = tournoiActuel.matches
            .sort((a, b) => (a.round - b.round) || (a.id - b.id))
            .map(m => `
                    <tr>
                        <td>${formatRoundLabel(m)}</td>
                        <td>${m.status === 'in_progress' ? `Billard ${m.table}` : '<span class="txt-muted">-</span>'}</td>
                        <td>${formaterNomJoueurHTML(m.playerA)} vs ${formaterNomJoueurHTML(m.playerB)}${m.matchType === 'tiebreak' ? ' <span class="badge badge-guaranteed">Décisive</span>' : ''}</td>
                        <td>${statutLibelle[m.status] || m.status}</td>
                        <td>
                            ${m.scoreA !== null && m.scoreB !== null
                    ? `${m.scoreA}-${m.scoreB}${m.winner ? ` • <span class="winner">${formaterNomJoueurHTML(m.winner)}</span>` : ' • <span class="draw">Nul</span>'}`
                    : '<span class="txt-muted">-</span>'}
                        </td>
                        <td>
                            ${m.status === 'finished'
                    ? `<button type="button" class="btn-edit-score" onclick="modifierScoreMatch('${String(m.id).replaceAll("'", "\\'")}')">Modifier</button>`
                    : (m.status === 'waiting'
                        ? `<button type="button" class="btn-edit-score" onclick="enregistrerMatchAttente('${String(m.id).replaceAll("'", "\\'")}')">Modifier</button>`
                        : '<span class="txt-muted">-</span>')}
                        </td>
                    </tr>
                `).join('');
    }

    // Fonction: renderTournoi - rôle métier documenté for faciliter la maintenance.
    function renderTournoi() {
        if (!tournoiActuel) return;
        tournoiMetaEl.textContent = `${libelleType(tournoiActuel.type)} • ${tournoiActuel.players.length} joueurs • ${libelleRegle(tournoiActuel.settings)} • ${libelleBareme(tournoiActuel.settings)} • 2 billards max`;
        essayerOuvrirPageSortants();
        renderStatusPills();
        renderActionVersFinale();

        if (tournoiActuel.type === 'poules') {
            if (defaultTournoiLayoutEl) defaultTournoiLayoutEl.classList.add('hidden');
            if (poulesTournoiContainerEl) {
                poulesTournoiContainerEl.classList.remove('hidden');
                renderTournoiPoules();
            }
        } else {
            if (defaultTournoiLayoutEl) defaultTournoiLayoutEl.classList.remove('hidden');
            if (poulesTournoiContainerEl) poulesTournoiContainerEl.classList.add('hidden');
            renderMatchsEnCours();
            renderMatchsAttente();
            renderClassement();
            renderResultats();
        }

        // Déclencher un départage simple (message + saisie) sur égalité parfaite (uniquement Cartésien for l'instant).
        const contexteDepartage = detecterEgaliteNonResolue();
        if (contexteDepartage) demanderDepartageSimple(contexteDepartage);

        // Synchronisation asynchrone non bloquante
        syncActiveTournament();
    }

    function renderTournoiPoules() {
        if (!tournoiActuel || !tournoiActuel.poules) return;

        poulesTournoiContainerEl.innerHTML = '';

        // On affiche quand même les matchs en cours en haut car ils occupent les billards
        const sectionEnCours = document.createElement('section');
        sectionEnCours.className = 'card';
        sectionEnCours.style.padding = '12px';
        sectionEnCours.style.marginBottom = '20px';
        sectionEnCours.innerHTML = `
                <h3 class="section-title">Matchs en cours (toutes poules)</h3>
                <div id="matchs-en-cours-poules" class="list-stack"></div>
            `;
        poulesTournoiContainerEl.appendChild(sectionEnCours);
        renderMatchsEnCours('matchs-en-cours-poules');

        tournoiActuel.poules.forEach((poule, idx) => {
            const section = document.createElement('section');
            section.className = 'poule-section';
            section.style.marginBottom = '30px';

            const char = String.fromCharCode(65 + idx);
            const etat = getEtatQualification(poule.players, tournoiActuel.settings.qualifiesParPoule);

            section.innerHTML = `
                    <h2 class="chakra-heading" style="color:var(--accent); margin-bottom:15px; border-bottom: 2px solid var(--accent); padding-bottom:5px;">
                        Poule ${char}
                    </h2>
                    <div class="grid-tournoi">
                        <div class="card" style="padding:12px;">
                            <h3 class="section-title">Classement Poule ${char}</h3>
                            <div class="table-scroll">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Joueur</th>
                                            <th>V</th>
                                            <th>N</th>
                                            <th>D</th>
                                            <th>Pts</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${renderClassementRows(etat)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card" style="padding:12px;">
                            <h3 class="section-title">Résultats Poule ${char}</h3>
                            <div class="table-scroll">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Rd</th>
                                            <th>Match</th>
                                            <th>Score</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${renderResultatsRows(poule.players)}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                `;
            poulesTournoiContainerEl.appendChild(section);
        });
    }

    function renderClassementRows(etat) {
        const { classement, sortantsConnus, sortantsGarantis } = etat;
        if (!classement.length) return '<tr><td colspan="7" class="txt-muted">Aucune donnée</td></tr>';

        const knownSet = new Set(sortantsConnus);
        const guaranteedSet = new Set(sortantsGarantis);

        return classement.map((l, idx) => {
            const joueur = joueurs.find(j => getNomJoueur(j) === l.joueur);
            return `
                <tr class="${guaranteedSet.has(l.joueur) ? 'row-guaranteed' : (knownSet.has(l.joueur) ? 'row-qualified' : '')}">
                    <td>${idx + 1}</td>
                    <td class="${guaranteedSet.has(l.joueur) ? 'name-guaranteed' : ''}">
                        <div class="player-row-with-photo">
                            ${obtenirAvatarHTML(joueur, 'avatar-small')}
                            <span>${texteSecurise(l.joueur)}</span>
                        </div>
                    </td>
                    <td>${l.v}</td>
                    <td>${l.n}</td>
                    <td>${l.d}</td>
                    <td>${l.pts}</td>
                    <td>
                        ${guaranteedSet.has(l.joueur)
                    ? '<span class="badge badge-guaranteed">⭐ Qualifié</span>'
                    : (knownSet.has(l.joueur)
                        ? '<span class="badge badge-qualified">Qualifié</span>'
                        : '<span class="txt-muted">-</span>')}
                    </td>
                </tr>
            `;
        }).join('');
    }

    function renderResultatsRows(poulePlayers) {
        if (!tournoiActuel) return '';
        const statusLibelle = { waiting: 'Att.', in_progress: 'Cours', finished: 'Fin' };

        return tournoiActuel.matches
            .filter(m => poulePlayers.includes(m.playerA) && poulePlayers.includes(m.playerB))
            .sort((a, b) => (a.round - b.round) || (a.id - b.id))
            .map(m => `
                    <tr>
                        <td title="Round ${m.round}">${m.round}${m.status === 'in_progress' ? ` (B${m.table})` : ''}</td>
                        <td style="font-size: 0.9em;">${texteSecurise(m.playerA)} vs ${texteSecurise(m.playerB)}</td>
                        <td>
                            ${m.scoreA !== null && m.scoreB !== null
                    ? `<strong>${m.scoreA}-${m.scoreB}</strong>`
                    : `<span class="txt-muted">${statusLibelle[m.status] || '-'}</span>`}
                        </td>
                        <td>
                            ${m.status === 'finished'
                    ? `<button type="button" class="btn-edit-score" style="padding: 2px 5px; font-size:10px;" onclick="modifierScoreMatch('${String(m.id).replaceAll("'", "\\'")}')">Edit</button>`
                    : (m.status === 'waiting'
                        ? `<button type="button" class="btn-edit-score" style="padding: 2px 5px; font-size:10px;" onclick="enregistrerMatchAttente('${String(m.id).replaceAll("'", "\\'")}')">Edit</button>`
                        : 'Cours')}
                        </td>
                    </tr>
                `).join('');
    }

    // Fonction: ouvrirEcranTournoi - rôle métier documenté for faciliter la maintenance.
    function ouvrirEcranTournoi() {
        configScreenEl.classList.add('hidden');
        sortantsScreenEl.classList.add('hidden');
        tableauFinalScreenEl.classList.add('hidden');
        tournoiScreenEl.classList.remove('hidden');
    }

    // Fonction: fermerEcranTournoi - rôle métier documenté for faciliter la maintenance.
    function fermerEcranTournoi() {
        tournoiScreenEl.classList.add('hidden');
        sortantsScreenEl.classList.add('hidden');
        tableauFinalScreenEl.classList.add('hidden');
        configScreenEl.classList.remove('hidden');
    }

    // Fonction: ouvrirEcranSortants - rôle métier documenté for faciliter la maintenance.
    function ouvrirEcranSortants() {
        configScreenEl.classList.add('hidden');
        tournoiScreenEl.classList.add('hidden');
        tableauFinalScreenEl.classList.add('hidden');
        sortantsScreenEl.classList.remove('hidden');
    }

    // Fonction: ouvrirEcranTableauFinal - rôle métier documenté for faciliter la maintenance.
    function ouvrirEcranTableauFinal() {
        configScreenEl.classList.add('hidden');
        tournoiScreenEl.classList.add('hidden');
        sortantsScreenEl.classList.add('hidden');
        tableauFinalScreenEl.classList.remove('hidden');
    }

    // ===== 6-bis) Rendu UI (écran tableau final) =====
    // Fonction: renderTableauFinalStatus - rôle métier documenté for faciliter la maintenance.
    function renderTableauFinalStatus() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) {
            tableauFinalStatusRowEl.innerHTML = '';
            return;
        }

        const total = phaseFinale.matches.length;
        const enCours = phaseFinale.matches.filter(m => m.status === 'in_progress').length;
        const attente = phaseFinale.matches.filter(m => m.status === 'waiting').length;
        const finis = phaseFinale.matches.filter(m => m.status === 'finished').length;

        tableauFinalStatusRowEl.innerHTML = `
                <span class="status-pill">Qualifiés: <strong>${phaseFinale.qualifies.length}</strong></span>
                <span class="status-pill">Tours: <strong>${phaseFinale.totalTours}</strong></span>
                <span class="status-pill">En cours: <strong>${enCours}/${MAX_BILLARDS}</strong></span>
                <span class="status-pill">En attente: <strong>${attente}</strong></span>
                <span class="status-pill">Terminés: <strong>${finis}/${total}</strong></span>
                ${phaseFinale.winner
                ? `<span class="status-pill" style="border-color: rgba(34,197,94,0.75); color:#bbf7d0; background: rgba(34,197,94,0.16);">🏆 Vainqueur: <strong>${texteSecurise(phaseFinale.winner)}</strong></span>`
                : ''}
            `;
    }

    // Fonction: getLibelleStatutFinal - rôle métier documenté for faciliter la maintenance.
    function getLibelleStatutFinal(statut) {
        if (statut === 'in_progress') return 'En cours';
        if (statut === 'finished') return 'Terminé';
        return 'En attente';
    }

    // Fonction: genererPodiumHtml - rôle métier: génère la vue du podium à la fin du tournoi.
    function genererPodiumHtml(phaseFinale) {
        if (!phaseFinale || !phaseFinale.winner) return '';

        const finalMatch = phaseFinale.matches.find(m => (!m.nextMatchId || m.nextMatchId === 0) && !m.isPetiteFinale && m.status === 'finished');
        if (!finalMatch) return '';

        const gold = finalMatch.winner;
        const silver = finalMatch.winner === finalMatch.playerA ? finalMatch.playerB : finalMatch.playerA;
        let bronze = [];

        const petiteFinale = phaseFinale.matches.find(m => m.matchType === 'petite_finale' && m.status === 'finished');
        if (petiteFinale) {
            bronze.push(petiteFinale.winner);
        }

        const getPlayerHtml = (nom) => {
            const j = joueurs.find(joueur => getNomJoueur(joueur) === nom);
            return `
                    <div class="podium-player-content">
                        ${obtenirAvatarHTML(j, 'avatar-large', 'podium-avatar')}
                        <span class="podium-player-name">${texteSecurise(nom)}</span>
                    </div>
                `;
        };



        return `
                <div class="card" style="margin-bottom: 24px;">
                    <div class="podium-container">
                        <div class="podium-step podium-silver">
                            ${getPlayerHtml(silver)}
                            <div class="podium-step-medal">🥈</div>
                        </div>
                        <div class="podium-step podium-gold">
                            ${getPlayerHtml(gold)}
                            <div class="podium-step-medal">🥇</div>
                        </div>
                        ${bronze.length > 0 ? `
                        <div class="podium-step podium-bronze">
                            ${getPlayerHtml(bronze[0])}
                            <div class="podium-step-medal">🥉</div>
                        </div>
                        ` : ''}
                    </div>
                </div>
            `;
    }

    // Fonction: renderTableauFinalBracket - rôle métier documenté for faciliter la maintenance.
    function renderTableauFinalBracket() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) {
            tableauFinalBracketEl.innerHTML = '';
            return;
        }

        const rounds = [];
        for (let r = 1; r <= phaseFinale.totalTours; r++) {
            rounds.push(
                phaseFinale.matches
                    .filter(m => m.round === r)
                    .sort((a, b) => a.id - b.id)
            );
        }

        const bracketHtml = rounds.map((matchesRound, index) => {
            const round = index + 1;
            const regle = getRegleRoundFinal(round);
            const titre = matchesRound[0]?.label || `Tour ${round}`;
            const roundStageClass = round === phaseFinale.totalTours ? 'round-final' : (round === phaseFinale.totalTours - 1 ? 'round-semi' : '');

            const matchsHtml = matchesRound.map(m => {
                const statusClass = m.status === 'in_progress' ? 'in-progress' : (m.status === 'finished' ? 'finished' : 'waiting');
                const isFinal = m.round === phaseFinale.totalTours && m.matchType !== 'petite_finale';
                const isPetiteFinale = m.matchType === 'petite_finale';
                const isSemiFinal = m.round === phaseFinale.totalTours - 1;
                const stageClass = isFinal ? 'is-final' : (isPetiteFinale ? 'is-petite-finale' : (isSemiFinal ? 'is-semi-final' : ''));

                const nomA = m.playerA || 'À définir';
                const nomB = m.playerB || 'À définir';
                const scoreA = m.scoreA ?? '-';
                const scoreB = m.scoreB ?? '-';
                const isWinnerA = m.winner && m.winner === m.playerA;
                const isWinnerB = m.winner && m.winner === m.playerB;

                const jA = joueurs.find(j => getNomJoueur(j) === nomA);
                const jB = joueurs.find(j => getNomJoueur(j) === nomB);
                return `
                        <article class="bracket-match ${statusClass} ${stageClass}">
                            <div class="bracket-player ${isWinnerA ? 'winner' : ''}">
                                <div class="player-row-with-photo">
                                    ${obtenirAvatarHTML(jA, 'avatar-small')}
                                    <span>${formaterNomJoueurHTML(nomA)}</span>
                                </div>
                                <strong>${scoreA}</strong>
                            </div>
                            <div class="bracket-player ${isWinnerB ? 'winner' : ''}">
                                <div class="player-row-with-photo">
                                    ${obtenirAvatarHTML(jB, 'avatar-small')}
                                    <span>${formaterNomJoueurHTML(nomB)}</span>
                                </div>
                                <strong>${scoreB}</strong>
                            </div>
                            <div class="bracket-score">${m.scoreA !== null && m.scoreB !== null ? `${m.scoreA}-${m.scoreB}` : '—'}</div>
                            <div class="bracket-status">${getLibelleStatutFinal(m.status)}</div>
                        </article>
                    `;
            }).join('');

            return `
                    <section class="bracket-round ${roundStageClass}">
                        <div class="bracket-round-title">${texteSecurise(titre)}</div>
                        <div class="bracket-rule">${texteSecurise(libelleRegle(regle))}</div>
                        ${matchsHtml}
                    </section>
                `;
        }).join('');

        const podiumHtml = genererPodiumHtml(phaseFinale);
        tableauFinalBracketEl.innerHTML = podiumHtml + bracketHtml;
    }

    // Fonction: renderTableauFinalMatchsEnCours - rôle métier documenté for faciliter la maintenance.
    function renderTableauFinalMatchsEnCours() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) {
            tableauFinalMatchsEnCoursEl.innerHTML = '';
            return;
        }

        const actifs = phaseFinale.matches
            .filter(m => m.status === 'in_progress')
            .sort((a, b) => (a.table - b.table) || (a.round - b.round) || (a.id - b.id));

        if (!actifs.length) {
            tableauFinalMatchsEnCoursEl.innerHTML = '<p class="help">Aucun match du tableau final en cours.</p>';
            return;
        }

        tableauFinalMatchsEnCoursEl.innerHTML = actifs.map(m => {
            const regle = getRegleRoundFinal(m.round);
            const scoresRapides = getScoresRapidesTableauFinal(regle);
            const jA = joueurs.find(j => getNomJoueur(j) === m.playerA);
            const jB = joueurs.find(j => getNomJoueur(j) === m.playerB);
            return `
                    <div id="final-match-card-${m.id}" class="match-card in-progress">
                        <div class="match-top">
                            <span class="match-round">${texteSecurise(m.label)}</span>
                            <span class="table-badge">Billard ${m.table}</span>
                        </div>
                        <div class="match-versus">
                            <div class="match-versus-players">
                                <div class="match-player-col">
                                    ${obtenirAvatarHTML(jA, 'avatar-large')}
                                    <span class="match-player-name">${texteSecurise(m.playerA)}</span>
                                    <input id="final-score-a-${m.id}" class="chakra-input score-input-inline" type="number" min="0" step="1" value="0" aria-label="Score ${texteSecurise(m.playerA)}" oninput="marquerScoreEnAttenteValidation(${m.id}, 'final');">
                                </div>
                                <span class="match-vs-divider">VS</span>
                                <div class="match-player-col">
                                    ${obtenirAvatarHTML(jB, 'avatar-large')}
                                    <span class="match-player-name">${texteSecurise(m.playerB)}</span>
                                    <input id="final-score-b-${m.id}" class="chakra-input score-input-inline" type="number" min="0" step="1" value="0" aria-label="Score ${texteSecurise(m.playerB)}" oninput="marquerScoreEnAttenteValidation(${m.id}, 'final');">
                                </div>
                            </div>
                        </div>
                        <p class="help" style="margin-top:6px; text-align:center;">Règle : ${texteSecurise(libelleRegle(regle))}</p>
                        <div class="quick-scores">
                            ${scoresRapides.map(([a, b]) => `<button type="button" onclick="presetScoreMatchFinal(${m.id}, ${a}, ${b})"> ${a}-${b}</button>`).join('')}
                        </div>
                        <div class="match-actions" style="display:flex; gap:8px;">
                            <button class="btn-score-save" type="button" onclick="validerScoreMatchFinal(${m.id})">Valider</button>
                        </div>
                    </div>
                `;
        }).join('');
    }

    // Fonction: renderTableauFinalMatchsAttente - rôle métier documenté for faciliter la maintenance.
    function renderTableauFinalMatchsAttente() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) {
            tableauFinalMatchsAttenteEl.innerHTML = '';
            return;
        }

        const attente = phaseFinale.matches
            .filter(m => m.status === 'waiting')
            .sort((a, b) => (a.round - b.round) || (a.id - b.id));

        if (!attente.length) {
            tableauFinalMatchsAttenteEl.innerHTML = '<p class="help">Aucun match en attente.</p>';
            return;
        }

        tableauFinalMatchsAttenteEl.innerHTML = attente.map(m => `
                <div class="match-card">
                    <div class="match-top">
                        <span class="match-round">${texteSecurise(m.label)}</span>
                        <span class="table-badge">${m.playerA && m.playerB ? 'En file' : 'En attente des qualifiés'}</span>
                    </div>
                    <div class="match-versus">${formaterNomJoueurHTML(m.playerA || 'À définir')} vs ${formaterNomJoueurHTML(m.playerB || 'À définir')}</div>
                    ${m.playerA && m.playerB ? `
                        <div class="match-actions" style="margin-top:8px;">
                            <button type="button" class="btn-edit-score" style="width:100%;" onclick="enregistrerMatchFinalAttente(${m.id})">Enregistrer le score</button>
                        </div>
                    ` : ''}
                </div>
            `).join('');
    }

    // Fonction: renderTableauFinalResultats - rôle métier documenté for faciliter la maintenance.
    function renderTableauFinalResultats() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) {
            tableauFinalResultatsBodyEl.innerHTML = '';
            tableauFinalGagnantEl.textContent = '';
            return;
        }

        const statutLibelle = {
            waiting: 'En attente',
            in_progress: 'En cours',
            finished: 'Terminé'
        };

        tableauFinalResultatsBodyEl.innerHTML = phaseFinale.matches
            .slice()
            .sort((a, b) => (a.round - b.round) || (a.id - b.id))
            .map(m => `
                    <tr>
                        <td>${texteSecurise(m.label)}</td>
                        <td>${formaterNomJoueurHTML(m.playerA || 'À définir')} vs ${formaterNomJoueurHTML(m.playerB || 'À définir')}</td>
                        <td>${statutLibelle[m.status] || m.status}</td>
                        <td>
                            ${m.scoreA !== null && m.scoreB !== null
                    ? `${m.scoreA}-${m.scoreB} • <span class="final-winner">${formaterNomJoueurHTML(m.winner || '-')}</span>`
                    : '<span class="txt-muted">-</span>'}
                        </td>
                        <td>
                            ${m.status === 'finished'
                    ? `<button type="button" class="btn-edit-score" onclick="modifierScoreMatchFinal(${m.id})">Modifier</button>`
                    : (m.status === 'waiting' && m.playerA && m.playerB
                        ? `<button type="button" class="btn-edit-score" onclick="enregistrerMatchFinalAttente(${m.id})">Modifier</button>`
                        : '<span class="txt-muted">-</span>')}
                        </td>
                    </tr>
                `).join('');

        if (phaseFinale.winner && tournoiActuel && !tournoiActuel.estArchive) {
            tableauFinalGagnantEl.innerHTML = `🏆 Vainqueur du tableau final : <strong>${formaterNomJoueurHTML(phaseFinale.winner)}</strong>`;
            if (archiverTournoiBtn) archiverTournoiBtn.classList.remove('hidden');
        } else if (phaseFinale.winner && tournoiActuel && tournoiActuel.estArchive) {
            tableauFinalGagnantEl.innerHTML = `🏆 Vainqueur du tableau final : <strong>${formaterNomJoueurHTML(phaseFinale.winner)}</strong> <br>💾 <em>Ce tournoi est archivé.</em>`;
            if (archiverTournoiBtn) archiverTournoiBtn.classList.add('hidden');
        } else {
            tableauFinalGagnantEl.innerHTML = 'Le tableau final est en cours.';
            if (archiverTournoiBtn) archiverTournoiBtn.classList.add('hidden');
        }
    }

    // Fonction: afficherPopupFelicitationsFinale - rôle métier documenté for faciliter la maintenance.
    function afficherPopupFelicitationsFinale() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale || !phaseFinale.winner) return;

        const finale = phaseFinale.matches.find(m => m.round === phaseFinale.totalTours);
        if (!finale || finale.status !== 'finished' || !finale.winner) return;

        const finaliste = finale.winner === finale.playerA ? finale.playerB : finale.playerA;
        const cle = `${finale.id}|${finale.winner}|${finaliste || ''}`;
        if (derniereClePopupFinale === cle) return;

        derniereClePopupFinale = cle;
        setTimeout(() => {
            alert(
                `🎉 Félicitations !\n\n` +
                `Finaliste : ${finaliste || 'N/A'}\n` +
                `🏆 Gagnant : ${finale.winner}\n\n` +
                `Bravo aux deux joueurs for cette belle finale !`
            );
        }, 0);
    }

    // Fonction: renderTableauFinal - rôle métier documenté for faciliter la maintenance.
    function renderTableauFinal() {
        const phaseFinale = getPhaseFinale();
        if (!phaseFinale) return;
        const regleResume = Object.values(phaseFinale.reglesParTour || {})
            .map(r => `${r.label}: ${libelleRegle(r)}`)
            .join(' • ');
        tableauFinalMetaEl.textContent = `${phaseFinale.qualifies.length} qualifiés • ${regleResume}`;
        renderTableauFinalStatus();
        renderTableauFinalBracket();
        renderTableauFinalMatchsEnCours();
        renderTableauFinalResultats();
        afficherPopupFelicitationsFinale();

        // Synchronisation asynchrone non bloquante
        syncActiveTournament();
    }

    // Fonction: lancerTableauFinalDepuisSortants - rôle métier documenté for faciliter la maintenance.
    function lancerTableauFinalDepuisSortants() {
        if (!tournoiActuel) return;
        if (!sortantsConnusPourFinale.length || sortantsConnusPourFinale.length < MIN_FINALISTES_TABLEAU) {
            alert(`Il faut au moins ${MIN_FINALISTES_TABLEAU} sortants for lancer un tableau final.`);
            return;
        }

        if (ordreTirageFinale.length > 0 && ordreTirageFinale.length < sortantsConnusPourFinale.length) {
            alert('Le tirage au sort est en cours. Termine le tirage ou réinitialise-le avant de lancer le tableau final.');
            return;
        }

        const reglesParTour = lireReglesParTourTableauFinal();
        if (!reglesParTour) return;

        const avecPetiteFinale = petiteFinaleCheckbox ? petiteFinaleCheckbox.checked : false;

        if (!avecPetiteFinale) {
            const okPF = confirm("La 'Petite finale' (match pour la 3ème place) n'est pas cochée. Souhaitez-vous continuer ainsi ?\n\n(OK = Pas de petite finale)\n(Annuler = Retourner cocher l'option)");
            if (!okPF) return;
        }

        const dejaLance = !!tournoiActuel.phaseFinale;
        if (dejaLance) {
            const ok = confirm('Le tableau final est déjà lancé. Le relancer va réinitialiser les matchs de phase finale. Continuer ?');
            if (!ok) return;
        }

        const ordreFinalistes = getOrdreFinalistesPourTableau();
        const phase = initialiserTableauFinal(ordreFinalistes, reglesParTour, avecPetiteFinale);
        if (!phase) {
            alert('Impossible de créer le tableau final.');
            return;
        }

        derniereClePopupFinale = null;

        renderTableauFinal();
        ouvrirEcranTableauFinal();
    }

    // ===== 7) Câblage événements + initialisation =====
    adminToggleBtn.addEventListener('click', () => {
        if (isAdmin) return;
        activerModeAdmin();
    });

    addPlayerBtn.addEventListener('click', ajouterJoueur);
    adminLogoutBtn.addEventListener('click', quitterModeAdmin);
    validateSelectionBtn.addEventListener('click', validerSelectionParticipants);
    editSelectionBtn.addEventListener('click', modifierSelectionParticipants);
    typeTournoiEl.addEventListener('change', () => {
        appliquerThemeCartesien();
        appliquerVisibiliteSortantsPoules();

        const estPoules = typeTournoiEl.value === 'poules';
        if (poulesConfigWrapEl) poulesConfigWrapEl.classList.toggle('hidden', !estPoules);
        if (estPoules) synchroniserInfosPoules('nb');
    });
    if (nbPoulesEl) {
        nbPoulesEl.addEventListener('input', () => synchroniserInfosPoules('nb'));
    }
    if (joueursParPouleInputEl) {
        joueursParPouleInputEl.addEventListener('input', () => synchroniserInfosPoules('size'));
    }
    if (repartitionPoulesEl) {
        repartitionPoulesEl.addEventListener('change', () => synchroniserInfosPoules('nb'));
    }
    tournoiCategorieEl.addEventListener('change', () => {
        if (tournoiCategorieEl.value === 'mixte') {
            if (regleNombreWrapEl) regleNombreWrapEl.classList.add('hidden');
            if (regleMixteWrapEl) regleMixteWrapEl.classList.remove('hidden');
        } else {
            if (regleNombreWrapEl) regleNombreWrapEl.classList.remove('hidden');
            if (regleMixteWrapEl) regleMixteWrapEl.classList.add('hidden');
        }
        synchroniserSelectionCategorie();
        rendreChecklistParticipants();
        rendreParticipantsSelectionnes();
    });
    retourConfigBtn.addEventListener('click', fermerEcranTournoi);

    function annulerTournoiActuel() {
        if (!confirm("Voulez-vous vraiment annuler ce tournoi en cours ?\n\nAttention : Tout l'historique de ce tournoi sera définitivement perdu et il ne sera pas archivé. (Idéal pour les essais)")) return;

        // Remove from DB/Cache
        if (tournoiActuel && tournoiActuel.id) {
            const cache = lireCacheTournoisLocal();
            const newCache = cache.filter(t => t.id !== tournoiActuel.id);
            ecrireCacheTournoisLocal(newCache);
            
            if (supabaseActive && supabaseClient) {
                supabaseClient.from('tournaments').delete().eq('id', tournoiActuel.id)
                    .then(({error}) => {
                        if (error) console.error("Erreur lors de la suppression (annulation) du tournoi:", error.message);
                    });
            }
        }
        
        // Reset state
        tournoiActuel = null;
        decisionSortantsPrise = false;
        continuerCartesien = true;
        ouverturePhaseFinaleEnAttente = false;
        parametrageFinalDisponible = false;
        sortantsConnusPourFinale = [];
        ordreTirageFinale = [];
        poolTirageFinale = [];
        derniereClePopupFinale = null;
        
        tournoiScreenEl.classList.add('hidden');
        sortantsScreenEl.classList.add('hidden');
        tableauFinalScreenEl.classList.add('hidden');
        configScreenEl.classList.remove('hidden');
        
        alert("Le tournoi en cours a été annulé avec succès.");
    }

    const btnAnnuler1 = document.getElementById('annuler-tournoi-1');
    const btnAnnuler2 = document.getElementById('annuler-tournoi-2');
    const btnAnnuler3 = document.getElementById('annuler-tournoi-3');
    if (btnAnnuler1) btnAnnuler1.addEventListener('click', annulerTournoiActuel);
    if (btnAnnuler2) btnAnnuler2.addEventListener('click', annulerTournoiActuel);
    if (btnAnnuler3) btnAnnuler3.addEventListener('click', annulerTournoiActuel);

    continuerCartesienBtn.addEventListener('click', continuerCartesienApresSortantsConnus);
    arreterCartesienBtn.addEventListener('click', arreterCartesienEtPreparerFinale);
    ouvrirParametrageFinalBtn.addEventListener('click', () => {
        try {
            if (!tournoiActuel) return;

            essayerOuvrirPageSortants();

            const sortantsCandidats = tournoiActuel.type === 'poules'
                ? getSortantsPoules()
                : (sortantsConnusPourFinale.length ? sortantsConnusPourFinale : getEtatQualification().sortantsConnus);
            if (sortantsCandidats.length < MIN_FINALISTES_TABLEAU) {
                alert(`La phase finale nécessite au moins ${MIN_FINALISTES_TABLEAU} joueurs qualifiés.`);
                return;
            }
            if (!sortantsConnusPourFinale.length) {
                sortantsConnusPourFinale = [...sortantsCandidats];
                decisionSortantsPrise = true;
            }

            const enCours = tournoiActuel.matches.filter(m => m.status === 'in_progress').length;
            const tousTermines = tournoiActuel?.matches?.length > 0 && tournoiActuel.matches.every(m => m.status === 'finished');
            if (tousTermines) {
                parametrageFinalDisponible = true;
                ouverturePhaseFinaleEnAttente = false;
            }

            const etatQualification = getEtatQualification();
            const nbSortants = getNombreSortants();
            const nbSortantsReference = nbSortants > 0 ? nbSortants : etatQualification.nbSortants;
            const sortantsMemorises = decisionSortantsPrise
                && nbSortantsReference > 0
                && sortantsConnusPourFinale.length >= nbSortantsReference;
            const sortantsConnusEtat = etatQualification.nbSortants > 0
                && etatQualification.sortantsConnus.length >= etatQualification.nbSortants;

            if (!continuerCartesien && enCours === 0 && (sortantsMemorises || sortantsConnusEtat)) {
                parametrageFinalDisponible = true;
                ouverturePhaseFinaleEnAttente = false;
            }

            if (sortantsMemorises) {
                parametrageFinalDisponible = true;
            }

            if (!parametrageFinalDisponible) {
                if (enCours > 0) {
                    alert('Le paramétrage du tableau final sera disponible dès que les matchs en cours seront terminés.');
                } else {
                    alert('Le paramétrage du tableau final n’est pas encore disponible : les sortants ne sont pas validés.');
                }
                return;
            }
            rendrePageSortants();
            ouvrirEcranSortants();
        } catch (err) {
            alert('Erreur critique: ' + err.message + '\n' + err.stack);
        }
    });
    retourTournoiDepuisSortantsBtn.addEventListener('click', () => {
        renderTournoi();
        ouvrirEcranTournoi();
    });
    tirerFinalisteBtn.addEventListener('click', tirerProchainFinalisteAleatoire);
    reinitTirageBtn.addEventListener('click', reinitialiserTirageFinalistes);
    lancerTableauFinalBtn.addEventListener('click', lancerTableauFinalDepuisSortants);
    retourSortantsBtn.addEventListener('click', () => {
        rendrePageSortants();
        ouvrirEcranSortants();
    });
    clubLogoInputEl.addEventListener('change', importerLogoClub);
    resetClubLogoBtn.addEventListener('click', retirerLogoClub);

    nbPoulesEl.addEventListener('input', synchroniserInfosPoules);
    repartitionPoulesEl.addEventListener('change', synchroniserInfosPoules);

    newPlayerInputEl.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            ajouterJoueur();
        }
    });

    if (assoconnectCsvInputEl) {
        assoconnectCsvInputEl.addEventListener('change', importerAssoconnectCsv);
    }

    function getRepartitionManuelle() {
        const buckets = document.querySelectorAll('.poule-bucket');
        const repartition = [];
        buckets.forEach((bucket, idx) => {
            const players = Array.from(bucket.querySelectorAll('.participant-chip'))
                .map(chip => chip.getAttribute('data-name'));
            if (players.length > 0) repartition.push(players);
        });
        return repartition;
    }

    function shuffleArray(array) {
        const res = [...array];
        for (let i = res.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [res[i], res[j]] = [res[j], res[i]];
        }
        return res;
    }

    function creerTournoiPoules(participants, settings, nbPoules, repartitionType) {
        let repartition = [];
        const qualifiesParPoule = Math.max(1, parseInt(qualifiesParPouleEl.value, 10) || 1);
        if (repartitionType === 'manuel') {
            repartition = getRepartitionManuelle();
            if (repartition.length === 0) {
                alert('Répartition manuelle vide. Vérifiez vos poules.');
                return null;
            }
            const incomplete = repartition.some(p => p.length < 2);
            if (incomplete) {
                alert('Chaque poule doit contenir au moins 2 joueurs for générer des matchs.');
                return null;
            }
        } else {
            const shuffled = shuffleArray(participants);
            const totalP = shuffled.length;
            if (totalP < nbPoules * 2) {
                alert(`Impossible de créer ${nbPoules} poules avec seulement ${totalP} joueurs (minimum 2 joueurs par poule requis).`);
                return null;
            }
            for (let i = 0; i < nbPoules; i++) repartition.push([]);
            shuffled.forEach((p, idx) => {
                repartition[idx % nbPoules].push(p);
            });
        }

        const nbFinalistesPotentiels = repartition.length * qualifiesParPoule;
        if (nbFinalistesPotentiels < MIN_FINALISTES_TABLEAU) {
            alert(`Configuration invalide avant lancement des poules: ${repartition.length} poule(s) × ${qualifiesParPoule} qualifié(s) = ${nbFinalistesPotentiels}. Il faut au moins ${MIN_FINALISTES_TABLEAU} finalistes potentiels.`);
            return null;
        }

        const poules = repartition.map((pPlayers, idx) => {
            const rounds = genererRoundsRoundRobin(pPlayers);
            let idSeq = 1;
            const matches = rounds.flatMap(roundMatches => roundMatches.map(m => ({
                id: `p${idx}-${idSeq++}`,
                round: m.round,
                playerA: m.playerA,
                playerB: m.playerB,
                matchType: 'regular',
                status: 'waiting',
                table: null,
                scoreA: null,
                scoreB: null,
                winner: null,
                pouleIdx: idx,
                pouleName: `Poule ${String.fromCharCode(65 + idx)}`
            })));
            return {
                name: `Poule ${String.fromCharCode(65 + idx)}`,
                players: pPlayers,
                matches: matches
            };
        });

        const allMatches = poules.flatMap(p => p.matches);

        return {
            type: 'poules',
            categorie: tournoiCategorieEl ? tournoiCategorieEl.value : 'amateur',
            players: [...participants],
            poules: poules,
            settings: {
                ...settings,
                nbPoules: nbPoules,
                qualifiesParPoule,
                structureFinalePoules: structureFinalePoulesEl.value
            },
            matches: allMatches,
            completedMatchCount: 0,
            startedAt: new Date().toISOString()
        };
    }

    tournoiFormEl.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!selectionParticipantsVerrouillee) {
            alert('Valide la sélection des participants avant de créer le tournoi.');
            return;
        }

        if (joueursSelectionnes.length < 2) {
            alert('Il faut au moins 2 joueurs sélectionnés for créer un tournoi.');
            return;
        }

        const type = typeTournoiEl.value;
        if (type !== 'cartesien' && type !== 'poules') {
            alert('Pour le moment, seul les modes Cartésien et Poules sont automatisés.');
            return;
        }

        const settings = getRegleMatchDepuisForm();

        if (settings.pointsVictoire < settings.pointsNul) {
            alert('Le barème est inhabituel : la victoire rapporte moins que le nul. Ajuste si nécessaire.');
        }

        if (type === 'cartesien') {
            if (settings.sortantsPoules > joueursSelectionnes.length) {
                alert(`Le nombre de sortants (${settings.sortantsPoules}) ne peut pas dépasser le nombre de joueurs sélectionnés (${joueursSelectionnes.length}).`);
                return;
            }
            if (settings.sortantsPoules < MIN_FINALISTES_TABLEAU) {
                alert(`Pour conserver une phase finale logique, règle le nombre de sortants à au moins ${MIN_FINALISTES_TABLEAU}.`);
                return;
            }
            tournoiActuel = creerTournoiCartesien(joueursSelectionnes, settings);
        } else {
            const nbP = parseInt(nbPoulesEl.value, 10) || 1;
            const repType = repartitionPoulesEl.value;
            const qualifiesParPoule = Math.max(1, parseInt(qualifiesParPouleEl.value, 10) || 1);
            const nbFinalistesConfig = nbP * qualifiesParPoule;
            if (nbFinalistesConfig < MIN_FINALISTES_TABLEAU) {
                alert(`Configuration des poules invalide: ${nbP} poule(s) × ${qualifiesParPoule} qualifié(s) = ${nbFinalistesConfig}. Il faut au moins ${MIN_FINALISTES_TABLEAU} finalistes potentiels.`);
                return;
            }
            tournoiActuel = creerTournoiPoules(joueursSelectionnes, settings, nbP, repType);
            if (!tournoiActuel) return;
        }

        decisionSortantsPrise = false;
        continuerCartesien = true;
        ouverturePhaseFinaleEnAttente = false;
        parametrageFinalDisponible = false;
        sortantsConnusPourFinale = [];
        ordreTirageFinale = [];
        poolTirageFinale = [];
        derniereClePopupFinale = null;
        lancerMatchsAutomatiquement();
        renderTournoi();
        ouvrirEcranTournoi();
    });

    if (openDashboardBtn) openDashboardBtn.addEventListener('click', ouvrirDashboard);
    if (retourConfigDepuisDashboardBtn) retourConfigDepuisDashboardBtn.addEventListener('click', fermerDashboard);
    if (archiverTournoiBtn) archiverTournoiBtn.addEventListener('click', archiverLeTournoi);
    if (exportDbBtn) exportDbBtn.addEventListener('click', exportDB);
    if (clearDbBtn) clearDbBtn.addEventListener('click', async () => {
        if (confirm("Êtes-vous sûr de vouloir supprimer définitivement l'historique de tous les tournois archivés ?")) {
            await clearDB();
            renderDashboard();
            alert('La base de données a été réinitialisée.');
        }
    });

    reinitialiserCategoriesNouveauJoueur();
    
    initDB().then(async () => {
        await chargerJoueurs();
        await chargerLogoClub();
        rafraichirUI();
        appliquerThemeCartesien();
        appliquerVisibiliteSortantsPoules();
        // Restauration d'un tournoi en cours au démarrage
        await restaurerTournoiActuelDepuisDB();
    }).catch(async (err) => {
        console.error("Impossible d'initialiser Supabase", err);
        await chargerJoueurs();
        await chargerLogoClub();
        rafraichirUI();
        appliquerThemeCartesien();
        appliquerVisibiliteSortantsPoules();
        // Tentative de restauration depuis le cache local en cas d'échec réseau
        await restaurerTournoiActuelDepuisDB();
    });

});