// Portail Unifié - Billard & Équitation
console.log("Portail Unifié : Démarrage du script v2.9.21...");
const APP_SUPABASE_URL = "https://iwtuwtvgrocmxfkmidlk.supabase.co";
const APP_SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3dHV3dHZncm9jbXhma21pZGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTM5NzUsImV4cCI6MjA5MzkyOTk3NX0.ISCfQxrD4dAnygL-teYon-KoJWrzDuTEHFZpe9tslmY";

let supabaseClient = null;
if (typeof supabase !== 'undefined') {
  try {
    supabaseClient = supabase.createClient(APP_SUPABASE_URL, APP_SUPABASE_KEY, {
      auth: {
        storage: window.sessionStorage,
        persistSession: true
      }
    });
    window.supabaseClient = supabaseClient;
    console.log("Client Supabase initialisé immédiatement.");
  } catch (err) {
    console.error("Erreur init Supabase immédiate :", err);
  }
}

let currentUser = null;
let drinks = [];
let settings = {};
let isLogin = true;
let inactivityTimeout = null;
let inactivityModalInterval = null;
let isShowingInactivityModal = false;
let pendingDrinkOrder = null;

function isMembership(drink) {
  if (!drink) return false;
  const name = (drink.name || '').toLowerCase();
  return name.includes('adhésion') || name.includes('adhesion') || name.includes('abonnement');
}

function isStockManaged(drink) {
  if (!drink || isMembership(drink)) return false;
  if (drink.track_stock === false) return false;
  if (drink.stock === null || drink.stock === undefined || drink.stock <= -99999) return false;
  return true;
}
window.isStockManaged = isStockManaged;

function getItemCategory(drink) {
  if (!drink) return 'bar';
  if (drink.category) {
    const cat = String(drink.category).toLowerCase().trim();
    if (cat === 'billard' || cat === 'billiard' || cat === 'materiel' || cat === 'autres' || cat === 'autre') return 'billard';
    return 'bar';
  }
  const cleanStr = ((drink.name || '') + ' ' + (drink.icon || ''))
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const billiardKeywords = [
    'procede', 'craie', 'crai', 'taom',
    'virole', 'embout', 'queue', 'fleche',
    'chiffon', 'gant', 'kamui', 'triangle', 'bille'
  ];
  if (billiardKeywords.some(kw => cleanStr.includes(kw))) {
    return 'billard';
  }
  return 'bar';
}
window.getItemCategory = getItemCategory;

// --- FONCTION DE SOUMISSION DE CONNEXION GLOBALE ---
async function submitLoginForm(e) {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) e.stopPropagation();
  }
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');
  const pseudoInput = document.getElementById('login-pseudo');

  const email = (emailInput?.value || '').trim().toLowerCase();
  const password = passwordInput?.value || '';
  const pseudo = pseudoInput ? pseudoInput.value.trim() : "";

  if (!email || !password) {
    alert("Veuillez renseigner votre email et votre mot de passe.");
    return false;
  }

  toggleLoading(true);

  if (!supabaseClient && typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(APP_SUPABASE_URL, APP_SUPABASE_KEY, {
      auth: { storage: window.sessionStorage, persistSession: true }
    });
    window.supabaseClient = supabaseClient;
  }

  if (isLogin) {
    try {
      console.log("Tentative de connexion pour :", email);
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) {
        toggleLoading(false);
        console.error("Erreur de connexion :", error);
        alert("Erreur de connexion : " + error.message);
        return false;
      }
      console.log("Connexion réussie pour :", data?.user?.email);
      if (data?.user) {
        handleSignIn(data.user);
      }
      toggleLoading(false);
      return false;
    } catch (err) {
      toggleLoading(false);
      console.error("Exception connexion :", err);
      alert("Erreur imprévue : " + err.message);
      return false;
    }
  } else {
    if (!pseudo) {
      toggleLoading(false);
      alert("Veuillez saisir un pseudo.");
      return false;
    }

    try {
      const { count: profileCount } = await supabaseClient.from('profiles').select('*', { count: 'exact', head: true });
      const isFirstUser = profileCount === 0;
      let importedMember = null;

      if (!isFirstUser) {
        const { data: importData, error: importCheckError } = await supabaseClient
          .from('imported_members')
          .select('*')
          .eq('email', email)
          .maybeSingle();
        importedMember = importData;

        if (importCheckError) {
          toggleLoading(false);
          alert("Erreur lors de la vérification de votre éligibilité : " + importCheckError.message);
          return false;
        }

        if (!importedMember) {
          toggleLoading(false);
          alert("Création de compte refusée : Votre e-mail n'est pas en attente d'inscription dans la liste des membres. Veuillez demander à un administrateur de vous ajouter au préalable.");
          return false;
        }
      }

      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { full_name: pseudo } }
      });

      if (error) {
        alert("Erreur d'inscription : " + error.message);
      } else {
        if (data?.user) {
          try {
            const userRole = isFirstUser ? 'admin' : (importedMember && importedMember.role === 'admin' ? 'admin' : 'member');
            const userStock = importedMember && importedMember.can_manage_stock === true;
            let profileData = {
              id: data.user.id,
              email: email,
              full_name: pseudo,
              role: userRole,
              can_manage_stock: userStock
            };
            if (importedMember && importedMember.avatar_url) {
              profileData.avatar_url = importedMember.avatar_url;
            }
            await supabaseClient.from('profiles').upsert(profileData);
          } catch (_) { }
        }
        alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
      }
    } catch (regErr) {
      alert("Erreur lors de l'inscription : " + regErr.message);
    }
    toggleLoading(false);
    return false;
  }
}
window.submitLoginForm = submitLoginForm;

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM chargé, initialisation...");
  try {
    if (!supabaseClient && typeof supabase !== 'undefined') {
      supabaseClient = supabase.createClient(APP_SUPABASE_URL, APP_SUPABASE_KEY, {
        auth: {
          storage: window.sessionStorage,
          persistSession: true
        }
      });
      window.supabaseClient = supabaseClient;
    }
    if (!supabaseClient) {
      throw new Error("Le SDK Supabase n'est pas chargé. Vérifiez votre connexion internet.");
    }

    // --- STATISTIQUES ---
    let salesChartInstance = null;
    let isSeasonSelectorInitialized = false;
    let allConsData = null;

    async function renderSalesChart(forceRefresh = false) {
      const canvas = document.getElementById('salesChart');
      if (!canvas) return;

      try {
        if (!allConsData || forceRefresh) {
          const { data: consData, error } = await supabaseClient
            .from('consumptions')
            .select('created_at, price_at_time, quantity, is_paid')
            .order('created_at', { ascending: true });

          if (error) throw error;
          allConsData = consData || [];
        }

        const selector = document.getElementById('season-selector');

        const currentDate = new Date();
        const currentM = currentDate.getMonth();
        const currentY = currentDate.getFullYear();
        const currentSeason = currentM >= 8 ? currentY : currentY - 1;
        const currentMonthIndex = currentM >= 8 ? currentM - 8 : currentM + 4;

        if (!isSeasonSelectorInitialized && selector) {
          const seasons = new Set();
          allConsData.forEach(c => {
            const d = new Date(c.created_at);
            const y = d.getFullYear();
            const seasonStartYear = d.getMonth() >= 8 ? y : y - 1;
            seasons.add(seasonStartYear);
          });

          selector.innerHTML = '';
          const sortedSeasons = Array.from(seasons).sort((a, b) => b - a);
          if (sortedSeasons.length === 0) {
            sortedSeasons.push(currentSeason);
          }

          sortedSeasons.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = `Saison ${y}-${y + 1}`;
            selector.appendChild(opt);
          });

          selector.addEventListener('change', () => {
            renderSalesChart();
          });
          isSeasonSelectorInitialized = true;
        }

        const selectedSeason = selector ? parseInt(selector.value) : currentSeason;

        const months = ["Sept", "Oct", "Nov", "Déc", "Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août"];
        const monthlyPaid = new Array(12).fill(0);
        const monthlyUnpaid = new Array(12).fill(0);
        const monthlyTotal = new Array(12).fill(0);
        let totalRevenue = 0;
        let totalPaid = 0;
        let totalUnpaid = 0;

        allConsData.forEach(c => {
          const d = new Date(c.created_at);
          const m = d.getMonth();
          const y = d.getFullYear();
          const seasonStartYear = m >= 8 ? y : y - 1;

          if (seasonStartYear === selectedSeason) {
            const index = (m >= 8) ? (m - 8) : (m + 4);
            const qty = c.quantity || 1;
            const price = c.price_at_time || 0;
            const amount = qty * price;

            monthlyTotal[index] += amount;
            totalRevenue += amount;

            if (c.is_paid) {
              monthlyPaid[index] += amount;
              totalPaid += amount;
            } else {
              monthlyUnpaid[index] += amount;
              totalUnpaid += amount;
            }
          }
        });

        const totalSalesEl = document.getElementById('stat-total-sales');
        if (totalSalesEl) {
          totalSalesEl.textContent = totalRevenue.toFixed(2).replace(/\./g, ',') + ' €';
        }

        const totalUnpaidEl = document.getElementById('stat-total-unpaid');
        if (totalUnpaidEl) {
          totalUnpaidEl.textContent = totalUnpaid.toFixed(2).replace(/\./g, ',') + ' €';
        }

        const cumulativeSales = [];
        let cum = 0;
        for (let i = 0; i < monthlyTotal.length; i++) {
          if (selectedSeason === currentSeason && i > currentMonthIndex) {
            cumulativeSales.push(null);
          } else {
            cum += monthlyTotal[i];
            cumulativeSales.push(cum);
          }
        }

        if (salesChartInstance) {
          salesChartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        const gridColor = 'rgba(255, 255, 255, 0.05)';
        const textColor = '#94a3b8';

        salesChartInstance = new window.Chart(ctx, {
          type: 'bar',
          data: {
            labels: months,
            datasets: [
              {
                type: 'line',
                label: 'Progression Cumulée (€)',
                data: cumulativeSales,
                borderColor: '#eab308',
                backgroundColor: '#eab308',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#eab308',
                tension: 0.3,
                fill: false,
                yAxisID: 'y1',
                order: 1
              },
              {
                type: 'bar',
                label: 'CA Payé (€)',
                data: monthlyPaid,
                backgroundColor: 'rgba(16, 185, 129, 0.65)',
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 1,
                borderRadius: 4,
                stack: 'monthlySales',
                yAxisID: 'y',
                order: 2
              },
              {
                type: 'bar',
                label: 'Ardoises (Non réglé) (€)',
                data: monthlyUnpaid,
                backgroundColor: 'rgba(239, 68, 68, 0.75)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
                borderRadius: 4,
                stack: 'monthlySales',
                yAxisID: 'y',
                order: 2
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false
            },
            scales: {
              y: {
                type: 'linear',
                stacked: true,
                display: true,
                position: 'left',
                beginAtZero: true,
                ticks: {
                  callback: function (value) { return value + ' €'; },
                  color: '#10b981'
                },
                grid: { color: gridColor },
                title: { display: true, text: 'Mensuel', color: '#10b981', font: { size: 10 } }
              },
              y1: {
                type: 'linear',
                stacked: false,
                display: true,
                position: 'right',
                beginAtZero: true,
                ticks: {
                  callback: function (value) { return value + ' €'; },
                  color: '#eab308'
                },
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'Cumul', color: '#eab308', font: { size: 10 } }
              },
              x: {
                stacked: true,
                ticks: { color: textColor },
                grid: { display: false, color: gridColor }
              }
            },
            plugins: {
              legend: {
                labels: { color: '#f8fafc', font: { family: "'Outfit', sans-serif" } }
              },
              tooltip: {
                backgroundColor: 'rgba(5, 8, 22, 0.95)',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                  label: function (context) {
                    if (context.parsed.y === null || context.parsed.y === undefined) return '';
                    return ' ' + context.dataset.label + ' : ' + context.parsed.y.toFixed(2).replace(/\./g, ',') + ' €';
                  },
                  footer: function (tooltipItems) {
                    let totalMonth = 0;
                    let hasBars = false;
                    tooltipItems.forEach(item => {
                      if (item.dataset.yAxisID === 'y') {
                        totalMonth += item.parsed.y || 0;
                        hasBars = true;
                      }
                    });
                    if (hasBars && totalMonth > 0) {
                      return ' Total mensuel : ' + totalMonth.toFixed(2).replace(/\./g, ',') + ' €';
                    }
                    return '';
                  }
                }
              }
            }
          }
        });

      } catch (err) {
        console.error("Erreur lors du chargement des statistiques :", err);
      }
    }
    window.renderSalesChart = renderSalesChart;

    async function renderItemsMonthlyChart() {
      const canvas = document.getElementById('itemsMonthlyChart');
      if (!canvas) return;

      try {
        const { data: consData, error } = await supabaseClient
          .from('consumptions')
          .select('created_at, quantity, drinks(name)')
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Group by month and item_name
        const monthlyItems = {};
        const allItems = new Set();

        consData.forEach(c => {
          const date = new Date(c.created_at);
          const monthKey = `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
          const qty = c.quantity || 1;
          const itemName = (c.drinks && c.drinks.name) ? c.drinks.name : 'Inconnu';

          if (!monthlyItems[monthKey]) {
            monthlyItems[monthKey] = {};
          }
          if (!monthlyItems[monthKey][itemName]) {
            monthlyItems[monthKey][itemName] = 0;
          }
          monthlyItems[monthKey][itemName] += qty;
          allItems.add(itemName);
        });

        const labels = Object.keys(monthlyItems);
        const itemNames = Array.from(allItems);

        // Prepare datasets
        const colors = [
          '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
          '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#eab308',
          '#06b6d4', '#64748b', '#22c55e', '#84cc16', '#d946ef'
        ];

        const datasets = itemNames.map((itemName, index) => {
          const data = labels.map(month => {
            return monthlyItems[month][itemName] || 0;
          });
          return {
            label: itemName,
            data: data,
            backgroundColor: colors[index % colors.length],
            borderWidth: 0
          };
        });

        if (window.itemsMonthlyChartInstance) {
          window.itemsMonthlyChartInstance.destroy();
        }

        const ctx = canvas.getContext('2d');
        const gridColor = 'rgba(255, 255, 255, 0.05)';
        const textColor = '#94a3b8';

        window.itemsMonthlyChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: datasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                stacked: true,
                ticks: { color: textColor },
                grid: { display: false, color: gridColor }
              },
              y: {
                stacked: true,
                ticks: { color: textColor },
                grid: { color: gridColor }
              }
            },
            plugins: {
              legend: {
                position: 'bottom',
                labels: { color: '#f8fafc', font: { family: "'Outfit', sans-serif", size: 11 }, boxWidth: 12 }
              },
              tooltip: {
                backgroundColor: 'rgba(5, 8, 22, 0.9)',
                titleFont: { family: "'Outfit', sans-serif", size: 13 },
                bodyFont: { family: "'Outfit', sans-serif", size: 12 },
                padding: 12,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1,
                callbacks: {
                  label: function (context) {
                    return ' ' + context.dataset.label + ' : ' + context.raw + ' unités';
                  }
                }
              }
            }
          }
        });
      } catch (err) {
        console.error("Erreur graphique items:", err);
      }
    }
    window.renderItemsMonthlyChart = renderItemsMonthlyChart;
    window.supabaseClient = supabaseClient;
    console.log("Client Supabase initialisé.");

    await initAuth();
    initNavigation();
    initInactivityTracker();

    if (typeof lucide !== 'undefined') lucide.createIcons();
  } catch (err) {
    console.error("Erreur fatale :", err);
    document.body.innerHTML = `<div style="padding: 2rem; color: red; font-family: sans-serif;">
            <h2>Erreur de chargement</h2>
            <p>${err.message}</p>
            <button onclick="location.reload()">Réessayer</button>
        </div>`;
  }
});

let isDataLoading = false;
let isRecoverySession = false;

// --- AUTHENTIFICATION ---
async function initAuth() {
  console.log("Initialisation Auth...");
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session && !currentUser) {
    handleSignIn(session.user);
  } else if (!session) {
    const lockedEmail = sessionStorage.getItem('locked_email');
    if (lockedEmail) {
      const lockDisplay = document.getElementById('lock-email-display');
      if (lockDisplay) lockDisplay.textContent = lockedEmail;
      showView('lock-screen-view');
    } else {
      showView('login-view');
    }
    toggleLoading(false);
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    console.log("Auth State Change :", event);
    if (event === 'PASSWORD_RECOVERY' && session) {
      isRecoverySession = true;
      currentUser = session.user;
      showView('app-shell');
      // Ouvrir directement le modal de changement de mot de passe
      const changePassModal = document.getElementById('change-password-modal');
      if (changePassModal) {
        changePassModal.classList.remove('hidden');
        alert("🔑 Session de récupération activée. Veuillez saisir votre nouveau mot de passe ci-dessous pour réinitialiser votre accès. Si vous annulez, vous serez déconnecté.");
      }
      return;
    }
    if (event === 'SIGNED_IN' && session) {
      if (!currentUser || currentUser.id !== session.user.id) {
        handleSignIn(session.user);
      }
    }
    if (event === 'SIGNED_OUT') {
      handleSignOut();
    }
  });

  // ... reste du code initAuth

  // Toggle Sign In / Sign Up
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const toggleText = document.getElementById('auth-toggle-text');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      isLogin = !isLogin;
      const pseudoGroup = document.querySelector('.id-pseudo-group');
      const pseudoInput = document.getElementById('login-pseudo');
      if (isLogin) {
        toggleText.textContent = "Pas encore de compte ?";
        toggleBtn.textContent = "S'inscrire";
        submitBtn.innerHTML = `Se Connecter <i data-lucide="arrow-right"></i>`;
        if (pseudoGroup) pseudoGroup.classList.add('hidden');
        if (pseudoInput) pseudoInput.removeAttribute('required');
      } else {
        toggleText.textContent = "Déjà un compte ?";
        toggleBtn.textContent = "Se connecter";
        submitBtn.innerHTML = `Créer un compte <i data-lucide="user-plus"></i>`;
        if (pseudoGroup) pseudoGroup.classList.remove('hidden');
        if (pseudoInput) pseudoInput.setAttribute('required', 'required');
      }
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  const loginFormEl = document.getElementById('login-form');
  if (loginFormEl) {
    loginFormEl.addEventListener('submit', submitLoginForm);
  }

  // Gestion du Lock Screen
  const lockForm = document.getElementById('lock-form');
  const lockSwitchUserBtn = document.getElementById('lock-switch-user-btn');

  if (lockForm) {
    lockForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = sessionStorage.getItem('locked_email');
      const password = document.getElementById('lock-password').value;

      if (!email || !password) return;

      toggleLoading(true);
      const { error, data } = await supabaseClient.auth.signInWithPassword({ email, password });

      if (error) {
        alert("Mot de passe incorrect : " + error.message);
        toggleLoading(false);
      } else {
        sessionStorage.removeItem('locked_email');
        document.getElementById('lock-password').value = '';
        // La session est restaurée, handleSignIn sera appelé par le listener onAuthStateChange ou manuellement
        handleSignIn(data.user);
        toggleLoading(false);
      }
    });
  }

  if (lockSwitchUserBtn) {
    lockSwitchUserBtn.addEventListener('click', () => {
      sessionStorage.removeItem('locked_email');
      document.getElementById('lock-password').value = '';
      showView('login-view');
    });
  }
}

function resetRestrictedUI() {
  const navAdmin = document.querySelector('.nav-menu li[data-section="admin"]');
  const mobileAdmin = document.querySelector('.mobile-nav-item[data-section="admin"]');
  const editHomeBtn = document.getElementById('admin-edit-home-btn-container');
  const buvetteBtn = document.getElementById('buvette-header-btn');
  const sumupCfgBtn = document.getElementById('caisse-sumup-config-btn');
  const sumupCfgModal = document.getElementById('sumup-config-modal');
  const sumupCheckoutModal = document.getElementById('sumup-checkout-modal');

  if (navAdmin) navAdmin.style.display = 'none';
  if (mobileAdmin) mobileAdmin.style.display = 'none';
  if (editHomeBtn) editHomeBtn.style.display = 'none';
  if (buvetteBtn) buvetteBtn.classList.add('hidden');
  if (sumupCfgBtn) sumupCfgBtn.style.display = 'none';
  if (sumupCfgModal) sumupCfgModal.classList.add('hidden');
  if (sumupCheckoutModal) sumupCheckoutModal.classList.add('hidden');
}

function handleSignIn(user) {
  currentUser = user;
  resetRestrictedUI();
  showView('app-shell');
  loadAppData();
}

function handleSignOut() {
  currentUser = null;
  resetRestrictedUI();
  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }

  const lockedEmail = sessionStorage.getItem('locked_email');
  if (lockedEmail) {
    const lockDisplay = document.getElementById('lock-email-display');
    if (lockDisplay) lockDisplay.textContent = lockedEmail;
    showView('lock-screen-view');
  } else {
    showView('login-view');
  }
}

// --- CONTROLE D'ACCES PAR ROLE & VERROUILLAGE D'INACTIVITE ---
function applyRoleAccessControl() {
  let role = currentUser?.profile?.role || 'member';

  // SÉCURITÉ : Seul le compte propriétaire principal est forcé en admin
  const cEmail = (currentUser?.email || '').toLowerCase().trim();
  if (cEmail === 'sebastien.tessier41@orange.fr') {
    role = 'admin';
  }
  if (role) {
    role = role.trim().toLowerCase(); // au cas où il y aurait une majuscule ou un espace dans la base
  }
  if (currentUser?.profile) {
    currentUser.profile.role = role;
  }

  const navHome = document.querySelector('.nav-menu li[data-section="home"]');
  const navAdmin = document.querySelector('.nav-menu li[data-section="admin"]');
  const mobileNavBar = document.getElementById('mobile-nav-bar');

  const mobileHome = document.querySelector('.mobile-nav-item[data-section="home"]');
  const mobileAdmin = document.querySelector('.mobile-nav-item[data-section="admin"]');
  const editHomeBtn = document.getElementById('admin-edit-home-btn-container');
  const sumupCfgBtn = document.getElementById('caisse-sumup-config-btn');
  if (sumupCfgBtn) {
    sumupCfgBtn.style.display = (cEmail === 'sebastien.tessier41@orange.fr') ? 'inline-flex' : 'none';
  }

  // Find currently active section
  const activeNav = document.querySelector('.nav-menu li.active');
  const currentSection = activeNav ? activeNav.getAttribute('data-section') : null;

  const isSuperAdmin = role === 'admin';
  const isAdminTabVisible = isSuperAdmin;

  if (mobileNavBar) mobileNavBar.style.display = ''; // Toujours afficher la barre mobile

  if (isSuperAdmin) {
    if (navHome) navHome.style.display = '';
    if (mobileHome) mobileHome.style.display = '';
    if (editHomeBtn) editHomeBtn.style.display = 'block';
  } else {
    if (navHome) navHome.style.display = ''; // Tous les membres voient l'accueil
    if (mobileHome) mobileHome.style.display = '';
    if (editHomeBtn) editHomeBtn.style.display = 'none';
  }

  // --- GESTION BUVETTE (MODAL) ---
  // --- GESTION BUVETTE & SERVICE AU BAR (MODAL) ---
  window.cachedMembersForBuvette = [];

  window.populateBuvetteMemberSelect = async function (preselectedMemberId = null) {
    const select = document.getElementById('buvette-member-select');
    if (!select) return;

    let members = window.allMembersList;
    if (!members || members.length === 0) {
      const { data } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email, credit_balance, consumptions(*)')
        .order('full_name');
      members = data || [];
      window.allMembersList = members;
    }
    window.cachedMembersForBuvette = members;

    select.innerHTML = '<option value="">🛒 Vente Externe / Buvette (Recette générale)</option>';
    members.forEach(m => {
      const unpaidCons = m.consumptions?.filter(c => !c.is_paid) || [];
      const balance = unpaidCons.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0);
      const credit = parseFloat(m.credit_balance) || 0;

      let soldeBadge = '0.00 €';
      if (credit > 0) soldeBadge = `+${credit.toFixed(2)} € Crédit`;
      else if (balance > 0) soldeBadge = `-${balance.toFixed(2)} € Ardoise`;

      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = `${m.full_name} [${soldeBadge}]`;
      if (preselectedMemberId && m.id === preselectedMemberId) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });

    window.onBuvetteMemberChanged();
  };

  window.onBuvetteMemberChanged = function () {
    const select = document.getElementById('buvette-member-select');
    const infoDiv = document.getElementById('buvette-member-info');
    const paymentGroup = document.getElementById('buvette-payment-type-group');
    const soldeSpan = document.getElementById('buvette-member-solde');
    const commentInput = document.getElementById('buvette-comment');
    const modalTitle = document.getElementById('buvette-modal-title');

    if (!select) return;
    const memberId = select.value;

    if (!memberId) {
      if (infoDiv) infoDiv.classList.add('hidden');
      if (paymentGroup) paymentGroup.classList.add('hidden');
      if (commentInput) commentInput.placeholder = "Commentaire obligatoire pour vente externe (ex: Soirée, Tournoi...)";
      if (modalTitle) modalTitle.innerHTML = '<i data-lucide="shopping-cart"></i> Mode Bar & Buvette';
    } else {
      const member = window.cachedMembersForBuvette?.find(m => m.id === memberId);
      const unpaidCons = member?.consumptions?.filter(c => !c.is_paid) || [];
      const balance = unpaidCons.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0);
      const credit = parseFloat(member?.credit_balance) || 0;

      if (infoDiv) infoDiv.classList.remove('hidden');
      if (paymentGroup) paymentGroup.classList.remove('hidden');

      if (soldeSpan) {
        if (credit > 0) {
          soldeSpan.innerHTML = `<span style="color: #22c55e; font-weight:700;">+${credit.toFixed(2)} € (Crédit disponible)</span>`;
        } else if (balance > 0) {
          soldeSpan.innerHTML = `<span style="color: #ef4444; font-weight:700;">-${balance.toFixed(2)} € (Ardoise en cours)</span>`;
        } else {
          soldeSpan.innerHTML = `<span style="color: var(--text-muted); font-weight:700;">0.00 € (À jour)</span>`;
        }
      }

      if (commentInput) commentInput.placeholder = "Commentaire optionnel pour ce membre (ex: Tournoi, Tournée...)";
      if (modalTitle) modalTitle.innerHTML = `<i data-lucide="user-check"></i> Servir au bar : <strong>${member?.full_name || 'Membre'}</strong>`;
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // --- SERVICE AU BAR EN LIEU ET PLACE D'UN MEMBRE ---
  window.servingMemberTarget = null;

  window.openBuvetteForMember = async function (memberId) {
    let member = window.allMembersList?.find(m => m.id === memberId);
    if (!member) {
      try {
        const { data } = await supabaseClient.from('profiles').select('*').eq('id', memberId).maybeSingle();
        member = data;
      } catch (err) {
        console.warn("Erreur profil:", err);
      }
    }
    if (!member) {
      alert("Membre introuvable.");
      return;
    }

    // Récupérer son ardoise et crédit à jour depuis Supabase
    try {
      const { data: unpaidCons } = await supabaseClient
        .from('consumptions')
        .select('*')
        .eq('member_id', member.id)
        .eq('is_paid', false);
      member.balance = unpaidCons?.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0) || 0;

      const { data: prof } = await supabaseClient
        .from('profiles')
        .select('credit_balance')
        .eq('id', member.id)
        .maybeSingle();
      if (prof && prof.credit_balance !== undefined && prof.credit_balance !== null) {
        member.credit_balance = prof.credit_balance;
      }
    } catch (err) {
      console.warn("Erreur actualisation solde membre:", err);
    }

    // Activer la cible de service
    window.servingMemberTarget = member;

    // Basculer vers l'onglet "Consommations Club"
    switchSection('management');

    // Mettre à jour l'interface Consommations Club pour ce membre
    renderManagementUI();

    // Défiler vers le haut pour voir la bannière de commande
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  window.serveDrinksForMember = window.openBuvetteForMember;

  window.exitServingMemberMode = function () {
    window.servingMemberTarget = null;
    const banner = document.getElementById('serving-member-banner');
    if (banner) banner.classList.add('hidden');

    switchSection('admin');
    loadAppData();
    if (typeof loadAdminData === 'function') loadAdminData();
  };

  window.openBuvetteModal = async function (preselectedMemberId = null) {
    try {
      const modal = document.getElementById('buvette-modal');
      const tbody = document.getElementById('buvette-drinks-list');

      if (!modal || !tbody) {
        alert("Erreur: modal ou tbody introuvable.");
        return;
      }

      tbody.innerHTML = '';

      if (typeof drinks === 'undefined' || !drinks) {
        alert("Erreur: La variable drinks n'est pas définie ou est vide.");
        return;
      }

      const sortedDrinks = [...drinks].sort((a, b) => {
        const catA = getItemCategory(a);
        const catB = getItemCategory(b);
        if (catA !== catB) return catA === 'bar' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      sortedDrinks.forEach(drink => {
        if (isMembership(drink)) return;
        const isBilliard = getItemCategory(drink) === 'billard';
        const catBadge = isBilliard
          ? `<span style="font-size:0.7rem; padding:1px 6px; border-radius:4px; background:rgba(245,158,11,0.2); color:#fcd34d; font-weight:600; margin-left:6px;">🎱 Autres</span>`
          : `<span style="font-size:0.7rem; padding:1px 6px; border-radius:4px; background:rgba(59,130,246,0.15); color:#93c5fd; font-weight:600; margin-left:6px;">🥤 Bar</span>`;

        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid rgba(255, 255, 255, 0.05)';
        tr.innerHTML = `
          <td style="text-align: left; padding: 0.8rem 0.5rem;">
            <div style="font-weight: 600; display:inline-flex; align-items:center;">${drink.name}${catBadge}</div>
          </td>
          <td style="padding: 0.8rem 0.5rem; text-align: center;">${drink.price.toFixed(2)}€</td>
          <td style="padding: 0.8rem 0.5rem; text-align: center;">
            <input type="number" min="0" value="0" class="buvette-qty chakra-input" data-id="${drink.id}" data-price="${drink.price}" style="width: 70px; text-align: center;">
          </td>
          <td style="padding: 0.8rem 0.5rem; text-align: center;">
            <input type="checkbox" class="buvette-free" data-id="${drink.id}" style="width: 1.5rem; height: 1.5rem; cursor: pointer;">
          </td>
        `;
        tbody.appendChild(tr);
      });

      const inputs = tbody.querySelectorAll('.buvette-qty, .buvette-free');
      inputs.forEach(input => {
        input.addEventListener('change', window.calculateBuvetteTotal);
        input.addEventListener('input', window.calculateBuvetteTotal);
      });

      window.calculateBuvetteTotal();

      // Peupler le sélecteur de membre
      await window.populateBuvetteMemberSelect(preselectedMemberId);

      modal.classList.remove('hidden');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (e) {
      alert("Erreur dans openBuvetteModal: " + e.message);
    }
  };

  window.closeBuvetteModal = function () {
    const modal = document.getElementById('buvette-modal');
    if (modal) modal.classList.add('hidden');

    const commentInput = document.getElementById('buvette-comment');
    if (commentInput) commentInput.value = '';
  };

  window.calculateBuvetteTotal = function () {
    const tbody = document.getElementById('buvette-drinks-list');
    if (!tbody) return;

    let total = 0;
    const rows = tbody.querySelectorAll('tr');
    rows.forEach(row => {
      const qtyInput = row.querySelector('.buvette-qty');
      const freeCheck = row.querySelector('.buvette-free');

      if (qtyInput && freeCheck) {
        const qty = parseInt(qtyInput.value) || 0;
        const price = parseFloat(qtyInput.getAttribute('data-price')) || 0;
        const isFree = freeCheck.checked;

        if (qty > 0 && !isFree) {
          total += qty * price;
        }
      }
    });

    const totalEl = document.getElementById('buvette-total');
    if (totalEl) {
      totalEl.textContent = total.toFixed(2) + ' €';
    }
  };

  window.validateBuvetteOrder = async function () {
    const tbody = document.getElementById('buvette-drinks-list');
    if (!tbody) return;

    const commentInput = document.getElementById('buvette-comment');
    const commentValue = commentInput ? commentInput.value.trim() : '';

    const memberSelect = document.getElementById('buvette-member-select');
    const selectedMemberId = memberSelect ? memberSelect.value : '';

    if (!selectedMemberId && !commentValue) {
      alert("Veuillez obligatoirement saisir un commentaire (ex: Soirée, Tournoi, Tournée...) pour une vente externe.");
      return;
    }

    const rows = tbody.querySelectorAll('tr');
    const selectedItems = [];

    rows.forEach(row => {
      const qtyInput = row.querySelector('.buvette-qty');
      const freeCheck = row.querySelector('.buvette-free');

      if (qtyInput && freeCheck) {
        const qty = parseInt(qtyInput.value) || 0;
        if (qty > 0) {
          const id = qtyInput.getAttribute('data-id');
          const price = parseFloat(qtyInput.getAttribute('data-price')) || 0;
          const isFree = freeCheck.checked;

          selectedItems.push({
            drink_id: id,
            quantity: qty,
            price_at_time: isFree ? 0 : price,
            isFree: isFree
          });
        }
      }
    });

    if (selectedItems.length === 0) {
      alert('Aucune boisson sélectionnée.');
      return;
    }

    const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';
    toggleLoading(true);

    try {
      if (!selectedMemberId) {
        // --- CAS 1 : VENTE EXTERNE / RECETTE GÉNÉRALE ---
        const itemsToInsert = selectedItems.map(item => ({
          drink_id: item.drink_id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          member_id: currentUser.id,
          is_paid: true,
          paid_at: new Date().toISOString(),
          paid_by_name: `${adminName} (Buvette : ${commentValue})`,
          recorded_by_name: `${adminName} (Admin)`
        }));

        let { error: insertError } = await supabaseClient.from('consumptions').insert(itemsToInsert);
        if (insertError && (insertError.message?.toLowerCase().includes('foreign key constraint') || insertError.code === '23503')) {
          await ensureUserProfileExists(currentUser);
          const retry = await supabaseClient.from('consumptions').insert(itemsToInsert);
          insertError = retry.error;
        }
        if (insertError) throw insertError;

      } else {
        // --- CAS 2 : COMMANDE SERVANT UN MEMBRE DU CLUB ---
        const paymentModeInput = document.querySelector('input[name="buvette-payment-mode"]:checked');
        const paymentMode = paymentModeInput ? paymentModeInput.value : 'auto';

        const { data: memberProfile } = await supabaseClient
          .from('profiles')
          .select('id, full_name, email, credit_balance')
          .eq('id', selectedMemberId)
          .maybeSingle();

        const memberCredit = parseFloat(memberProfile?.credit_balance) || 0;

        if (paymentMode === 'paid_now') {
          // Paiement direct en espèces / CB au bar
          const itemsToInsert = selectedItems.map(item => ({
            drink_id: item.drink_id,
            quantity: item.quantity,
            price_at_time: item.price_at_time,
            member_id: selectedMemberId,
            is_paid: true,
            paid_at: new Date().toISOString(),
            paid_by_name: `Encaissé au bar (${adminName})${commentValue ? ' - ' + commentValue : ''}`,
            recorded_by_name: `${adminName} (Admin)`
          }));

          let { error: insertError } = await supabaseClient.from('consumptions').insert(itemsToInsert);
          if (insertError && (insertError.message?.toLowerCase().includes('foreign key constraint') || insertError.code === '23503')) {
            await ensureUserProfileExists({ id: selectedMemberId, email: memberProfile?.email });
            const retry = await supabaseClient.from('consumptions').insert(itemsToInsert);
            insertError = retry.error;
          }
          if (insertError) throw insertError;

        } else {
          // Mode auto : Déduction du crédit disponible en priorité, puis mise sur ardoise si crédit épuisé
          let remainingCredit = memberCredit;
          const itemsToInsert = [];

          for (const item of selectedItems) {
            const lineTotal = item.price_at_time * item.quantity;

            if (item.price_at_time === 0) {
              itemsToInsert.push({
                drink_id: item.drink_id,
                quantity: item.quantity,
                price_at_time: 0,
                member_id: selectedMemberId,
                is_paid: true,
                paid_at: new Date().toISOString(),
                paid_by_name: `Gratuit (${adminName})`,
                recorded_by_name: `${adminName} (Admin)`
              });
            } else if (remainingCredit >= lineTotal) {
              // Couvert en totalité par le crédit
              remainingCredit -= lineTotal;
              itemsToInsert.push({
                drink_id: item.drink_id,
                quantity: item.quantity,
                price_at_time: item.price_at_time,
                member_id: selectedMemberId,
                is_paid: true,
                paid_at: new Date().toISOString(),
                paid_by_name: `Crédit prépayé (Servi par ${adminName})`,
                recorded_by_name: `${adminName} (Admin)`
              });
            } else if (remainingCredit > 0) {
              // Couvert partiellement par le crédit
              const covered = remainingCredit;
              const due = lineTotal - remainingCredit;
              remainingCredit = 0;

              itemsToInsert.push({
                drink_id: item.drink_id,
                quantity: 1,
                price_at_time: covered,
                member_id: selectedMemberId,
                is_paid: true,
                paid_at: new Date().toISOString(),
                paid_by_name: `Crédit prépayé partiel (Servi par ${adminName})`,
                recorded_by_name: `${adminName} (Admin)`
              });
              itemsToInsert.push({
                drink_id: item.drink_id,
                quantity: 1,
                price_at_time: due,
                member_id: selectedMemberId,
                is_paid: false,
                recorded_by_name: `${adminName} (Admin)`
              });
            } else {
              // Aucun crédit : ardoise normale
              itemsToInsert.push({
                drink_id: item.drink_id,
                quantity: item.quantity,
                price_at_time: item.price_at_time,
                member_id: selectedMemberId,
                is_paid: false,
                recorded_by_name: `${adminName} (Admin)`
              });
            }
          }

          let { error: insertError } = await supabaseClient.from('consumptions').insert(itemsToInsert);
          if (insertError && (insertError.message?.toLowerCase().includes('foreign key constraint') || insertError.code === '23503')) {
            await ensureUserProfileExists({ id: selectedMemberId, email: memberProfile?.email });
            const retry = await supabaseClient.from('consumptions').insert(itemsToInsert);
            insertError = retry.error;
          }
          if (insertError) throw insertError;

          if (remainingCredit !== memberCredit) {
            await supabaseClient.from('profiles').update({ credit_balance: remainingCredit }).eq('id', selectedMemberId);
          }
        }
      }

      // Décrémenter le stock des boissons
      for (const item of selectedItems) {
        const drink = drinks.find(d => String(d.id) === String(item.drink_id));
        if (drink && isStockManaged(drink)) {
          const newStock = drink.stock - item.quantity;
          await supabaseClient.from('drinks').update({ stock: newStock }).eq('id', drink.id);
          drink.stock = newStock;
        }
      }

      toggleLoading(false);
      window.closeBuvetteModal();
      alert('Consommations enregistrées avec succès !');
      loadAppData();
      if (typeof loadAdminData === 'function') loadAdminData();
      if (typeof loadCaisseMembers === 'function') {
        loadCaisseMembers().then(() => {
          if (caisseSelectedMember && activeCreditMember && caisseSelectedMember.id === activeCreditMember.id) {
            caisseSelectedMember = caisseMembersList.find(m => m.id === caisseSelectedMember.id) || null;
          }
          if (typeof renderCaisseMembers === 'function') renderCaisseMembers(document.getElementById('caisse-member-search')?.value || '');
          if (typeof updateCaisseTicketUI === 'function') updateCaisseTicketUI();
        });
      }

    } catch (err) {
      toggleLoading(false);
      alert("Erreur lors de l'enregistrement de la commande : " + err.message);
    }
  };

  // Affichage du bouton Buvette pour tous les administrateurs
  const buvetteBtn = document.getElementById('buvette-header-btn');
  if (buvetteBtn) {
    // Attach event listener explicitly
    buvetteBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof window.openBuvetteModal === 'function') {
        window.openBuvetteModal();
      } else {
        alert("openBuvetteModal n'est pas définie !");
      }
    });

    if (role === 'admin') {
      buvetteBtn.classList.remove('hidden');
    } else {
      buvetteBtn.classList.add('hidden');
    }
  }

  if (isAdminTabVisible) {
    if (navAdmin) navAdmin.style.display = '';
    if (mobileAdmin) mobileAdmin.style.display = '';

    if (currentSection) {
      switchSection(currentSection);
    } else {
      switchSection(isSuperAdmin ? 'home' : 'admin');
    }
  } else {
    if (navAdmin) navAdmin.style.display = 'none';
    if (mobileAdmin) mobileAdmin.style.display = 'none';

    // Les membres normaux ont le droit d'être sur Accueil ou Gestion
    if (currentSection !== 'management' && currentSection !== 'home') {
      switchSection('home');
    } else if (currentSection) {
      switchSection(currentSection);
    } else {
      switchSection('home');
    }
  }
}

function showInactivityCountdownModal() {
  if (isShowingInactivityModal) return;

  isShowingInactivityModal = true;
  const modal = document.getElementById('inactivity-countdown-modal');
  const display = document.getElementById('inactivity-timer-display');

  if (!modal || !display) return;

  let countdown = 15;
  display.textContent = countdown;
  modal.classList.remove('hidden');

  if (inactivityModalInterval) clearInterval(inactivityModalInterval);

  inactivityModalInterval = setInterval(async () => {
    countdown--;
    display.textContent = countdown;

    if (countdown <= 0) {
      clearInterval(inactivityModalInterval);
      modal.classList.add('hidden');
      isShowingInactivityModal = false;

      // Déconnexion forcée
      if (currentUser) {
        sessionStorage.setItem('locked_email', currentUser.email);
        toggleLoading(true);
        try {
          await supabaseClient.auth.signOut();
          console.log("Session déconnectée automatiquement pour inactivité.");
        } catch (err) {
          console.error("Erreur de déconnexion automatique d'inactivité :", err);
        } finally {
          toggleLoading(false);
        }
      }
    }
  }, 1000);
}

function resetInactivityTimer() {
  if (isShowingInactivityModal) return; // Ne pas réinitialiser si la modale de compte à rebours est affichée

  if (inactivityTimeout) {
    clearTimeout(inactivityTimeout);
  }

  // Si aucun utilisateur n'est connecté, ou s'il s'agit d'un admin, aucun compte à rebours
  if (!currentUser || currentUser.profile?.role === 'admin') {
    return;
  }

  // 45 secondes d'inactivité avant de faire apparaître la modale
  inactivityTimeout = setTimeout(showInactivityCountdownModal, 45000);
}

function initInactivityTracker() {
  const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
  events.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
  });
}

// --- NAVIGATION ---
function initNavigation() {
  // Bouton de déconnexion
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm("Voulez-vous vraiment vous déconnecter ?")) {
        toggleLoading(true);
        const { error } = await supabaseClient.auth.signOut();
        toggleLoading(false);
        if (error) alert("Erreur lors de la déconnexion : " + error.message);
      }
    });
  }

  const navItems = document.querySelectorAll('.nav-menu li');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      switchSection(section);
    });
  });

  // Câblage de la navigation mobile
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const section = item.getAttribute('data-section');
      switchSection(section);
    });
  });

  // Câblage de la modale d'inactivité
  const btnKeepConnected = document.getElementById('btn-keep-connected');
  if (btnKeepConnected) {
    btnKeepConnected.addEventListener('click', () => {
      const modal = document.getElementById('inactivity-countdown-modal');
      if (modal) modal.classList.add('hidden');

      if (inactivityModalInterval) {
        clearInterval(inactivityModalInterval);
        inactivityModalInterval = null;
      }

      isShowingInactivityModal = false;
      resetInactivityTimer();
    });
  }

  // Câblage de la modale de confirmation de boissons
  const btnConfirmDrink = document.getElementById('btn-confirm-drink');
  const btnCancelDrink = document.getElementById('btn-cancel-drink');
  const drinkModal = document.getElementById('drink-order-confirm-modal');
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const drinkConfirmQty = document.getElementById('drink-confirm-qty');
  const drinkConfirmTotal = document.getElementById('drink-confirm-total');

  if (btnQtyMinus && btnQtyPlus && drinkConfirmQty && drinkConfirmTotal) {
    btnQtyMinus.addEventListener('click', () => {
      if (!pendingDrinkOrder) return;
      if (pendingDrinkOrder.quantity > 1) {
        pendingDrinkOrder.quantity--;
        drinkConfirmQty.textContent = pendingDrinkOrder.quantity;
        drinkConfirmTotal.textContent = `${(pendingDrinkOrder.price * pendingDrinkOrder.quantity).toFixed(2)}€`;
        if (typeof updateDrinkModalNotice === 'function') updateDrinkModalNotice(pendingDrinkOrder);
      }
    });

    btnQtyPlus.addEventListener('click', () => {
      if (!pendingDrinkOrder) return;
      pendingDrinkOrder.quantity++;
      drinkConfirmQty.textContent = pendingDrinkOrder.quantity;
      drinkConfirmTotal.textContent = `${(pendingDrinkOrder.price * pendingDrinkOrder.quantity).toFixed(2)}€`;
      if (typeof updateDrinkModalNotice === 'function') updateDrinkModalNotice(pendingDrinkOrder);
    });
  }

  if (btnConfirmDrink) {
    btnConfirmDrink.addEventListener('click', async () => {
      if (!pendingDrinkOrder) return;

      const order = pendingDrinkOrder;
      pendingDrinkOrder = null;

      const { id, name, price, drink, quantity } = order;

      if (drinkModal) drinkModal.classList.add('hidden');
      toggleLoading(true);

      const totalOrderPrice = price * quantity;
      const targetUser = window.servingMemberTarget || currentUser;
      const isServingOther = !!window.servingMemberTarget;
      const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';

      let currentCredit = parseFloat(isServingOther ? targetUser.credit_balance : (currentUser.profile?.credit_balance ?? targetUser.credit_balance)) || 0;
      let itemsToInsert = [];
      let newCredit = currentCredit;

      const recordedBy = isServingOther ? `${adminName} (Admin)` : 'Membre (smartphone)';
      const paidByFull = isServingOther ? `Crédit prépayé (Servi par ${adminName})` : 'Crédit prépayé';
      const paidByPartial = isServingOther ? `Crédit prépayé partiel (Servi par ${adminName})` : 'Crédit prépayé (partiel)';

      if (currentCredit >= totalOrderPrice) {
        newCredit = currentCredit - totalOrderPrice;
        itemsToInsert.push({
          member_id: targetUser.id,
          drink_id: id,
          price_at_time: price,
          quantity: quantity,
          is_paid: true,
          paid_at: new Date().toISOString(),
          paid_by_name: paidByFull,
          recorded_by_name: recordedBy
        });
      } else if (currentCredit > 0) {
        const remainderDue = totalOrderPrice - currentCredit;
        newCredit = 0;
        itemsToInsert.push({
          member_id: targetUser.id,
          drink_id: id,
          price_at_time: currentCredit,
          quantity: 1,
          is_paid: true,
          paid_at: new Date().toISOString(),
          paid_by_name: paidByPartial,
          recorded_by_name: recordedBy
        });
        itemsToInsert.push({
          member_id: targetUser.id,
          drink_id: id,
          price_at_time: remainderDue,
          quantity: 1,
          is_paid: false,
          recorded_by_name: recordedBy
        });
      } else {
        itemsToInsert.push({
          member_id: targetUser.id,
          drink_id: id,
          price_at_time: price,
          quantity: quantity,
          is_paid: false,
          recorded_by_name: recordedBy
        });
      }

      let { error } = await supabaseClient.from('consumptions').insert(itemsToInsert);

      // Auto-réparation si profil manquant dans profiles (violation de clé étrangère)
      if (error && (error.message?.toLowerCase().includes('foreign key constraint') || error.code === '23503')) {
        console.warn("Erreur clé étrangère boisson détectée. Réparation automatique du profil...");
        await ensureUserProfileExists(targetUser);
        const retry = await supabaseClient.from('consumptions').insert(itemsToInsert);
        error = retry.error;
      }

      if (!error) {
        // Mettre à jour credit_balance dans la base et localement si modifié
        if (newCredit !== currentCredit) {
          try {
            await supabaseClient.from('profiles').update({ credit_balance: newCredit }).eq('id', targetUser.id);
          } catch (e) {
            console.warn("Erreur update credit_balance :", e);
          }
          targetUser.credit_balance = newCredit;
          if (!isServingOther && currentUser.profile) currentUser.profile.credit_balance = newCredit;
        }

        // Décrémenter le stock
        if (drink && isStockManaged(drink)) {
          const newStock = drink.stock - quantity;
          await supabaseClient.from('drinks').update({ stock: newStock }).eq('id', id);
          drink.stock = newStock;
        }
      }

      toggleLoading(false);

      if (error) {
        alert(error.message);
        pendingDrinkOrder = order;
      } else {
        if (isServingOther) {
          try {
            const { data: unpaidCons } = await supabaseClient
              .from('consumptions')
              .select('*')
              .eq('member_id', targetUser.id)
              .eq('is_paid', false);
            targetUser.balance = unpaidCons?.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0) || 0;
          } catch (e) { }

          alert(`✅ ${quantity}x ${name} enregistrée(s) pour ${targetUser.full_name} !`);
          renderManagementUI();
        } else {
          loadAppData();
        }
      }
    });
  }

  if (btnCancelDrink) {
    btnCancelDrink.addEventListener('click', () => {
      if (drinkModal) drinkModal.classList.add('hidden');
      pendingDrinkOrder = null;
    });
  }

  // Admin Tabs
  const adminTabs = document.querySelectorAll('.btn-tab');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const paneId = tab.getAttribute('data-tab');
      if (!paneId) return; // Ignorer si ce n'est pas un onglet principal (ex: onglets dans les modales)

      document.querySelectorAll('.btn-tab').forEach(t => {
        if (t.hasAttribute('data-tab')) t.classList.remove('active');
      });
      document.querySelectorAll('.admin-pane').forEach(p => {
        p.classList.remove('active');
        p.style.display = 'none';
      });
      tab.classList.add('active');
      const targetPane = document.getElementById(paneId);
      if (targetPane) {
        targetPane.classList.add('active');
        targetPane.style.display = 'block';
      }

      if (paneId === 'adm-caisse') {
        if (typeof renderCaisseBarUI === 'function') {
          renderCaisseBarUI();
        }
      }

      if (paneId === 'adm-stats') {
        if (typeof renderSalesChart === 'function') {
          renderSalesChart(true);
        }
        if (typeof renderItemsMonthlyChart === 'function') {
          renderItemsMonthlyChart();
        }
      }
    });
  });


  // Modal Changement de Mot de Passe
  const cancelChangePassBtn = document.getElementById('cancel-change-password');
  const changePassModal = document.getElementById('change-password-modal');
  const changePassForm = document.getElementById('change-password-form');

  if (cancelChangePassBtn && changePassModal) {
    cancelChangePassBtn.addEventListener('click', async () => {
      changePassModal.classList.add('hidden');
      if (changePassForm) changePassForm.reset();

      if (isRecoverySession) {
        // Si c'était une session de récupération et que l'utilisateur annule, on le déconnecte
        isRecoverySession = false;
        toggleLoading(true);
        await supabaseClient.auth.signOut();
        showView('login-view');
        toggleLoading(false);
        alert("Action annulée. Vous avez été déconnecté car le mot de passe n'a pas été changé.");
      }
    });
  }

  if (changePassForm) {
    changePassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new-password').value;
      const confirmPassword = document.getElementById('confirm-password').value;

      if (newPassword !== confirmPassword) {
        return alert("❌ Les mots de passe ne correspondent pas.");
      }

      if (newPassword.length < 6) {
        return alert("❌ Le mot de passe doit contenir au moins 6 caractères.");
      }

      toggleLoading(true);
      try {
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
        if (error) {
          alert("❌ Erreur : " + error.message);
        } else {
          alert("✅ Votre mot de passe a été mis à jour avec succès !");
          isRecoverySession = false;
          changePassModal.classList.add('hidden');
          changePassForm.reset();
        }
      } catch (err) {
        alert("❌ Une erreur inattendue est survenue : " + err.message);
      } finally {
        toggleLoading(false);
      }
    });
  }

  // Modal Mot de passe oublié (Demande par E-mail)
  const forgotPassLink = document.getElementById('btn-forgot-password');
  const forgotPassModal = document.getElementById('forgot-password-modal');
  const cancelForgotPassBtn = document.getElementById('cancel-forgot-password');
  const forgotPassForm = document.getElementById('forgot-password-form');

  if (forgotPassLink && forgotPassModal) {
    forgotPassLink.addEventListener('click', (e) => {
      e.preventDefault();
      forgotPassModal.classList.remove('hidden');
    });
  }

  if (cancelForgotPassBtn && forgotPassModal) {
    cancelForgotPassBtn.addEventListener('click', () => {
      forgotPassModal.classList.add('hidden');
      if (forgotPassForm) forgotPassForm.reset();
    });
  }

  if (forgotPassForm) {
    forgotPassForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('forgot-email').value;

      toggleLoading(true);
      try {
        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + window.location.pathname
        });

        if (error) {
          alert("❌ Erreur : " + error.message);
        } else {
          alert("📩 Un e-mail de réinitialisation a été envoyé ! Veuillez vérifier votre boîte de réception.");
          forgotPassModal.classList.add('hidden');
          forgotPassForm.reset();
        }
      } catch (err) {
        alert("❌ Une erreur est survenue : " + err.message);
      } finally {
        toggleLoading(false);
      }
    });
  }
}

function switchSection(name) {
  const role = (currentUser?.profile?.role || 'member').trim().toLowerCase();
  const isAdmin = (role === 'admin');

  if (!isAdmin && (name === 'admin' || name === 'caisse')) {
    name = 'home';
  }

  // Si on quitte l'onglet Consommations Club alors qu'on servait un membre, on désactive le mode
  if (name !== 'management' && window.servingMemberTarget) {
    window.servingMemberTarget = null;
    const banner = document.getElementById('serving-member-banner');
    if (banner) banner.classList.add('hidden');
  }

  document.querySelectorAll('.nav-menu li').forEach(i => i.classList.remove('active'));
  const sidebarItem = document.querySelector(`.nav-menu li[data-section="${name}"]`);
  if (sidebarItem) sidebarItem.classList.add('active');

  document.querySelectorAll('.mobile-nav-item').forEach(i => i.classList.remove('active'));
  const mobileItem = document.querySelector(`.mobile-nav-item[data-section="${name}"]`);
  if (mobileItem) mobileItem.classList.add('active');

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById(`section-${name}`);
  if (targetView) targetView.classList.add('active');

  if (name === 'management') renderManagementUI();
  if (name === 'admin') loadAdminData();
  if (name === 'caisse') renderCaisseBarUI();
}

// --- MODULE CAISSE BAR & BUVETTE ---
let caisseCart = new Map(); // drinkId -> { drink, qty }
let caisseSelectedMember = null; // null = Vente Directe / Visiteur (ou Gratuit si caisseIsFreeMode === true)
let caisseIsFreeMode = false; // true = Retrait de stock sans paiement (Gratuit / Offert)
let caisseActiveCategory = 'bar'; // Seules catégories : 'bar' ou 'billard'
let caisseMembersList = [];

async function renderCaisseBarUI() {
  caisseCart.clear();
  caisseSelectedMember = null;
  caisseIsFreeMode = false;
  caisseActiveCategory = 'bar';
  const sumupCfgBtn = document.getElementById('caisse-sumup-config-btn');
  if (sumupCfgBtn) {
    sumupCfgBtn.style.display = isSumUpConfigOwner() ? 'inline-flex' : 'none';
  }
  const freeBtn = document.getElementById('caisse-free-client-btn');
  const directBtn = document.getElementById('caisse-direct-client-btn');
  if (freeBtn) freeBtn.classList.remove('active');
  if (directBtn) directBtn.classList.add('active');
  const freeCommentInput = document.getElementById('caisse-free-comment');
  if (freeCommentInput) freeCommentInput.value = '';

  // 1. S'assurer que les boissons sont disponibles en mémoire
  if ((!drinks || drinks.length === 0) && supabaseClient) {
    try {
      const { data: drks } = await supabaseClient.from('drinks').select('*');
      if (drks) drinks = drks;
    } catch (e) {
      console.warn("Erreur chargement boissons caisse:", e);
    }
  }
  window.drinks = drinks;

  // 2. Rendu immédiat des produits et du ticket
  renderCaisseProducts();
  updateCaisseTicketUI();

  // 3. Rendu immédiat des membres depuis le cache si disponible
  if (window.allMembersList && window.allMembersList.length > 0) {
    caisseMembersList = window.allMembersList.map(m => {
      const unpaid = (m.consumptions || []).filter(c => !c.is_paid);
      const balance = unpaid.reduce((sum, c) => sum + ((c.price_at_time || 0) * (c.quantity || 1)), 0);
      return {
        ...m,
        credit: parseFloat(m.credit_balance) || 0,
        balance: balance
      };
    });
    renderCaisseMembers();
  }

  // 4. Chargement / rafraîchissement complet depuis Supabase
  await loadCaisseMembers();
  renderCaisseMembers();
  renderCaisseProducts();
  updateCaisseTicketUI();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function loadCaisseMembers() {
  try {
    const { data: members, error } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email, role, credit_balance, avatar_url, can_manage_stock')
      .order('full_name', { ascending: true });
    if (error) throw error;

    const { data: unpaid } = await supabaseClient
      .from('consumptions')
      .select('member_id, price_at_time, quantity')
      .eq('is_paid', false);

    const balanceMap = {};
    if (unpaid) {
      unpaid.forEach(c => {
        const amt = (c.price_at_time || 0) * (c.quantity || 1);
        balanceMap[c.member_id] = (balanceMap[c.member_id] || 0) + amt;
      });
    }

    caisseMembersList = (members || []).map(m => ({
      ...m,
      credit: parseFloat(m.credit_balance) || 0,
      balance: balanceMap[m.id] || 0
    }));
  } catch (err) {
    console.warn("Erreur chargement membres caisse :", err);
    if ((!caisseMembersList || caisseMembersList.length === 0) && window.allMembersList && window.allMembersList.length > 0) {
      caisseMembersList = window.allMembersList.map(m => ({
        ...m,
        credit: parseFloat(m.credit_balance) || 0,
        balance: 0
      }));
    }
  }
}

function renderCaisseMembers(filterText = '') {
  const container = document.getElementById('caisse-members-list');
  if (!container) return;

  const search = (filterText || '').toLowerCase().trim();
  const filtered = (caisseMembersList || []).filter(m => {
    const name = (m.full_name || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.85rem;">Aucun membre trouvé</div>`;
    return;
  }

  container.innerHTML = filtered.map(m => {
    const isSelected = caisseSelectedMember && caisseSelectedMember.id === m.id;
    const initial = (m.full_name || m.email || '?')[0].toUpperCase();

    let soldeHtml = '';
    if (m.credit > 0) {
      soldeHtml = `<span class="caisse-member-solde-tag caisse-solde-positive">+${m.credit.toFixed(2).replace('.', ',')} €</span>`;
    } else if (m.balance > 0) {
      soldeHtml = `<span class="caisse-member-solde-tag caisse-solde-negative">-${m.balance.toFixed(2).replace('.', ',')} €</span>`;
    } else {
      soldeHtml = `<span class="caisse-member-solde-tag caisse-solde-neutral">0,00 €</span>`;
    }

    const avatarHtml = m.avatar_url
      ? `<img src="${m.avatar_url}" alt="${m.full_name}">`
      : `<span>${initial}</span>`;

    return `
      <div class="caisse-member-card ${isSelected ? 'active' : ''}" onclick="selectCaisseClient('${m.id}')">
        <div class="caisse-member-avatar">
          ${avatarHtml}
        </div>
        <div class="caisse-member-details">
          <div class="caisse-member-name">${m.full_name || m.email}</div>
          <div class="caisse-member-sub">${m.role === 'admin' ? 'Administrateur' : 'Adhérent'}</div>
        </div>
        <div>
          ${soldeHtml}
        </div>
      </div>
    `;
  }).join('');
}

function filterCaisseMembers() {
  const input = document.getElementById('caisse-member-search');
  renderCaisseMembers(input ? input.value : '');
}

function selectCaisseClient(memberId) {
  const isSameFree = (memberId === 'FREE' && caisseIsFreeMode);
  const isSameDirect = (!memberId && !caisseIsFreeMode && !caisseSelectedMember);
  const isSameMember = (memberId && memberId !== 'FREE' && caisseSelectedMember && String(caisseSelectedMember.id) === String(memberId));

  if (isSameFree || isSameDirect || isSameMember) {
    return;
  }

  if (caisseCart.size > 0) {
    alert(
      "⚠️ Attention : une commande est déjà en cours sur le ticket !\n\n" +
      "La commande en cours va être annulée si vous changez de personne.\n" +
      "Veuillez obligatoirement cliquer sur le bouton « Réinitialiser » (en haut du ticket) avant de pouvoir servir quelqu'un d'autre."
    );
    return;
  }

  const directBtn = document.getElementById('caisse-direct-client-btn');
  const freeBtn = document.getElementById('caisse-free-client-btn');

  if (memberId === 'FREE') {
    caisseIsFreeMode = true;
    caisseSelectedMember = null;
    if (freeBtn) freeBtn.classList.add('active');
    if (directBtn) directBtn.classList.remove('active');
  } else if (!memberId) {
    caisseIsFreeMode = false;
    caisseSelectedMember = null;
    if (directBtn) directBtn.classList.add('active');
    if (freeBtn) freeBtn.classList.remove('active');
  } else {
    caisseIsFreeMode = false;
    if (directBtn) directBtn.classList.remove('active');
    if (freeBtn) freeBtn.classList.remove('active');
    caisseSelectedMember = (caisseMembersList || []).find(m => m.id === memberId) || null;
  }

  document.querySelectorAll('.caisse-member-card:not(.caisse-member-direct):not(.caisse-member-free)').forEach(card => {
    card.classList.remove('active');
  });
  if (memberId && memberId !== 'FREE') {
    renderCaisseMembers(document.getElementById('caisse-member-search')?.value || '');
  }

  updateCaisseTicketUI();
}

function filterCaisseCategory(cat) {
  caisseActiveCategory = (cat === 'billard') ? 'billard' : 'bar';
  document.querySelectorAll('.caisse-cat-tab').forEach(t => t.classList.remove('active'));
  const activeTab = Array.from(document.querySelectorAll('.caisse-cat-tab')).find(t =>
    (caisseActiveCategory === 'bar' && t.textContent.includes('Bar')) ||
    (caisseActiveCategory === 'billard' && (t.textContent.includes('Autres') || t.textContent.includes('Billard')))
  );
  if (activeTab) activeTab.classList.add('active');
  renderCaisseProducts();
}

function getCaisseProductIcon(drink) {
  const cat = typeof getItemCategory === 'function' ? getItemCategory(drink) : 'bar';
  const defaultIcon = cat === 'billard' ? 'circle-dot' : 'cup-soda';
  const iconName = drink.icon || defaultIcon;
  return `<i data-lucide="${iconName}" style="width: 22px; height: 22px;"></i>`;
}

function renderCaisseProducts() {
  const container = document.getElementById('caisse-products-grid');
  if (!container) return;

  const currentDrinks = (typeof drinks !== 'undefined' && drinks && drinks.length > 0) ? drinks : (window.drinks || []);
  const filtered = currentDrinks.filter(d => {
    if (d.archived) return false;
    const cat = typeof getItemCategory === 'function' ? getItemCategory(d) : 'bar';
    return cat === caisseActiveCategory;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; padding:2rem; color:var(--text-muted); font-size:0.9rem;">Aucun article dans la catégorie "${caisseActiveCategory === 'billard' ? 'Autres' : 'Bar / Snack'}"</div>`;
    return;
  }

  container.innerHTML = filtered.map(d => {
    const inCart = caisseCart.get(d.id);
    const qty = inCart ? inCart.qty : 0;
    const icon = getCaisseProductIcon(d);
    const visualHtml = d.image_url
      ? `<img src="${d.image_url}" alt="${d.name}" class="caisse-product-img">`
      : `<div class="caisse-product-icon">${icon}</div>`;
    const price = (d.price || 0).toFixed(2).replace('.', ',');

    let stockText = '';
    let stockClass = '';
    if (isStockManaged(d)) {
      if (d.stock <= 0) {
        stockText = 'Épuisé';
        stockClass = 'out-of-stock';
      } else if (d.stock <= 5) {
        stockText = `Reste : ${d.stock}`;
        stockClass = 'low-stock';
      } else {
        stockText = `Stock : ${d.stock}`;
      }
    }

    return `
      <div class="caisse-product-tile ${qty > 0 ? 'in-cart' : ''}" onclick="addCaisseProduct(${d.id})">
        ${qty > 0 ? `<div class="caisse-product-qty-badge">x${qty}</div>` : ''}
        ${visualHtml}
        <div class="caisse-product-name">${d.name}</div>
        <div class="caisse-product-price">${price} €</div>
        ${stockText ? `<div class="caisse-product-stock ${stockClass}">${stockText}</div>` : ''}
      </div>
    `;
  }).join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addCaisseProduct(drinkId) {
  const currentDrinks = (typeof drinks !== 'undefined' && drinks && drinks.length > 0) ? drinks : (window.drinks || []);
  const drink = currentDrinks.find(d => d.id === drinkId);
  if (!drink) return;

  if (caisseCart.has(drinkId)) {
    caisseCart.get(drinkId).qty += 1;
  } else {
    caisseCart.set(drinkId, { drink, qty: 1 });
  }

  renderCaisseProducts();
  updateCaisseTicketUI();
}

function changeCaisseQty(drinkId, delta) {
  if (!caisseCart.has(drinkId)) return;
  const item = caisseCart.get(drinkId);
  item.qty += delta;
  if (item.qty <= 0) {
    caisseCart.delete(drinkId);
  }
  renderCaisseProducts();
  updateCaisseTicketUI();
}

function resetCaisseCart(silent = false) {
  if (!silent && caisseCart.size > 0) {
    if (!confirm("⚠️ Attention : la commande en cours va être annulée et le ticket sera remis à zéro.\n\nConfirmez-vous la réinitialisation ?")) {
      return;
    }
  }
  caisseCart.clear();
  const freeCommentInput = document.getElementById('caisse-free-comment');
  if (freeCommentInput) freeCommentInput.value = '';
  renderCaisseProducts();
  updateCaisseTicketUI();
}

function updateCaisseTicketUI() {
  const clientNameEl = document.getElementById('caisse-ticket-client-name');
  const soldeBox = document.getElementById('caisse-member-solde-box');
  const freeBox = document.getElementById('caisse-free-box');
  const currentSoldeEl = document.getElementById('caisse-current-solde');
  const itemsContainer = document.getElementById('caisse-ticket-items');
  const totalEl = document.getElementById('caisse-total-amount');
  const projectedRow = document.getElementById('caisse-projected-solde-row');
  const projectedEl = document.getElementById('caisse-projected-solde');
  const btnArdoise = document.getElementById('caisse-btn-ardoise');
  const secondaryPayBtns = document.getElementById('caisse-secondary-pay-btns');

  if (caisseIsFreeMode) {
    if (clientNameEl) clientNameEl.innerHTML = `Mode : <strong style="color:#e2e8f0;">Sortie de Stock / Offert</strong>`;
    if (soldeBox) soldeBox.classList.add('hidden');
    if (freeBox) freeBox.classList.remove('hidden');
    if (projectedRow) projectedRow.classList.add('hidden');
    if (secondaryPayBtns) secondaryPayBtns.style.display = 'none';
    if (btnArdoise) {
      btnArdoise.innerHTML = `<i data-lucide="check" style="width:16px; height:16px;"></i> Valider la sortie de stock (0,00 €)`;
    }
  } else if (!caisseSelectedMember) {
    if (clientNameEl) clientNameEl.innerHTML = `Client : <strong style="color:#e2e8f0;">Vente Directe (Visiteur)</strong>`;
    if (soldeBox) soldeBox.classList.add('hidden');
    if (freeBox) freeBox.classList.add('hidden');
    if (projectedRow) projectedRow.classList.add('hidden');
    if (secondaryPayBtns) secondaryPayBtns.style.display = 'grid';
    if (btnArdoise) {
      btnArdoise.innerHTML = `<i data-lucide="check" style="width:16px; height:16px;"></i> Valider l'encaissement direct`;
    }
  } else {
    const m = caisseSelectedMember;
    const btnEncaisserArdoise = document.getElementById('caisse-btn-encaisser-ardoise');
    const btnSumupArdoise = document.getElementById('caisse-btn-sumup-ardoise');
    if (clientNameEl) clientNameEl.innerHTML = `Client : <strong style="color:var(--text-main);">${m.full_name || m.email}</strong>`;
    if (freeBox) freeBox.classList.add('hidden');
    if (secondaryPayBtns) secondaryPayBtns.style.display = 'grid';
    if (soldeBox) {
      soldeBox.classList.remove('hidden');
      if (m.credit > 0) {
        currentSoldeEl.innerHTML = `<span style="color:#34d399;">+${m.credit.toFixed(2).replace('.', ',')} € (Crédit)</span>`;
      } else if (m.balance > 0) {
        currentSoldeEl.innerHTML = `<span style="color:#f87171;">-${m.balance.toFixed(2).replace('.', ',')} € (Ardoise)</span>`;
      } else {
        currentSoldeEl.innerHTML = `<span style="color:var(--text-muted);">0,00 €</span>`;
      }
      if (btnEncaisserArdoise) {
        if (m.balance > 0) {
          btnEncaisserArdoise.classList.remove('hidden');
          btnEncaisserArdoise.style.display = 'inline-flex';
        } else {
          btnEncaisserArdoise.classList.add('hidden');
          btnEncaisserArdoise.style.display = 'none';
        }
      }
      if (btnSumupArdoise) {
        if (m.balance > 0) {
          btnSumupArdoise.classList.remove('hidden');
          btnSumupArdoise.style.display = 'inline-flex';
        } else {
          btnSumupArdoise.classList.add('hidden');
          btnSumupArdoise.style.display = 'none';
        }
      }
    }
    if (btnArdoise) {
      btnArdoise.innerHTML = `<i data-lucide="check" style="width:16px; height:16px;"></i> Enregistrer sur le compte`;
    }
  }

  let total = 0;
  if (caisseCart.size === 0) {
    if (itemsContainer) {
      itemsContainer.innerHTML = `
        <div class="caisse-empty-ticket">
          <i data-lucide="shopping-bag" style="width:32px; height:32px; opacity:0.25; margin-bottom:8px;"></i>
          <div>Aucun article sélectionné</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:3px;">Sélectionnez un article dans la liste</div>
        </div>
      `;
    }
    if (btnArdoise) btnArdoise.disabled = true;
  } else {
    if (btnArdoise) btnArdoise.disabled = false;
    let rowsHtml = '';
    caisseCart.forEach((item, id) => {
      const unitPrice = caisseIsFreeMode ? 0 : (item.drink.price || 0);
      const lineTotal = unitPrice * item.qty;
      total += lineTotal;
      const subText = caisseIsFreeMode
        ? `<span style="color:#94a3b8;">Offert (0,00 €)</span>`
        : `${(item.drink.price || 0).toFixed(2).replace('.', ',')} € / u`;
      rowsHtml += `
        <div class="caisse-ticket-row">
          <div>
            <div class="caisse-ticket-row-title">${item.drink.name}</div>
            <div class="caisse-ticket-row-sub">${subText}</div>
          </div>
          <div class="caisse-ticket-row-controls">
            <button class="caisse-btn-mini" onclick="changeCaisseQty(${id}, -1)">-</button>
            <span class="caisse-ticket-qty">${item.qty}</span>
            <button class="caisse-btn-mini" onclick="changeCaisseQty(${id}, 1)">+</button>
            <span class="caisse-ticket-price">${lineTotal.toFixed(2).replace('.', ',')} €</span>
          </div>
        </div>
      `;
    });
    if (itemsContainer) itemsContainer.innerHTML = rowsHtml;
  }

  if (totalEl) totalEl.textContent = `${total.toFixed(2).replace('.', ',')} €`;

  if (caisseSelectedMember && projectedRow && projectedEl && total > 0) {
    projectedRow.classList.remove('hidden');
    const m = caisseSelectedMember;
    if (m.credit >= total) {
      const newCred = m.credit - total;
      projectedEl.innerHTML = `<span style="color:#10b981;">+${newCred.toFixed(2).replace('.', ',')} € (Crédit restant)</span>`;
    } else if (m.credit > 0) {
      const remainingArdoise = total - m.credit;
      projectedEl.innerHTML = `<span style="color:#ef4444;">-${remainingArdoise.toFixed(2).replace('.', ',')} € (Nouvelle ardoise)</span>`;
    } else {
      const newArdoise = (m.balance || 0) + total;
      projectedEl.innerHTML = `<span style="color:#ef4444;">-${newArdoise.toFixed(2).replace('.', ',')} € (Ardoise)</span>`;
    }
  } else if (projectedRow) {
    projectedRow.classList.add('hidden');
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openCaisseRechargeModal() {
  if (!caisseSelectedMember) return;
  const m = caisseSelectedMember;
  window.openCreditModal(m.id, m.full_name || m.email, m.credit);
}

async function clearCaisseMemberArdoise(mode = 'especes') {
  if (!caisseSelectedMember) return;
  const memberName = caisseSelectedMember.full_name || caisseSelectedMember.email || 'ce membre';
  const amountVal = caisseSelectedMember.balance || 0;
  const amountStr = amountVal.toFixed(2).replace('.', ',');

  if (mode === 'sumup') {
    const ok = await processSumUpSoloPayment(amountVal, `Ardoise BC41 - ${memberName}`);
    if (!ok) return;
    await clearMemberBalance(caisseSelectedMember.id, memberName, amountStr, 'SumUp CB', true);
  } else {
    await clearMemberBalance(caisseSelectedMember.id, memberName, amountStr, 'Espèces', false);
  }

  await loadCaisseMembers();
  caisseSelectedMember = caisseMembersList.find(m => m.id === caisseSelectedMember.id) || null;
  renderCaisseMembers(document.getElementById('caisse-member-search')?.value || '');
  updateCaisseTicketUI();
}
window.clearCaisseMemberArdoise = clearCaisseMemberArdoise;

async function submitCaisseOrder(paymentMode = 'auto') {
  if (caisseCart.size === 0) {
    alert("Veuillez sélectionner au moins un article.");
    return;
  }

  const freeCommentInput = document.getElementById('caisse-free-comment');
  const freeCommentValue = freeCommentInput ? freeCommentInput.value.trim() : '';

  if (caisseIsFreeMode && !freeCommentValue) {
    alert("⚠️ Veuillez obligatoirement saisir un commentaire (ex: Soirée, Tournoi, Bénévoles...) pour un retrait de stock sans paiement.");
    if (freeCommentInput) freeCommentInput.focus();
    return;
  }

  const selectedItems = [];
  let totalOrderAmount = 0;
  caisseCart.forEach((item, id) => {
    const unitPrice = caisseIsFreeMode ? 0 : (item.drink.price || 0);
    totalOrderAmount += unitPrice * item.qty;
    selectedItems.push({
      drink_id: id,
      quantity: item.qty,
      price_at_time: unitPrice,
      name: item.drink.name
    });
  });

  const itemsSummary = selectedItems.map(i => `- ${i.quantity}x ${i.name}`).join('\n');
  const totalFormatted = totalOrderAmount.toFixed(2).replace('.', ',');
  let confirmMessage = '';

  if (caisseIsFreeMode) {
    confirmMessage = `Confirmez-vous cette sortie de stock gratuite (0,00 €) ?\nMotif : ${freeCommentValue}\n\nArticles :\n${itemsSummary}`;
  } else if (!caisseSelectedMember) {
    const modeLabel = paymentMode === 'cash' ? 'Espèces' : (paymentMode === 'card' ? 'Carte / Direct' : 'Encaissement direct');
    confirmMessage = `Confirmez-vous cette Vente Directe (Visiteur) de ${totalFormatted} € (${modeLabel}) ?\n\nArticles :\n${itemsSummary}`;
  } else {
    const memberName = caisseSelectedMember.full_name || caisseSelectedMember.email || 'ce membre';
    if (paymentMode === 'cash') {
      confirmMessage = `Confirmez-vous l'encaissement en Espèces de ${totalFormatted} € pour ${memberName} ?\n\nArticles :\n${itemsSummary}`;
    } else if (paymentMode === 'card') {
      confirmMessage = `Confirmez-vous l'encaissement par Carte / Direct de ${totalFormatted} € pour ${memberName} ?\n\nArticles :\n${itemsSummary}`;
    } else {
      confirmMessage = `Confirmez-vous l'enregistrement sur le compte de ${memberName} pour un total de ${totalFormatted} € ?\n\nArticles :\n${itemsSummary}`;
    }
  }

  if (paymentMode === 'card' && !caisseIsFreeMode && totalOrderAmount > 0 && isSumUpEnabled()) {
    const targetLabel = caisseSelectedMember
      ? `Bar BC41 - ${caisseSelectedMember.full_name || caisseSelectedMember.email}`
      : `Bar BC41 - Vente Directe`;
    const paidOnSolo = await processSumUpSoloPayment(totalOrderAmount, targetLabel);
    if (!paidOnSolo) return;
  } else {
    if (!confirm(confirmMessage)) return;
  }

  const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';
  toggleLoading(true);

  try {
    if (caisseIsFreeMode) {
      const itemsToInsert = selectedItems.map(item => ({
        drink_id: item.drink_id,
        quantity: item.quantity,
        price_at_time: 0,
        member_id: currentUser.id,
        is_paid: true,
        paid_at: new Date().toISOString(),
        paid_by_name: `${adminName} (Buvette : ${freeCommentValue})`,
        recorded_by_name: `${adminName} (Admin)`
      }));

      let { error: insertError } = await supabaseClient.from('consumptions').insert(itemsToInsert);
      if (insertError) throw insertError;

    } else if (!caisseSelectedMember) {
      const modeLabel = paymentMode === 'cash' ? 'Espèces' : (paymentMode === 'card' ? 'CB' : 'Direct');
      const itemsToInsert = selectedItems.map(item => ({
        drink_id: item.drink_id,
        quantity: item.quantity,
        price_at_time: item.price_at_time,
        member_id: currentUser.id,
        is_paid: true,
        paid_at: new Date().toISOString(),
        paid_by_name: `${adminName} (Buvette : Vente directe ${modeLabel})`,
        recorded_by_name: `${adminName} (Admin)`
      }));

      let { error: insertError } = await supabaseClient.from('consumptions').insert(itemsToInsert);
      if (insertError) throw insertError;

    } else {
      const memberId = caisseSelectedMember.id;
      const { data: memberProfile } = await supabaseClient
        .from('profiles')
        .select('id, full_name, email, credit_balance')
        .eq('id', memberId)
        .maybeSingle();

      const memberCredit = parseFloat(memberProfile?.credit_balance) || 0;

      if (paymentMode === 'cash' || paymentMode === 'card') {
        const modeLabel = paymentMode === 'cash' ? 'Espèces' : 'CB';
        const itemsToInsert = selectedItems.map(item => ({
          drink_id: item.drink_id,
          quantity: item.quantity,
          price_at_time: item.price_at_time,
          member_id: memberId,
          is_paid: true,
          paid_at: new Date().toISOString(),
          paid_by_name: `Encaissé au bar (${adminName} - ${modeLabel})`,
          recorded_by_name: `${adminName} (Admin)`
        }));

        let { error: insertError } = await supabaseClient.from('consumptions').insert(itemsToInsert);
        if (insertError) throw insertError;

      } else {
        let remainingCredit = memberCredit;
        const itemsToInsert = [];

        for (const item of selectedItems) {
          const lineTotal = item.price_at_time * item.quantity;

          if (item.price_at_time === 0) {
            itemsToInsert.push({
              drink_id: item.drink_id,
              quantity: item.quantity,
              price_at_time: 0,
              member_id: memberId,
              is_paid: true,
              paid_at: new Date().toISOString(),
              paid_by_name: `Gratuit (${adminName})`,
              recorded_by_name: `${adminName} (Admin)`
            });
          } else if (remainingCredit >= lineTotal) {
            remainingCredit -= lineTotal;
            itemsToInsert.push({
              drink_id: item.drink_id,
              quantity: item.quantity,
              price_at_time: item.price_at_time,
              member_id: memberId,
              is_paid: true,
              paid_at: new Date().toISOString(),
              paid_by_name: `Crédit prépayé (Servi par ${adminName})`,
              recorded_by_name: `${adminName} (Admin)`
            });
          } else if (remainingCredit > 0) {
            const covered = remainingCredit;
            const due = lineTotal - remainingCredit;
            remainingCredit = 0;

            itemsToInsert.push({
              drink_id: item.drink_id,
              quantity: 1,
              price_at_time: covered,
              member_id: memberId,
              is_paid: true,
              paid_at: new Date().toISOString(),
              paid_by_name: `Crédit prépayé partiel (Servi par ${adminName})`,
              recorded_by_name: `${adminName} (Admin)`
            });
            itemsToInsert.push({
              drink_id: item.drink_id,
              quantity: 1,
              price_at_time: due,
              member_id: memberId,
              is_paid: false,
              recorded_by_name: `${adminName} (Admin)`
            });
          } else {
            itemsToInsert.push({
              drink_id: item.drink_id,
              quantity: item.quantity,
              price_at_time: item.price_at_time,
              member_id: memberId,
              is_paid: false,
              recorded_by_name: `${adminName} (Admin)`
            });
          }
        }

        let { error: insertError } = await supabaseClient.from('consumptions').insert(itemsToInsert);
        if (insertError) throw insertError;

        if (remainingCredit !== memberCredit) {
          await supabaseClient.from('profiles').update({ credit_balance: remainingCredit }).eq('id', memberId);
        }
      }
    }

    for (const item of selectedItems) {
      const currentDrinks = (typeof drinks !== 'undefined' && drinks && drinks.length > 0) ? drinks : (window.drinks || []);
      const drink = currentDrinks.find(d => String(d.id) === String(item.drink_id));
      if (drink && isStockManaged(drink)) {
        const newStock = drink.stock - item.quantity;
        await supabaseClient.from('drinks').update({ stock: newStock }).eq('id', drink.id);
        drink.stock = newStock;
      }
    }

    toggleLoading(false);

    const toastClient = caisseIsFreeMode
      ? `Retrait gratuit (${freeCommentValue})`
      : (caisseSelectedMember ? (caisseSelectedMember.full_name || caisseSelectedMember.email) : 'Vente Directe');
    alert(`✅ Commande enregistrée pour ${toastClient} !`);

    caisseCart.clear();
    if (freeCommentInput) freeCommentInput.value = '';
    await loadCaisseMembers();
    if (caisseSelectedMember) {
      caisseSelectedMember = caisseMembersList.find(m => m.id === caisseSelectedMember.id) || null;
    }
    renderCaisseMembers(document.getElementById('caisse-member-search')?.value || '');
    renderCaisseProducts();
    updateCaisseTicketUI();

    if (typeof loadAppData === 'function') loadAppData();
    if (typeof loadAdminData === 'function') loadAdminData();

  } catch (err) {
    toggleLoading(false);
    alert("Erreur lors de l'enregistrement : " + err.message);
  }
}

window.selectCaisseClient = selectCaisseClient;
window.filterCaisseMembers = filterCaisseMembers;
window.filterCaisseCategory = filterCaisseCategory;
window.addCaisseProduct = addCaisseProduct;
window.changeCaisseQty = changeCaisseQty;
window.resetCaisseCart = resetCaisseCart;
window.openCaisseRechargeModal = openCaisseRechargeModal;
window.submitCaisseOrder = submitCaisseOrder;
window.renderCaisseBarUI = renderCaisseBarUI;


// --- AUTO-RÉPARATION ET SYNCHRONISATION DU PROFIL ---
async function ensureUserProfileExists(user = currentUser) {
  if (!user || !user.id || !user.email) return null;

  try {
    // 1. Vérifier si le profil existe déjà dans la table 'profiles'
    const { data: existingProfile, error: fetchErr } = await supabaseClient
      .from('profiles')
      .select('*, subscriptions(*, subscription_types(*))')
      .eq('id', user.id)
      .maybeSingle();

    if (existingProfile) {
      return existingProfile;
    }

    console.warn("Profil manquant dans la table 'profiles' pour :", user.email, "-> Réparation automatique...");

    // 2. Récupérer les informations pré-configurées dans 'imported_members'
    const cleanEmail = user.email.toLowerCase().trim();
    const { data: imported } = await supabaseClient
      .from('imported_members')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    const isSuperAdmin = cleanEmail === 'sebastien.tessier41@orange.fr';
    const fullName = imported?.full_name?.trim() || user.user_metadata?.full_name || user.email.split('@')[0];
    const role = isSuperAdmin ? 'admin' : (imported?.role || 'member');
    const canManageStock = isSuperAdmin || (imported?.can_manage_stock === true);
    const isApproved = isSuperAdmin || (imported?.is_approved === true);
    const avatarUrl = imported?.avatar_url || null;

    const payload = {
      id: user.id,
      email: cleanEmail,
      full_name: fullName,
      role: role,
      can_manage_stock: canManageStock,
      is_approved: isApproved,
      avatar_url: avatarUrl
    };

    // 3. Insérer / mettre à jour le profil dans 'profiles'
    const { data: upsertedProfile, error: upsertErr } = await supabaseClient
      .from('profiles')
      .upsert(payload)
      .select('*, subscriptions(*, subscription_types(*))')
      .maybeSingle();

    if (upsertErr) {
      console.error("Échec de l'auto-création du profil dans 'profiles' :", upsertErr);
      return {
        ...payload,
        subscriptions: []
      };
    }

    // 4. Synchroniser un abonnement pré-configuré s'il existe dans imported_members
    if (imported?.subscription_type_id && imported?.subscription_end_date) {
      try {
        const { data: existingSubs } = await supabaseClient
          .from('subscriptions')
          .select('id')
          .eq('member_id', user.id)
          .limit(1);

        if (!existingSubs || existingSubs.length === 0) {
          await supabaseClient.from('subscriptions').insert({
            member_id: user.id,
            type_id: imported.subscription_type_id,
            start_date: new Date().toISOString().split('T')[0],
            end_date: imported.subscription_end_date
          });
        }
      } catch (subErr) {
        console.warn("Abonnement initial non synchronisé :", subErr);
      }
    }

    console.log("Profil réparé et synchronisé avec succès pour :", user.email);
    return upsertedProfile || payload;
  } catch (err) {
    console.error("Exception dans ensureUserProfileExists :", err);
    return null;
  }
}

// --- DATA LOADING ---
async function loadAppData() {
  toggleLoading(true);
  try {
    console.log("Chargement des données pour :", currentUser.id);

    // 1. Profil & Abonnements avec auto-réparation
    let profile = await ensureUserProfileExists(currentUser);

    const normEmail = (currentUser.email || '').toLowerCase().trim();
    const isOwner = normEmail === 'sebastien.tessier41@orange.fr';

    if (!profile) {
      currentUser.profile = {
        full_name: currentUser.email.split('@')[0],
        role: isOwner ? 'admin' : 'member',
        subscriptions: []
      };
    } else {
      currentUser.profile = profile;
      if (isOwner) {
        currentUser.profile.role = 'admin';
      } else if (currentUser.profile.role) {
        currentUser.profile.role = currentUser.profile.role.trim().toLowerCase();
      } else {
        currentUser.profile.role = 'member';
      }
    }

    // Vérification de validité de l'abonnement pour les membres simples
    const role = currentUser.profile?.role || 'member';
    if (role !== 'admin') {
      resetRestrictedUI();
    }

    // Détection si l'appareil est un mobile/smartphone (User-Agent, taille d'écran ou écran tactile)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 1024 ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0);
    if (role !== 'admin' && !isMobile) {
      document.getElementById('section-pc-blocked-interception').style.display = 'flex';
      const pcBlockedLogoutBtn = document.getElementById('btn-logout-pc-blocked');
      if (pcBlockedLogoutBtn) {
        pcBlockedLogoutBtn.onclick = async () => {
          toggleLoading(true);
          await supabaseClient.auth.signOut();
          document.getElementById('section-pc-blocked-interception').style.display = 'none';
          toggleLoading(false);
        };
      }
      toggleLoading(false);
      return; // Bloque le reste du chargement
    } else {
      document.getElementById('section-pc-blocked-interception').style.display = 'none';
    }

    let isApproved = currentUser.profile?.is_approved === true;

    if (role !== 'admin' && !isApproved) {
      // --- NOUVEAUTÉ : Vérifier si l'utilisateur a été pré-validé ---
      const { data: imported } = await supabaseClient
        .from('imported_members')
        .select('is_approved')
        .eq('email', currentUser.email.toLowerCase().trim())
        .maybeSingle();

      if (imported && imported.is_approved === true) {
        isApproved = true;
        if (currentUser.profile) currentUser.profile.is_approved = true;
        // Tente de mettre à jour la base (peut échouer selon les règles RLS, mais on autorise l'accès frontend)
        supabaseClient.from('profiles').update({ is_approved: true }).eq('id', currentUser.id).then();
      }
    }

    if (role !== 'admin' && !isApproved) {
      document.getElementById('section-expired-interception').style.display = 'flex';

      const expiredLogoutBtn = document.getElementById('btn-logout-expired');
      if (expiredLogoutBtn) {
        expiredLogoutBtn.onclick = async () => {
          toggleLoading(true);
          await supabaseClient.auth.signOut();
          document.getElementById('section-expired-interception').style.display = 'none';
          toggleLoading(false);
        };
      }

      toggleLoading(false);
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return; // Bloque le reste du chargement
    } else {
      document.getElementById('section-expired-interception').style.display = 'none';
    }

    // 2. Ardoise (Consommations non payées)
    const { data: consumptions, error: consError } = await supabaseClient
      .from('consumptions')
      .select('*')
      .eq('member_id', currentUser.id)
      .eq('is_paid', false);

    if (consError) console.error("Erreur consommations:", consError.message);
    currentUser.balance = consumptions?.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0) || 0;

    // 3. Boissons
    const { data: drks, error: drkError } = await supabaseClient.from('drinks').select('*');
    if (drkError) console.error("Erreur boissons:", drkError.message);
    drinks = drks || [];
    window.drinks = drinks;

    // 4. Message d'accueil
    const { data: settingsData } = await supabaseClient.from('settings').select('*').eq('id', 1).maybeSingle();
    renderHomeMessage(settingsData);

    // 5. Rendu de l'interface
    renderManagementUI();

    // 5. Appliquer les droits d'accès par rôle & démarrer le verrouillage d'inactivité
    applyRoleAccessControl();
    resetInactivityTimer();

  } catch (err) {
    console.error("Erreur critique loadAppData:", err);
    alert("Une erreur est survenue lors du chargement : " + err.message);
  } finally {
    toggleLoading(false);
  }
}

// --- HOME MESSAGE RENDERING & EDITING ---
let currentSettings = null;

function renderHomeMessage(settings) {
  currentSettings = settings || {};
  const container = document.getElementById('dynamic-home-message-container');
  const titleEl = document.getElementById('dynamic-home-title');
  const textEl = document.getElementById('dynamic-home-text');
  const imgEl = document.getElementById('dynamic-home-image');

  const title = currentSettings.home_title || '';
  const text = currentSettings.home_text || '';
  const image = currentSettings.home_image_url || '';

  if (!title && !text && !image) {
    container.style.display = 'none';
  } else {
    container.style.display = 'flex';
    titleEl.textContent = title;
    titleEl.style.display = title ? 'block' : 'none';
    textEl.textContent = text;
    textEl.style.display = text ? 'block' : 'none';
    if (image) {
      imgEl.src = image;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
      imgEl.src = '';
    }
  }

  const btnContainer = document.getElementById('admin-edit-home-btn-container');
  if (currentUser?.profile?.role === 'admin') {
    btnContainer.style.display = 'block';
  } else {
    btnContainer.style.display = 'none';
  }
}

window.openHomeMessageModal = function () {
  if (currentUser?.profile?.role !== 'admin') return;
  document.getElementById('hm-title').value = currentSettings?.home_title || '';
  document.getElementById('hm-text').value = currentSettings?.home_text || '';
  document.getElementById('hm-image-url').value = currentSettings?.home_image_url || '';
  document.getElementById('hm-image-file').value = '';
  document.getElementById('home-message-modal').classList.remove('hidden');
};

document.getElementById('save-home-message-btn')?.addEventListener('click', async () => {
  const title = document.getElementById('hm-title').value.trim();
  const text = document.getElementById('hm-text').value.trim();
  let imgUrl = document.getElementById('hm-image-url').value.trim();
  const imgFile = document.getElementById('hm-image-file').files[0];

  toggleLoading(true);
  try {
    if (imgFile && typeof uploadToSupabase === 'function') {
      const uploaded = await uploadToSupabase(imgFile);
      if (uploaded) imgUrl = uploaded;
    }

    const updateData = { home_title: title, home_text: text, home_image_url: imgUrl };

    let res;
    if (currentSettings && currentSettings.id) {
      res = await supabaseClient.from('settings').update(updateData).eq('id', currentSettings.id);
    } else {
      res = await supabaseClient.from('settings').upsert({ id: 1, ...updateData });
    }

    if (res.error) throw res.error;

    document.getElementById('home-message-modal').classList.add('hidden');
    // Refresh to get the new data
    loadAppData();
  } catch (e) {
    alert("Erreur lors de l'enregistrement: " + e.message);
  } finally {
    toggleLoading(false);
  }
});

// --- NOTIFICATION & EXPLICATION DANS LA MODALE DE COMMANDE ---
function updateDrinkModalNotice(order) {
  const noticeEl = document.querySelector('.drink-confirm-notice');
  if (!noticeEl || !order) return;
  const totalPrice = order.price * order.quantity;

  if (window.servingMemberTarget) {
    const targetName = window.servingMemberTarget.full_name || 'le membre';
    const credit = parseFloat(window.servingMemberTarget.credit_balance) || 0;
    if (credit >= totalPrice) {
      noticeEl.innerHTML = `<span style="color:#60a5fa; font-weight:700;">🍺 Mode Service Admin :</span> Enregistré pour <strong>${targetName}</strong>.<br><span style="color:#22c55e; font-weight:600;">Sera déduit de son crédit prépayé disponible (${credit.toFixed(2)}€).</span>`;
    } else if (credit > 0) {
      const rest = totalPrice - credit;
      noticeEl.innerHTML = `<span style="color:#60a5fa; font-weight:700;">🍺 Mode Service Admin :</span> Enregistré pour <strong>${targetName}</strong>.<br><span style="color:#f59e0b; font-weight:600;">${credit.toFixed(2)}€ déduits de son crédit, et ${rest.toFixed(2)}€ ajoutés à son ardoise.</span>`;
    } else {
      noticeEl.innerHTML = `<span style="color:#60a5fa; font-weight:700;">🍺 Mode Service Admin :</span> Enregistré pour <strong>${targetName}</strong>.<br><span style="color:#ef4444; font-weight:600;">${totalPrice.toFixed(2)}€ ajoutés directement à son ardoise due.</span>`;
    }
  } else {
    const userCredit = parseFloat(currentUser?.profile?.credit_balance) || 0;
    if (userCredit >= totalPrice) {
      noticeEl.innerHTML = `Sera débité de votre cagnotte de crédit disponible (<strong style="color:#22c55e;">+${userCredit.toFixed(2)}€</strong>).`;
    } else if (userCredit > 0) {
      const rest = totalPrice - userCredit;
      noticeEl.innerHTML = `Votre crédit restant (<strong style="color:#22c55e;">+${userCredit.toFixed(2)}€</strong>) sera utilisé, et ${rest.toFixed(2)}€ seront ajoutés à votre ardoise.`;
    } else {
      noticeEl.textContent = "Le montant de cet achat sera ajouté à votre ardoise.";
    }
  }
}

// --- SOLDE DISPLAY (CREDIT & ARDOISE) ---
function updateSoldeDisplay() {
  if (!currentUser) return;

  const target = window.servingMemberTarget || currentUser;
  const isServing = !!window.servingMemberTarget;

  const credit = parseFloat(isServing ? target.credit_balance : (currentUser.profile?.credit_balance ?? target.credit_balance)) || 0;
  const balance = parseFloat(target.balance) || 0;

  // Stat dans la section Consommations Club (#mem-balance)
  const memBalanceEl = document.getElementById('mem-balance');
  const memBalanceLabel = document.getElementById('mem-balance-label') || memBalanceEl?.previousElementSibling;
  if (memBalanceEl) {
    const memberName = target.full_name || 'Membre';
    if (credit > 0) {
      memBalanceEl.textContent = `+${credit.toFixed(2)} €`;
      memBalanceEl.className = 'value success';
      memBalanceEl.style.color = '#22c55e';
      if (memBalanceLabel) memBalanceLabel.textContent = isServing ? `Crédit de ${memberName}` : "Crédit Disponible";
    } else if (balance > 0) {
      memBalanceEl.textContent = `${balance.toFixed(2)} €`;
      memBalanceEl.className = 'value danger';
      memBalanceEl.style.color = '#ef4444';
      if (memBalanceLabel) memBalanceLabel.textContent = isServing ? `Ardoise de ${memberName}` : "Ardoise Totale";
    } else {
      memBalanceEl.textContent = "0.00 €";
      memBalanceEl.className = 'value';
      memBalanceEl.style.color = 'var(--text-muted)';
      if (memBalanceLabel) memBalanceLabel.textContent = isServing ? `Solde de ${memberName} (0€)` : "Ardoise Totale";
    }
  }
}

// --- UI RENDERING (MANAGEMENT) ---
function renderManagementUI() {
  if (!currentUser) return;

  const target = window.servingMemberTarget || currentUser;
  const isServing = !!window.servingMemberTarget;

  // Bannière Mode Service au Bar (Admin)
  const banner = document.getElementById('serving-member-banner');
  const bannerName = document.getElementById('serving-member-name');
  if (banner && bannerName) {
    if (isServing) {
      bannerName.textContent = target.full_name || target.email || 'Membre';
      banner.classList.remove('hidden');
    } else {
      banner.classList.add('hidden');
    }
  }

  // Adaptation des sous-titres et intitulés
  const heroSubtitle = document.querySelector('.management-hero-header .hero-subtitle');
  if (heroSubtitle) {
    if (isServing) {
      heroSubtitle.innerHTML = `<span style="color:#60a5fa; font-weight:700;">🍺 Mode Service Bar</span> — Vous commandez pour <strong style="color: #fbbf24; font-size: 1.05rem;">${target.full_name}</strong> (débit direct de son crédit ou ardoise).`;
    } else {
      heroSubtitle.textContent = "Membres, consommations et services privilèges.";
    }
  }

  const drinksSubtitle = document.querySelector('.drinks-card .card-subtitle');
  if (drinksSubtitle) {
    drinksSubtitle.textContent = isServing
      ? `Cliquez sur un article pour le servir à ${target.full_name}`
      : "Un clic pour enregistrer votre consommation";
  }

  const historyTitle = document.getElementById('management-history-title');
  if (historyTitle) {
    historyTitle.textContent = isServing
      ? `Ardoise en cours de ${target.full_name}`
      : "Ardoise en attente";
  }

  document.getElementById('user-name').textContent = currentUser.profile?.full_name || 'Membre';
  const dropName = document.getElementById('dropdown-user-name');
  const dropRole = document.getElementById('dropdown-user-role');
  if (dropName) dropName.textContent = currentUser.profile?.full_name || 'Membre';
  if (dropRole) dropRole.textContent = currentUser.profile?.role === 'admin' ? 'Administrateur' : 'Membre';

  const subs = currentUser.profile?.subscriptions || [];
  const activeSub = subs.sort((a, b) => new Date(b.end_date) - new Date(a.end_date))[0];
  const subTypeEl = document.getElementById('mem-sub-type');
  const subBadgeEl = document.getElementById('mem-sub-badge');
  const subEndDateEl = document.getElementById('mem-sub-end-date');
  if (subTypeEl && subBadgeEl) {
    if (activeSub) {
      subTypeEl.textContent = activeSub.subscription_types?.name || 'Standard';
      const isExpired = new Date(activeSub.end_date) < new Date();
      subBadgeEl.textContent = isExpired ? 'Expiré' : 'Actif';
      subBadgeEl.className = isExpired ? 'value danger' : 'value success';
      if (subEndDateEl) subEndDateEl.textContent = new Date(activeSub.end_date).toLocaleDateString();
    } else {
      subTypeEl.textContent = 'Aucun';
      subBadgeEl.textContent = 'Inactif';
      subBadgeEl.className = 'value danger';
      if (subEndDateEl) subEndDateEl.textContent = 'Expiré';
    }
  }


  // Mettre à jour l'avatar de la top-bar
  const avatarContainer = document.querySelector('.user-profile .avatar');
  if (avatarContainer) {
    if (currentUser.profile?.avatar_url) {
      avatarContainer.innerHTML = `<img src="${currentUser.profile.avatar_url}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;">`;
    } else {
      avatarContainer.innerHTML = `<i data-lucide="user"></i>`;
    }
  }

  updateSoldeDisplay();

  // Drinks List (Séparé en deux zones distinctes : Bar & Billard)
  const drinkList = document.getElementById('drinks-list');
  const barList = document.getElementById('drinks-bar-list');
  const billiardList = document.getElementById('drinks-billiard-list');

  const renderDrinkCard = d => {
    const defaultIcon = getItemCategory(d) === 'billard' ? 'circle-dot' : 'glass-water';
    const visual = d.image_url
      ? `<img src="${d.image_url}" alt="${d.name}" class="drink-image">`
      : `<i data-lucide="${d.icon || defaultIcon}"></i>`;

    return `
      <div class="drink-item" onclick="logConsumption(${d.id}, '${(d.name || '').replace(/'/g, "\\'")}', ${d.price})" style="position: relative;">
          ${visual}
          <span>${d.name || 'Article'}</span>
          <span class="drink-price">${d.price}€</span>
      </div>
      `;
  };

  if (drinks) {
    const visibleDrinks = drinks.filter(d => !isMembership(d));
    const barDrinks = visibleDrinks.filter(d => getItemCategory(d) !== 'billard');
    const billiardDrinks = visibleDrinks.filter(d => getItemCategory(d) === 'billard');

    if (barList) {
      if (barDrinks.length === 0) {
        barList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.9rem;">Aucune boisson ou en-cas disponible.</div>`;
      } else {
        barList.innerHTML = barDrinks.map(renderDrinkCard).join('');
      }
    }

    if (billiardList) {
      if (billiardDrinks.length === 0) {
        billiardList.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 1.5rem; font-size: 0.9rem;">Aucun article disponible dans la catégorie Autres.</div>`;
      } else {
        billiardList.innerHTML = billiardDrinks.map(renderDrinkCard).join('');
      }
    }

    // Rétrocompatibilité : on peuple aussi drinks-list s'il existe
    if (drinkList) {
      drinkList.innerHTML = visibleDrinks.map(renderDrinkCard).join('');
    }
  }

  // History
  loadHistory();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function loadHistory() {
  const target = window.servingMemberTarget || currentUser;
  const isServing = !!window.servingMemberTarget;
  const isAdmin = currentUser?.profile?.role === 'admin';

  const actionTh = document.getElementById('history-admin-action-th');
  if (actionTh) {
    actionTh.style.display = isAdmin ? '' : 'none';
  }

  const { data: hist } = await supabaseClient
    .from('consumptions')
    .select('*, drinks(name)')
    .eq('member_id', target.id)
    .eq('is_paid', false)
    .order('created_at', { ascending: false });

  if (hist) {
    target.balance = hist.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0);
    updateSoldeDisplay();
  }

  const histBody = document.getElementById('history-list');
  if (!histBody) return;

  const targetName = target.full_name || 'Ce membre';
  const colspan = isAdmin ? 4 : 3;

  if (!hist || hist.length === 0) {
    histBody.innerHTML = `<tr><td colspan="${colspan}" class="text-muted" style="text-align:center; padding: 1.5rem;">${isServing ? `✅ Aucune ardoise en attente pour ${targetName}.` : '✅ Aucune ardoise en attente — vous êtes à jour !'}</td></tr>`;
    return;
  }

  histBody.innerHTML = hist.map(h => {
    const qtyText = h.quantity && h.quantity > 1 ? ` (x${h.quantity})` : '';
    const dateObj = new Date(h.created_at);
    const formattedDate = dateObj.toLocaleDateString('fr-FR');
    const formattedTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const lineTotal = h.price_at_time * (h.quantity || 1);

    const isRectified = h.recorded_by_name && h.recorded_by_name.includes('Rectifié');
    const auditStyle = isRectified ? 'color: #f59e0b; font-weight: 500;' : 'color: var(--text-muted);';

    const auditText = h.recorded_by_name && h.recorded_by_name !== 'Membre (smartphone)'
      ? `<br><small style="font-size:0.75rem; ${auditStyle}">${isRectified ? '⚠️ ' : 'Servi par : '}${h.recorded_by_name}</small>`
      : '';

    const actionTd = isAdmin
      ? `<td style="text-align: right;"><button class="btn btn-outline" style="padding: 2px 8px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;" onclick="openEditConsumptionModal(${h.id})" title="Rectifier cette déclaration"><i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> Corriger</button></td>`
      : '';

    return `
        <tr class="unpaid-slate-row">
            <td>${formattedDate} à ${formattedTime}</td>
            <td>${h.drinks?.name || 'Article'}${qtyText}${auditText}</td>
            <td class="slate-due-high">${lineTotal.toFixed(2)}€</td>
            ${actionTd}
        </tr>
    `;
  }).join('');
}

async function logConsumption(id, name, price) {
  console.log("logConsumption cliqué :", id, name, price);
  const drink = drinks.find(d => d.id === id);
  const isMemberItem = drink ? isMembership(drink) : false;

  pendingDrinkOrder = { id, name, price, drink, quantity: 1 };

  // Remplir et ouvrir la modale
  document.getElementById('drink-confirm-name').textContent = name;
  document.getElementById('drink-confirm-price').textContent = `${price}€`;
  document.getElementById('drink-confirm-qty').textContent = '1';
  document.getElementById('drink-confirm-total').textContent = `${price.toFixed(2)}€`;

  const imgContainer = document.getElementById('drink-confirm-image-container');
  if (drink && drink.image_url) {
    imgContainer.innerHTML = `<img src="${drink.image_url}" alt="${name}" style="width:64px; height:64px; object-fit:contain; background:#ffffff; padding:3px; border-radius:10px;">`;
  } else {
    const iconName = drink?.icon || 'glass-water';
    imgContainer.innerHTML = `<i data-lucide="${iconName}" style="width:48px; height:48px; stroke-width:1.5; color:var(--accent-gold);"></i>`;
  }

  // Mettre à jour la notice explicative selon le mode
  updateDrinkModalNotice(pendingDrinkOrder);

  // Rendre les icônes Lucide dynamiques
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Afficher la modale
  document.getElementById('drink-order-confirm-modal').classList.remove('hidden');
}
window.logConsumption = logConsumption;

// --- ADMIN LOGIC ---
window.openStockModal = function (drinkId, drinkName) {
  const modal = document.getElementById('stock-modal');
  document.getElementById('stock-drink-name').textContent = drinkName;
  document.getElementById('stock-drink-id').value = drinkId;
  document.getElementById('stock-input-value').value = '0';
  document.getElementById('stock-action-type').value = 'add';

  // Reset tabs
  document.getElementById('tab-add-stock').classList.add('active');
  document.getElementById('tab-set-stock').classList.remove('active');
  document.getElementById('stock-input-label').textContent = 'Quantité à ajouter (peut être négatif)';

  modal.classList.remove('hidden');
};

document.getElementById('tab-add-stock')?.addEventListener('click', (e) => {
  e.target.classList.add('active');
  document.getElementById('tab-set-stock').classList.remove('active');
  document.getElementById('stock-action-type').value = 'add';
  document.getElementById('stock-input-label').textContent = 'Quantité à ajouter (peut être négatif)';
  document.getElementById('stock-input-value').value = '0';
});

document.getElementById('tab-set-stock')?.addEventListener('click', (e) => {
  e.target.classList.add('active');
  document.getElementById('tab-add-stock').classList.remove('active');
  document.getElementById('stock-action-type').value = 'set';
  document.getElementById('stock-input-label').textContent = 'Nouveau stock réel (Inventaire)';

  // Set to current stock
  const drinkId = parseInt(document.getElementById('stock-drink-id').value);
  const drink = drinks.find(d => d.id === drinkId);
  document.getElementById('stock-input-value').value = drink?.stock || 0;
});

document.getElementById('save-stock-btn')?.addEventListener('click', async () => {
  const drinkId = parseInt(document.getElementById('stock-drink-id').value);
  const actionType = document.getElementById('stock-action-type').value;
  const inputValue = parseInt(document.getElementById('stock-input-value').value);

  if (isNaN(inputValue)) return alert("Veuillez saisir un nombre valide.");

  const drink = drinks.find(d => d.id === drinkId);
  if (!drink) return;

  const currentStock = drink.stock || 0;
  let newStock = 0;
  let qtyDiff = 0;
  if (actionType === 'add') {
    newStock = currentStock + inputValue;
    qtyDiff = inputValue;
  } else {
    newStock = inputValue;
    qtyDiff = newStock - currentStock;
  }

  toggleLoading(true);
  const { error } = await supabaseClient.from('drinks').update({ stock: newStock }).eq('id', drinkId);

  if (!error && currentUser) {
    try {
      await supabaseClient.from('stock_movements').insert({
        drink_id: drinkId,
        user_id: currentUser.id,
        action_type: actionType,
        quantity_changed: qtyDiff,
        previous_stock: currentStock,
        new_stock: newStock
      });
    } catch (err) {
      console.warn("Erreur insertion historique de stock:", err);
    }
  }

  toggleLoading(false);

  if (error) {
    alert("Erreur lors de la mise à jour du stock : " + error.message);
  } else {
    // Met à jour la variable locale pour que l'affichage soit correct sans rafraîchir
    drink.stock = newStock;
    document.getElementById('stock-modal').classList.add('hidden');
    loadAdminData();
  }
});

// --- UTILS ---
function showView(id) {
  const loginView = document.getElementById('login-view');
  const appShell = document.getElementById('app-shell');
  const lockScreenView = document.getElementById('lock-screen-view');
  const target = document.getElementById(id);

  if (loginView) loginView.classList.add('hidden');
  if (appShell) appShell.classList.add('hidden');
  if (lockScreenView) lockScreenView.classList.add('hidden');
  if (target) target.classList.remove('hidden');
}

function toggleLoading(show) {
  const el = document.getElementById('loading');
  if (!el) return;

  if (show) {
    el.classList.remove('hidden');
    // Sécurité : au bout de 5s on cache quoi qu'il arrive
    setTimeout(() => el.classList.add('hidden'), 5000);
  } else {
    el.classList.add('hidden');
  }
}

// --- ADMIN HELPERS ---
function show(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hide(id) { document.getElementById(id)?.classList.add('hidden'); }
function closeModal(id) { hide(id); }

let editingDrinkId = null;
let editingSubTypeId = null;



async function loadAdminData() {
  const todayStr = new Date().toISOString().split('T')[0];

  const isSuperAdmin = currentUser?.profile?.role === 'admin';
  const canManageStock = currentUser?.profile?.can_manage_stock === true;

  if (!isSuperAdmin) {
    resetRestrictedUI();
    return;
  }

  // Gérer la visibilité des onglets
  document.querySelectorAll('.btn-tab').forEach(btn => {
    const tabName = btn.getAttribute('data-tab');
    if (tabName === 'adm-drinks' || tabName === 'adm-stocks') {
      btn.style.display = canManageStock || isSuperAdmin ? 'inline-block' : 'none';
    } else if (tabName === 'adm-caisse') {
      btn.style.display = isSuperAdmin || canManageStock ? 'inline-block' : 'none';
    } else {
      btn.style.display = isSuperAdmin ? 'inline-block' : 'none';
    }
  });

  // Si l'onglet actif est caché, revenir à l'accueil admin (Membres)
  if (!canManageStock) {
    const activeTab = document.querySelector('.btn-tab.active');
    if (activeTab && (activeTab.getAttribute('data-tab') === 'adm-drinks' || activeTab.getAttribute('data-tab') === 'adm-stocks')) {
      document.querySelectorAll('.btn-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));
      const defaultTab = document.querySelector('.btn-tab[data-tab="adm-members"]');
      if (defaultTab) defaultTab.classList.add('active');
      document.getElementById('adm-members')?.classList.add('active');
    }
  }

  // 1. Unified Members Fetch
  const { data: mems } = await supabaseClient.from('profiles').select('*, subscriptions(*, subscription_types(*)), consumptions(*)').order('full_name');
  window.allMembersList = mems || [];

  if (!drinks || drinks.length === 0) {
    const { data: dData } = await supabaseClient.from('drinks').select('*').order('name');
    if (dData) drinks = dData;
  }
  window.drinks = drinks;

  // Remplir l'onglet Consommations / Ardoises
  const consBody = document.getElementById('admin-consumption-list');
  if (consBody) {
    consBody.innerHTML = '';
    mems?.forEach(m => {
      const unpaidCons = m.consumptions?.filter(c => !c.is_paid) || [];
      const balance = unpaidCons.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0);
      const credit = parseFloat(m.credit_balance) || 0;

      const row = document.createElement('tr');
      if (balance > 0) {
        row.className = 'unpaid-slate-row';
      } else if (credit > 0) {
        row.style.background = 'rgba(34, 197, 94, 0.05)';
      } else {
        row.className = 'paid-slate-row';
      }

      const safeName = m.full_name.replace(/'/g, "\\'");

      let soldeHtml = '';
      if (credit > 0) {
        soldeHtml = `<span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; font-weight: 700; font-size: 0.85rem;">+${credit.toFixed(2)} € (Crédit)</span>`;
      } else if (balance > 0) {
        soldeHtml = `<span class="badge" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; font-weight: 700; font-size: 0.85rem;">-${balance.toFixed(2)} € (Ardoise)</span>`;
      } else {
        soldeHtml = `<span class="badge" style="background: rgba(255, 255, 255, 0.08); color: var(--text-muted); font-size: 0.85rem;">0.00 € (À jour)</span>`;
      }

      row.innerHTML = `
            <td>
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:32px; height:32px; border-radius:50%; background:rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); display:flex; align-items:center; justify-content:center; font-weight:bold; color:#22c55e;">
                  ${m.full_name.charAt(0).toUpperCase()}
                </div>
                <div style="display:flex; flex-direction:column;">
                  <span style="font-weight:600;">${m.full_name}</span>
                  ${m.role === 'admin' ? '<span class="badge badge-active" style="font-size:0.55rem; padding: 0.05rem 0.25rem; align-self:flex-start;">ADMIN</span>' : ''}
                </div>
              </div>
            </td>
            <td style="font-size: 0.85rem;">${m.email || '<span class="text-muted">(non renseigné)</span>'}</td>
            <td>${soldeHtml}</td>
            <td style="text-align: right;">
              <div style="display: flex; gap: 0.4rem; justify-content: flex-end; flex-wrap: wrap;">
                <button class="btn btn-outline" style="padding:4px 9px; font-size:0.8rem; display:inline-flex; align-items:center; gap:4px;" title="Historique & Détails" onclick="openMemberConsumptionDetails('${m.id}', '${safeName}')">
                  <i data-lucide="eye" style="width:14px; height:14px;"></i> Détails
                </button>
              </div>
            </td>
          `;
      consBody.appendChild(row);
    });
  }

  // Connecter le filtrage de recherche pour les consommations
  const searchInput = document.getElementById('consumption-search-input');
  if (searchInput) {
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);

    newSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#admin-consumption-list tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    });
  }

  const body = document.getElementById('admin-member-list');
  body.innerHTML = '';
  mems?.forEach(m => {
    const lastSub = m.subscriptions?.sort((a, b) => new Date(b.end_date) - new Date(a.end_date))[0];
    const unpaidCons = m.consumptions?.filter(c => !c.is_paid) || [];
    const balance = unpaidCons.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0);
    const credit = parseFloat(m.credit_balance) || 0;

    const j4Date = new Date();
    j4Date.setDate(j4Date.getDate() + 4);
    const j4Str = j4Date.toISOString().split('T')[0];

    const isExpired = lastSub && lastSub.end_date < todayStr;
    const isJ4 = lastSub && lastSub.end_date === j4Str;

    const row = document.createElement('tr');
    const safeName = m.full_name.replace(/'/g, "\\'");
    const safeEmail = (m.email || '').replace(/'/g, "\\'");

    const avatarHtml = m.avatar_url ?
      `<img src="${m.avatar_url}" style="width:64px; height:64px; border-radius:50%; object-fit:cover; border: 1px solid rgba(255,255,255,0.2);">` :
      `<div style="width:64px; height:64px; border-radius:50%; background:rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.4); display:flex; align-items:center; justify-content:center; font-weight:bold; color:#22c55e; font-size:1.5rem;">${m.full_name.charAt(0).toUpperCase()}</div>`;

    let soldeDisplay = '';
    if (credit > 0) {
      soldeDisplay = `<span style="color:#22c55e; font-weight:700;">+${credit.toFixed(2)}€</span>`;
    } else if (balance > 0) {
      soldeDisplay = `<span class="text-danger font-bold">-${balance.toFixed(2)}€</span>`;
    } else {
      soldeDisplay = `<span class="text-muted">0.00€</span>`;
    }

    row.innerHTML = `
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              ${avatarHtml}
              <div style="display:flex; flex-direction:column;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-weight:600;">${m.full_name}</span>
                  <button class="btn btn-outline" style="padding:2px 6px; font-size:0.75rem; border:none; background:transparent;" title="Modifier le profil complet" onclick="event.stopPropagation(); editMemberPseudo('${m.id}', '${safeName}', '${safeEmail}')">
                    <i data-lucide="pencil" style="width:12px; height:12px;"></i>
                  </button>
                </div>
                ${m.role === 'admin' ? '<span class="badge badge-active" style="font-size:0.6rem; padding: 0.1rem 0.3rem; margin-top:2px; align-self:flex-start;">ADMIN</span>' : ''}
              </div>
            </div>
          </td>
          <td style="font-size: 0.85rem;">
            ${m.email || '<span class="text-muted">(non renseigné)</span>'}
          </td>
          <td>
            <span class="badge badge-active" style="font-size: 0.7rem;">Inscrit</span>
          </td>
          <td style="text-align: center; vertical-align: middle;">
            <label class="toggle-switch">
              <input type="checkbox" onchange="toggleMemberApproval('${m.id}', this.checked)" ${m.is_approved ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </td>
          <td class="clickable-cell" title="Modifier le membre / abonnement" onclick="editMemberPseudo('${m.id}', '${safeName}', '${safeEmail}')">
            ${lastSub && lastSub.subscription_types ? lastSub.subscription_types.name : '<span class="text-muted">Aucun</span>'}
          </td>
          <td class="clickable-cell ${isExpired ? 'text-danger font-bold' : (isJ4 ? 'text-warning font-bold' : 'text-success font-bold')}" title="Modifier le membre / abonnement" onclick="editMemberPseudo('${m.id}', '${safeName}', '${safeEmail}')">
            ${lastSub && lastSub.end_date ? new Date(lastSub.end_date).toLocaleDateString() : '-'}
          </td>
          <td>${soldeDisplay}</td>
          <td>
            <div style="display: flex; gap: 0.4rem; align-items: center; flex-wrap: wrap;">
              <label style="font-size: 0.7rem; display: flex; align-items: center; gap: 0.2rem; cursor: pointer;" title="Accès gestion des stocks et réception de l'email hebdo">
                <input type="checkbox" onchange="toggleStockRights('${m.id}', this.checked)" ${m.can_manage_stock ? 'checked' : ''}>
                Gère Stocks
              </label>
              <button class="btn btn-outline" title="${m.role === 'admin' ? 'Rétrograder en membre simple' : 'Promouvoir Admin'}" onclick="toggleAdminRole('${m.id}', '${m.role}')">
                <i data-lucide="${m.role === 'admin' ? 'shield-off' : 'shield'}" style="width: 14px; height: 14px;"></i>
              </button>
              <button class="btn btn-outline btn-danger" style="padding:3px 7px;" title="Supprimer le profil" onclick="deleteProfile('${m.id}')"><i data-lucide="user-minus" style="width:14px; height:14px;"></i></button>
            </div>
          </td>
        `;
    body.appendChild(row);
  });

  // 2. Charger les imports en attente (ceux qui n'ont PAS encore de compte)
  const { data: pending } = await supabaseClient.from('imported_members').select('*, subscription_types(*)').order('created_at', { ascending: false });
  // const pBody = document.getElementById('admin-pending-list');
  // pBody.innerHTML = '';

  // Filtrer pour ne garder que ceux qui ne sont pas encore dans 'profiles'
  const existingEmails = new Set(mems?.map(m => (m.email || '').toLowerCase()).filter(e => e));
  const filteredPending = pending?.filter(p => !existingEmails.has(p.email.toLowerCase())) || [];

  filteredPending.forEach(p => {
    const j4Date = new Date();
    j4Date.setDate(j4Date.getDate() + 4);
    const j4Str = j4Date.toISOString().split('T')[0];

    const isExpired = p.subscription_end_date && p.subscription_end_date < todayStr;
    const isJ4 = p.subscription_end_date && p.subscription_end_date === j4Str;

    const row = document.createElement('tr');
    const safeName = p.full_name.replace(/'/g, "\\'");
    const safeEmail = p.email.replace(/'/g, "\\'");

    row.innerHTML = `
          <td>${p.full_name}</td>
          <td style="font-size: 0.85rem;">${p.email}</td>
          <td>
            <span class="badge badge-expired" style="font-size: 0.7rem;">En attente</span>
          </td>
          <td style="text-align: center; vertical-align: middle;">
            <label class="toggle-switch">
              <input type="checkbox" onchange="togglePendingApproval(${p.id}, this.checked)" ${p.is_approved ? 'checked' : ''} title="Pré-valider ce membre pour sa future inscription">
              <span class="slider"></span>
            </label>
          </td>
          <td class="clickable-cell" title="Modifier l'abonnement" onclick="editPendingMember('${p.id}')">
            ${p.subscription_types?.name || '<span class="text-muted">Aucun</span>'}
          </td>
          <td class="clickable-cell ${isExpired ? 'text-danger font-bold' : (isJ4 ? 'text-warning font-bold' : 'text-success font-bold')}" title="Modifier l'abonnement" onclick="editPendingMember('${p.id}')">
            ${p.subscription_end_date ? new Date(p.subscription_end_date).toLocaleDateString() : '-'}
          </td>
          <td>0.00€</td>
          <td>
            <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
              <label style="font-size: 0.7rem; display: flex; align-items: center; gap: 0.2rem; cursor: pointer;" title="Accès gestion des stocks et réception de l'email hebdo">
                <input type="checkbox" onchange="togglePendingStockRights('${p.id}', this.checked)" ${p.can_manage_stock ? 'checked' : ''}>
                Gère Stocks
              </label>
              <button class="btn btn-outline" title="${p.role === 'admin' ? 'Annuler pré-configuration admin' : 'Pré-configurer Admin'}" onclick="togglePendingAdminRole('${p.id}', '${p.role || 'member'}')">
                <i data-lucide="${p.role === 'admin' ? 'shield-off' : 'shield'}" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn btn-outline" title="Modifier le membre" onclick="editPendingMember('${p.id}')">
                <i data-lucide="pencil" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn btn-outline btn-danger" title="Supprimer l'import" onclick="deletePendingImport(${p.id})">
                <i data-lucide="trash-2" size="16"></i>
              </button>
            </div>
          </td>
        `;
    body.appendChild(row);
  });

  // Remplir la liste d'autocomplétion des membres uniques (Nom - Email)
  const allMembersMap = new Map();
  pending?.forEach(p => {
    if (p.email && p.full_name) {
      allMembersMap.set(p.email.toLowerCase().trim(), {
        full_name: p.full_name,
        email: p.email
      });
    }
  });
  mems?.forEach(m => {
    if (m.email && m.full_name) {
      allMembersMap.set(m.email.toLowerCase().trim(), {
        full_name: m.full_name,
        email: m.email
      });
    }
  });
  window.allMembersList = Array.from(allMembersMap.values()).sort((a, b) => a.full_name.localeCompare(b.full_name));

  const datalist = document.getElementById('members-datalist');
  if (datalist) {
    datalist.innerHTML = window.allMembersList.map(m =>
      `<option value="${m.full_name}">${m.email}</option>`
    ).join('');
  }

  // 3. Charger le reste (boissons, stocks unifiés)
  const dBody = document.getElementById('admin-drink-list');
  if (dBody) {
    dBody.innerHTML = '';
    drinks.forEach(d => {
      const row = document.createElement('tr');
      const safeName = (d.name || '').replace(/'/g, "\\'");
      const defaultIcon = getItemCategory(d) === 'billard' ? 'circle-dot' : 'glass-water';
      const preview = d.image_url
        ? `<img src="${d.image_url}" style="width:42px;height:42px;object-fit:contain;background:#ffffff;border-radius:8px;padding:2px;display:block;box-shadow:0 2px 5px rgba(0,0,0,0.2);" title="${d.image_url}" alt="">`
        : `<div style="width:42px;height:42px;border-radius:8px;background:rgba(255,255,255,0.06);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--accent-gold);"><i data-lucide="${d.icon || defaultIcon}"></i></div>`;
      const link = d.image_url ? `<a href="${d.image_url}" target="_blank" style="font-size: 0.7rem; color: var(--primary); display: block;">Voir</a>` : '';
      const catBadge = getItemCategory(d) === 'billard'
        ? `<span class="category-badge billiard-badge" style="font-size:0.65rem; padding:1px 6px; margin-top:3px; display:inline-block;">Autres</span>`
        : `<span class="category-badge bar-badge" style="font-size:0.65rem; padding:1px 6px; margin-top:3px; display:inline-block;">Bar / Snack</span>`;

      const isMem = isMembership(d);
      const managed = isStockManaged(d);
      const stockVal = managed ? d.stock : 'Non géré';
      const threshold = d.alert_threshold || 0;
      let stockStatusHtml = '';
      if (isMem) {
        stockStatusHtml = `<span class="text-muted" style="font-size:0.8rem;">—</span>`;
      } else if (!managed) {
        stockStatusHtml = `<span class="text-muted" style="font-size:0.85rem;">Non géré</span>`;
      } else if (stockVal <= 0) {
        stockStatusHtml = `<span class="text-danger font-bold" style="font-size:0.95rem;">${stockVal} (Épuisé)</span>`;
      } else if (threshold > 0 && stockVal <= threshold) {
        stockStatusHtml = `<span style="color:#fbbf24; font-weight:700; font-size:0.95rem;">${stockVal} (Seuil ≤ ${threshold})</span>`;
      } else {
        stockStatusHtml = `<span class="text-success font-bold" style="font-size:0.95rem;">${stockVal}</span>`;
      }

      const stockHtml = isMem
        ? stockStatusHtml
        : `<div style="display:flex; flex-direction:column; gap:4px; align-items:flex-start;">
             ${stockStatusHtml}
             <label style="display:inline-flex; align-items:center; gap:5px; font-size:0.75rem; color:var(--text-muted); cursor:pointer; user-select:none;" title="Cocher pour tenir compte du stock de cet article">
               <input type="checkbox" ${managed ? 'checked' : ''} onchange="toggleDrinkStockTracking(${d.id}, this.checked)" style="width:14px; height:14px; accent-color:var(--accent-green); cursor:pointer;">
               Tenir compte du stock
             </label>
           </div>`;

      const stockBtnHtml = (!isMem && managed)
        ? `<button class="btn btn-outline" style="display:inline-flex; align-items:center; gap:5px; padding:5px 10px; font-size:0.8rem; border-color:var(--accent-gold); color:var(--accent-gold);" title="Réapprovisionner ou faire l'inventaire" onclick="openStockModal(${d.id}, '${safeName}')">
             <i data-lucide="package-plus" style="width:15px; height:15px;"></i> Stock
           </button>`
        : '';

      row.innerHTML = `
            <td>${preview}${link}</td>
            <td>
              <div style="font-weight:600;">${d.name}</div>
              ${catBadge}
            </td>
            <td style="font-weight:600; color:var(--accent-gold);">${parseFloat(d.price || 0).toFixed(2).replace('.', ',')} €</td>
            <td>${stockHtml}</td>
            <td style="text-align: right;">
              <div style="display: flex; gap: 0.45rem; justify-content: flex-end; align-items: center; flex-wrap: wrap;">
                ${stockBtnHtml}
                <button class="btn btn-outline" title="Modifier l'article" onclick="editDrink(${d.id})"><i data-lucide="pencil" style="width:15px; height:15px;"></i></button>
                <button class="btn btn-outline btn-danger" title="Supprimer l'article" onclick="deleteDrink(${d.id})"><i data-lucide="trash" style="width:15px; height:15px;"></i></button>
              </div>
            </td>
          `;
      dBody.appendChild(row);
    });
  }

  const { data: sTypes } = await supabaseClient.from('subscription_types').select('*');
  const sBody = document.getElementById('admin-subtype-list');
  if (sBody) {
    sBody.innerHTML = '';
    sTypes?.forEach(t => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${t.name}</td>
        <td>${t.duration_days}j</td>
        <td>${t.price}€</td>
        <td>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-outline" onclick="editSubType(${t.id})"><i data-lucide="pencil" size="16"></i></button>
            <button class="btn btn-outline btn-danger" onclick="deleteSubType(${t.id})"><i data-lucide="trash" size="16"></i></button>
          </div>
        </td>
      `;
      sBody.appendChild(row);
    });
  }

  lucide.createIcons();
}

async function deletePendingImport(id) {
  if (!confirm("Supprimer cet import ? Le membre ne pourra plus récupérer son abonnement automatiquement à la création de son compte.")) return;
  const { error } = await supabaseClient.from('imported_members').delete().eq('id', id);
  if (error) alert("Erreur: " + error.message);
  else loadAdminData();
}

async function deleteProfile(id) {
  if (!confirm("Supprimer ce profil membre ? Attention: cela ne supprime pas son compte Auth s'il existe, mais il perdra tout son historique et son rôle.")) return;
  const { error } = await supabaseClient.from('profiles').delete().eq('id', id);
  if (error) alert("Erreur: " + error.message);
  else loadAdminData();
}
window.deletePendingImport = deletePendingImport;
window.deleteProfile = deleteProfile;

window.toggleStockRights = async function (id, checked) {
  toggleLoading(true);
  const { error } = await supabaseClient.from('profiles').update({ can_manage_stock: checked }).eq('id', id);
  toggleLoading(false);
  if (error) alert("Erreur: " + error.message);
  else {
    if (currentUser?.id === id && currentUser?.profile) {
      currentUser.profile.can_manage_stock = checked;
    }
    loadAdminData();
  }
};

async function toggleMemberApproval(profileId, isApproved) {
  show('loading');
  const { error } = await supabaseClient
    .from('profiles')
    .update({ is_approved: isApproved })
    .eq('id', profileId);
  hide('loading');

  if (error) {
    alert("Erreur lors de la mise à jour: " + error.message);
    loadAdminData(); // recharger pour remettre le bouton dans le bon état
  }
}

async function togglePendingApproval(importId, isApproved) {
  show('loading');
  const { error } = await supabaseClient
    .from('imported_members')
    .update({ is_approved: isApproved })
    .eq('id', importId);
  hide('loading');

  if (error) {
    alert("Erreur lors de la mise à jour: " + error.message);
    loadAdminData(); // recharger pour remettre le bouton dans le bon état
  }
}

async function toggleAdminRole(profileId, currentRole) {
  const newRole = currentRole === 'admin' ? 'member' : 'admin';
  const actionText = newRole === 'admin' ? 'promouvoir ce membre comme Administrateur' : 'rétrograder cet administrateur en membre simple';

  if (!confirm(`Voulez-vous vraiment ${actionText} ?`)) return;

  show('loading');
  const { error } = await supabaseClient
    .from('profiles')
    .update({ role: newRole })
    .eq('id', profileId);

  hide('loading');
  if (error) alert("Erreur: " + error.message);
  else {
    alert("Rôle mis à jour avec succès !");
    loadAdminData();
  }
}

window.togglePendingStockRights = async function (id, checked) {
  show('loading');
  const { error } = await supabaseClient.from('imported_members').update({ can_manage_stock: checked }).eq('id', id);
  hide('loading');
  if (error) alert("Erreur: " + error.message + "\n\nAstuce: Avez-vous bien ajouté la colonne 'can_manage_stock' (booléen) dans la table 'imported_members' sur Supabase ?");
  else loadAdminData();
};

window.togglePendingAdminRole = async function (id, currentRole) {
  const newRole = currentRole === 'admin' ? 'member' : 'admin';
  const actionText = newRole === 'admin' ? 'pré-configurer ce membre comme Administrateur' : 'annuler la pré-configuration Administrateur';

  if (!confirm(`Voulez-vous vraiment ${actionText} ?`)) return;

  show('loading');
  const { error } = await supabaseClient
    .from('imported_members')
    .update({ role: newRole })
    .eq('id', id);

  hide('loading');
  if (error) alert("Erreur: " + error.message + "\n\nAstuce: Avez-vous bien ajouté la colonne 'role' (texte, valeur par défaut 'member') dans la table 'imported_members' sur Supabase ?");
  else {
    alert("Rôle pré-configuré avec succès !");
    loadAdminData();
  }
};

async function editMemberPseudo(profileId, currentPseudo, currentEmail) {
  show('loading');

  // On récupère les infos d'abonnement s'il y en a une
  const { data: imported } = await supabaseClient.from('imported_members').select('*').eq('email', currentEmail).maybeSingle();

  // On récupère le profil complet (pour le can_manage_stock)
  const { data: profile } = await supabaseClient.from('profiles').select('*').eq('id', profileId).single();

  const { data: types } = await supabaseClient.from('subscription_types').select('*');
  const select = document.getElementById('manual-mem-type');
  if (select && types) {
    select.innerHTML = types.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  }

  hide('loading');

  // Remplir le modal
  window.editingPendingMemberId = imported ? imported.id : null; // Si on l'a, on update direct

  document.getElementById('manual-mem-name').value = profile.full_name || currentPseudo;
  document.getElementById('manual-mem-email').value = currentEmail || '';

  // Rendre l'email en lecture seule pour éviter les conflits d'auth
  document.getElementById('manual-mem-email').setAttribute('readonly', 'true');
  document.getElementById('manual-mem-email').title = "L'adresse email d'un compte inscrit ne peut pas être modifiée ici.";

  if (imported) {
    if (document.getElementById('manual-mem-type')) document.getElementById('manual-mem-type').value = imported.subscription_type_id || '';
    if (document.getElementById('manual-mem-end-date')) document.getElementById('manual-mem-end-date').value = imported.subscription_end_date || '';
  } else {
    // Set default end date to +1 year
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    if (document.getElementById('manual-mem-end-date')) document.getElementById('manual-mem-end-date').value = nextYear.toISOString().split('T')[0];
  }

  if (document.getElementById('manual-mem-can-manage-stock')) {
    document.getElementById('manual-mem-can-manage-stock').checked = profile.can_manage_stock || false;
  }

  const modalTitle = document.querySelector('#member-modal h3');
  if (modalTitle) modalTitle.textContent = "Modifier le Membre Inscrit";

  show('member-modal');
}
window.editMemberPseudo = editMemberPseudo;

// --- NOUVEAU MEMBRE & PROLONGATION ---
window.cachedSubTypes = [];
window.existingMemberRecord = null;



// Écouteur sur la saisie du nom pour l'autocomplétion intelligente
document.getElementById('manual-mem-name')?.addEventListener('input', async (e) => {
  const name = e.target.value.trim();
  if (name && window.allMembersList) {
    // Recherche insensible à la casse d'un membre existant
    const match = window.allMembersList.find(m => m.full_name.trim().toLowerCase() === name.toLowerCase());
    if (match && match.email) {
      document.getElementById('manual-mem-email').value = match.email;

      // Récupère immédiatement son dossier d'abonnement importé
      show('loading');
      try {
        const { data: existing } = await supabaseClient
          .from('imported_members')
          .select('*')
          .eq('email', match.email.trim().toLowerCase())
          .maybeSingle();
        window.existingMemberRecord = existing || null;
      } catch (err) {
        console.error("Erreur lors de la récupération du membre:", err);
      } finally {
        hide('loading');
      }
    }
  }
});

// Écouteurs sur la saisie de l'email et le choix du type
document.getElementById('manual-mem-email')?.addEventListener('blur', async () => {
  const email = document.getElementById('manual-mem-email').value.trim().toLowerCase();
  if (email) {
    const { data: existing } = await supabaseClient
      .from('imported_members')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    window.existingMemberRecord = existing || null;
    if (existing) {
      if (!document.getElementById('manual-mem-name').value) {
        document.getElementById('manual-mem-name').value = existing.full_name || '';
      }
    }
  } else {
    window.existingMemberRecord = null;
  }
});

// Modal Nouveau Membre
document.getElementById('add-member-btn')?.addEventListener('click', async () => {
  window.editingPendingMemberId = null;
  const { data: types } = await supabaseClient.from('subscription_types').select('*');
  const select = document.getElementById('manual-mem-type');
  if (select && types) {
    select.innerHTML = types.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  }

  document.getElementById('manual-mem-name').value = '';
  document.getElementById('manual-mem-email').value = '';
  document.getElementById('manual-mem-email').removeAttribute('readonly');
  document.getElementById('manual-mem-email').removeAttribute('title');
  if (document.getElementById('manual-mem-can-manage-stock')) {
    document.getElementById('manual-mem-can-manage-stock').checked = false;
  }

  // Set default end date to +1 year
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  if (document.getElementById('manual-mem-end-date')) {
    document.getElementById('manual-mem-end-date').value = nextYear.toISOString().split('T')[0];
  }

  const modalTitle = document.querySelector('#member-modal h3');
  if (modalTitle) modalTitle.textContent = "Ajouter un Membre Manuellement";

  show('member-modal');
});

window.editPendingMember = async function (id) {
  window.editingPendingMemberId = id;
  show('loading');

  const { data: types } = await supabaseClient.from('subscription_types').select('*');
  const select = document.getElementById('manual-mem-type');
  if (select && types) {
    select.innerHTML = types.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
  }

  const { data: member } = await supabaseClient.from('imported_members').select('*').eq('id', id).maybeSingle();
  hide('loading');
  if (!member) return alert("Membre introuvable.");

  document.getElementById('manual-mem-name').value = member.full_name || '';
  document.getElementById('manual-mem-email').value = member.email || '';
  document.getElementById('manual-mem-email').removeAttribute('readonly');
  document.getElementById('manual-mem-email').removeAttribute('title');
  if (document.getElementById('manual-mem-type')) document.getElementById('manual-mem-type').value = member.subscription_type_id || '';
  if (document.getElementById('manual-mem-end-date')) document.getElementById('manual-mem-end-date').value = member.subscription_end_date || '';
  if (document.getElementById('manual-mem-can-manage-stock')) document.getElementById('manual-mem-can-manage-stock').checked = member.can_manage_stock || false;

  const modalTitle = document.querySelector('#member-modal h3');
  if (modalTitle) modalTitle.textContent = "Modifier le Membre en Attente";

  show('member-modal');
};

document.getElementById('save-manual-member-btn')?.addEventListener('click', async () => {
  const name = document.getElementById('manual-mem-name').value;
  const email = document.getElementById('manual-mem-email').value.trim().toLowerCase();
  const typeId = document.getElementById('manual-mem-type') ? document.getElementById('manual-mem-type').value : null;
  const endDate = document.getElementById('manual-mem-end-date') ? document.getElementById('manual-mem-end-date').value : null;
  let avatarUrl = document.getElementById('manual-mem-avatar-url') ? document.getElementById('manual-mem-avatar-url').value : '';
  const avatarFile = document.getElementById('manual-mem-avatar-file') ? document.getElementById('manual-mem-avatar-file').files[0] : null;
  const canManageStock = document.getElementById('manual-mem-can-manage-stock') ? document.getElementById('manual-mem-can-manage-stock').checked : false;

  if (!name || !email || (typeId !== null && !endDate)) return alert("Tous les champs (Nom, Email, Date) sont requis.");

  show('loading');

  if (avatarFile && typeof uploadToSupabase === 'function') {
    const uploadedUrl = await uploadToSupabase(avatarFile);
    if (uploadedUrl) avatarUrl = uploadedUrl;
  }

  let record = {
    full_name: name,
    email: email,
    subscription_type_id: typeId,
    subscription_end_date: endDate,
    can_manage_stock: canManageStock
  };

  if (typeof avatarUrl !== 'undefined' && avatarUrl !== '') {
    record.avatar_url = avatarUrl;
  }

  const subscriptionStartDate = new Date().toISOString().split('T')[0];

  let error = null;
  if (window.editingPendingMemberId) {
    const res = await supabaseClient.from('imported_members').update(record).eq('id', window.editingPendingMemberId);
    error = res.error;
  } else {
    const res = await supabaseClient.from('imported_members').upsert(record, { onConflict: 'email' });
    error = res.error;
  }

  if (!error) {
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (profile) {
      let profileUpdates = {};
      if (typeof avatarUrl !== 'undefined' && (avatarUrl || avatarUrl === '')) {
        profileUpdates.avatar_url = avatarUrl;
      }
      profileUpdates.can_manage_stock = canManageStock;
      profileUpdates.full_name = name;

      if (Object.keys(profileUpdates).length > 0) {
        try {
          await supabaseClient.from('profiles').update(profileUpdates).eq('id', profile.id);
          if (currentUser?.id === profile.id && currentUser?.profile) {
            currentUser.profile.can_manage_stock = canManageStock;
          }
        } catch (err) {
          console.warn("Erreur MAJ profile", err);
        }
      }

      const { data: subs } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('member_id', profile.id)
        .order('end_date', { ascending: false })
        .limit(1);

      const latestSub = subs && subs.length > 0 ? subs[0] : null;

      if (!latestSub || latestSub.type_id !== typeId || latestSub.end_date !== endDate) {
        if (latestSub && latestSub.type_id === typeId) {
          await supabaseClient.from('subscriptions').update({ end_date: endDate }).eq('id', latestSub.id);
        } else {
          await supabaseClient.from('subscriptions').insert({
            member_id: profile.id,
            type_id: typeId,
            start_date: subscriptionStartDate,
            end_date: endDate
          });
        }
      }
    }
  }

  hide('loading');
  if (error) alert("Erreur: " + error.message);
  else {
    alert("Opération effectuée avec succès !");
    closeModal('member-modal');
    if (typeof loadAdminData === 'function') loadAdminData();
  }
});

// --- CSV / EXCEL EXPORT (Consommations, Stocks & Crédits avec Audit Admin) ---
document.getElementById('export-stock-csv-btn')?.addEventListener('click', async () => {
  show('loading');
  try {
    const { data: consData, error: consErr } = await supabaseClient
      .from('consumptions')
      .select('*, profiles(full_name, email), drinks(name)')
      .order('created_at', { ascending: false });

    const { data: drinksData, error: drinksErr } = await supabaseClient.from('drinks').select('*');
    const { data: movementsData, error: movErr } = await supabaseClient
      .from('stock_movements')
      .select('*, profiles(full_name), drinks(name)')
      .order('created_at', { ascending: false });

    // Récupérer l'historique des rechargements de crédit pour l'audit
    let creditTxData = [];
    try {
      const { data: txData } = await supabaseClient
        .from('credit_transactions')
        .select('*, profiles(full_name, email)')
        .order('created_at', { ascending: false });
      creditTxData = txData || [];
    } catch (e) {
      console.warn("Table credit_transactions non trouvée ou vide :", e);
    }

    // Récupérer tous les profils avec leurs soldes
    const { data: allProfiles } = await supabaseClient
      .from('profiles')
      .select('id, full_name, email, credit_balance, consumptions(price_at_time, quantity, is_paid)')
      .order('full_name');

    if (consErr) throw consErr;
    if (drinksErr) throw drinksErr;
    if (movErr) console.warn("Erreur chargement historiques stocks (table peut-être manquante)", movErr);

    // 1. Stock Actuel
    const stocksDataArray = [["Article", "Stock Actuel", "Seuil Alerte"]];
    drinksData?.forEach(d => {
      const managed = isStockManaged(d);
      stocksDataArray.push([d.name, managed ? d.stock : "Non géré", managed ? (d.alert_threshold || 0) : "—"]);
    });
    const ws_stocks = XLSX.utils.aoa_to_sheet(stocksDataArray);

    // 2. Historique Ajouts
    const movDataArray = [["Date", "Membre", "Boisson", "Action", "Stock Avant Modif", "Quantité Modifiée", "Nouveau Stock"]];
    if (movementsData) {
      movementsData.forEach(m => {
        const date = new Date(m.created_at).toLocaleString('fr-FR');
        const member = m.profiles ? m.profiles.full_name : "Inconnu";
        const drink = m.drinks ? m.drinks.name : "Inconnu";
        const action = m.action_type === 'add' ? 'Ajout' : 'Inventaire';
        const qty = m.quantity_changed || 0;
        const new_stock = m.new_stock || 0;
        const previous_stock = m.previous_stock !== null ? m.previous_stock : (action === 'Ajout' ? new_stock - qty : "N/A");

        movDataArray.push([date, member, drink, action, previous_stock, qty, new_stock]);
      });
    }
    const ws_mov = XLSX.utils.aoa_to_sheet(movDataArray);

    // 3. Historique Consommations (avec Audit Admin 'recorded_by_name')
    const consDataArray = [["Date", "Membre", "Email", "Boisson", "Quantité", "Prix Unitaire", "Total", "Payé", "Date d'encaissement", "Encaissé par", "Servi / Enregistré par (Admin)"]];
    consData?.forEach(c => {
      const date = new Date(c.created_at).toLocaleString('fr-FR');
      const member = c.profiles ? c.profiles.full_name : "Inconnu";
      const email = c.profiles ? c.profiles.email : "";
      const drink = c.drinks ? c.drinks.name : "Inconnu";
      const qty = c.quantity || 1;
      const price = c.price_at_time || 0;
      const total = qty * price;

      let paid = "Non";
      if (price === 0) {
        paid = "Gratuite";
      } else if (c.is_paid) {
        paid = "Oui";
      }

      const dateEncaissement = c.paid_at ? new Date(c.paid_at).toLocaleString('fr-FR') : (c.is_paid && price > 0 ? "Inconnue" : "");
      const encaissePar = c.paid_by_name || (c.is_paid && price > 0 ? "Inconnu" : "");
      const serviPar = c.recorded_by_name || (c.is_paid && c.paid_by_name?.includes('Buvette') ? "Admin (Buvette)" : "Membre (smartphone)");

      consDataArray.push([date, member, email, drink, qty, price, total, paid, dateEncaissement, encaissePar, serviPar]);
    });
    const ws_cons = XLSX.utils.aoa_to_sheet(consDataArray);

    // 4. Rechargements Crédits (Audit complet)
    const creditDataArray = [["Date", "Membre", "Email", "Montant Rechargé (€)", "Moyen de Règlement", "Commentaire / Réf", "Rechargé par (Admin)"]];
    if (creditTxData.length > 0) {
      creditTxData.forEach(tx => {
        const date = new Date(tx.created_at).toLocaleString('fr-FR');
        const member = tx.profiles ? tx.profiles.full_name : "Inconnu";
        const email = tx.profiles ? tx.profiles.email : "";
        creditDataArray.push([
          date,
          member,
          email,
          parseFloat(tx.amount || 0).toFixed(2),
          tx.payment_method || "Espèces",
          tx.note || "",
          tx.created_by_name || "Admin"
        ]);
      });
    } else {
      creditDataArray.push(["(Aucun rechargement enregistré)", "", "", "", "", "", ""]);
    }
    const ws_credits = XLSX.utils.aoa_to_sheet(creditDataArray);

    // 5. Synthèse Soldes & Crédits
    const summaryDataArray = [["Membre", "Email", "Ardoise Due (€)", "Crédit Disponible (€)", "Solde Net (€)"]];
    allProfiles?.forEach(p => {
      const unpaid = p.consumptions?.filter(c => !c.is_paid) || [];
      const ardoise = unpaid.reduce((acc, c) => acc + ((c.price_at_time || 0) * (c.quantity || 1)), 0);
      const credit = parseFloat(p.credit_balance) || 0;
      const net = credit - ardoise;

      summaryDataArray.push([
        p.full_name || "Sans nom",
        p.email || "",
        ardoise.toFixed(2),
        credit.toFixed(2),
        (net >= 0 ? "+" : "") + net.toFixed(2)
      ]);
    });
    const ws_summary = XLSX.utils.aoa_to_sheet(summaryDataArray);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws_stocks, "État des Stocks");
    XLSX.utils.book_append_sheet(wb, ws_mov, "Historique Ajouts");
    XLSX.utils.book_append_sheet(wb, ws_cons, "Consommations");
    XLSX.utils.book_append_sheet(wb, ws_credits, "Rechargements Crédits");
    XLSX.utils.book_append_sheet(wb, ws_summary, "Synthèse Soldes");

    XLSX.writeFile(wb, `export_club_complet_${new Date().toISOString().split('T')[0]}.xlsx`);

  } catch (err) {
    alert("Erreur lors de l'export : " + err.message);
  } finally {
    hide('loading');
  }
});

// --- MODAL RECHARGEMENT DE CREDIT MEMBRE ---
let activeCreditMember = null;

window.openCreditModal = async function (memberId, memberName, currentCredit = 0) {
  activeCreditMember = { id: memberId, name: memberName, credit: currentCredit };

  const modal = document.getElementById('credit-modal');
  const title = document.getElementById('credit-modal-title');
  const memberNameSpan = document.getElementById('credit-modal-member-name');
  const desc = document.getElementById('credit-modal-desc');
  const balanceSpan = document.getElementById('credit-modal-current-balance');
  const amountInput = document.getElementById('credit-amount-input');
  const noteInput = document.getElementById('credit-note-input');
  const sigDiv = document.getElementById('credit-admin-signature');

  if (!modal) return;

  if (title) title.innerHTML = `<i data-lucide="wallet" style="color: #22c55e;"></i> Créditer un compte`;
  if (memberNameSpan) memberNameSpan.textContent = `Membre : ${memberName}`;
  if (desc) desc.textContent = `Ajouter du crédit d'avance (cagnotte). Si le membre a une ardoise, elle sera apurée en priorité.`;

  // Récupérer le solde exact (ardoise et crédit)
  const { data: unpaidCons } = await supabaseClient.from('consumptions').select('price_at_time, quantity').eq('member_id', memberId).eq('is_paid', false);
  const balanceDue = unpaidCons?.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0) || 0;

  const { data: prof } = await supabaseClient.from('profiles').select('credit_balance').eq('id', memberId).maybeSingle();
  const exactCredit = parseFloat(prof?.credit_balance) || 0;
  activeCreditMember.credit = exactCredit;
  activeCreditMember.balanceDue = balanceDue;

  if (balanceSpan) {
    if (exactCredit > 0) {
      balanceSpan.innerHTML = `<span style="color: #22c55e; font-weight:700;">+${exactCredit.toFixed(2)} € (Crédit disponible)</span>`;
    } else if (balanceDue > 0) {
      balanceSpan.innerHTML = `<span style="color: #ef4444; font-weight:700;">-${balanceDue.toFixed(2)} € (Ardoise en cours)</span>`;
    } else {
      balanceSpan.innerHTML = `<span style="color: var(--text-muted); font-weight:700;">0.00 € (À jour)</span>`;
    }
  }

  const resetBtn = document.getElementById('btn-reset-credit-zero');
  if (resetBtn) {
    resetBtn.style.display = exactCredit > 0 ? 'inline-flex' : 'none';
  }

  if (amountInput) amountInput.value = '';
  if (noteInput) noteInput.value = '';

  const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';
  if (sigDiv) sigDiv.innerHTML = `Enregistré et audité par : <strong>${adminName}</strong>`;

  modal.classList.remove('hidden');
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.resetMemberCreditToZero = async function () {
  if (!activeCreditMember) return;
  const memberName = activeCreditMember.name;
  const oldCredit = activeCreditMember.credit || 0;

  if (oldCredit <= 0) {
    alert("Le crédit est déjà à 0 €.");
    return;
  }

  const confirmReset = confirm(`Êtes-vous sûr de vouloir remettre le crédit de ${memberName} à 0.00 € (effacer les ${oldCredit.toFixed(2)} €) ?`);
  if (!confirmReset) return;

  toggleLoading(true);
  try {
    const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';

    const { error } = await supabaseClient
      .from('profiles')
      .update({ credit_balance: 0 })
      .eq('id', activeCreditMember.id);

    if (error) throw error;

    // Journaliser dans credit_transactions si la table existe
    try {
      await supabaseClient.from('credit_transactions').insert({
        member_id: activeCreditMember.id,
        amount: -oldCredit,
        payment_method: 'Ajustement Admin',
        created_by_name: `${adminName} (Admin)`,
        note: `Remise à zéro du crédit (${oldCredit.toFixed(2)}€ effacés)`
      });
    } catch (e) { }

    activeCreditMember.credit = 0;
    if (activeCreditMember.id === currentUser.id && currentUser.profile) {
      currentUser.profile.credit_balance = 0;
    }

    closeModal('credit-modal');
    alert(`Le crédit de ${memberName} a bien été remis à 0.00 €.`);
    loadAppData();
    if (typeof loadAdminData === 'function') loadAdminData();
  } catch (err) {
    alert("Erreur lors de la remise à zéro : " + err.message);
  } finally {
    toggleLoading(false);
  }
};

window.setCreditQuickAmount = function (amount) {
  const input = document.getElementById('credit-amount-input');
  if (input) {
    input.value = amount.toFixed(2);
    input.focus();
  }
};

const btnSubmitCredit = document.getElementById('btn-submit-credit');
if (btnSubmitCredit) {
  btnSubmitCredit.addEventListener('click', async () => {
    if (!activeCreditMember) return;

    const amountInput = document.getElementById('credit-amount-input');
    const amountVal = parseFloat(amountInput?.value);

    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Veuillez saisir un montant valide (supérieur à 0 €).");
      return;
    }

    const methodSelect = document.getElementById('credit-payment-method');
    const paymentMethod = methodSelect ? methodSelect.value : 'Espèces';

    const noteInput = document.getElementById('credit-note-input');
    const noteVal = noteInput ? noteInput.value.trim() : '';

    const confirmCredit = confirm(
      `Confirmez-vous l'ajout d'un crédit de ${amountVal.toFixed(2).replace('.', ',')} € (${paymentMethod}) sur le compte de ${activeCreditMember.name} ?`
    );
    if (!confirmCredit) return;

    const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';

    toggleLoading(true);

    try {
      const memberId = activeCreditMember.id;
      let amountToApply = amountVal;

      // 1. Apurement des ardoises en attente si existantes
      const { data: unpaidList } = await supabaseClient
        .from('consumptions')
        .select('*')
        .eq('member_id', memberId)
        .eq('is_paid', false)
        .order('created_at', { ascending: true });

      if (unpaidList && unpaidList.length > 0) {
        let runningRemaining = amountToApply;

        for (const c of unpaidList) {
          const cost = c.price_at_time * (c.quantity || 1);
          if (runningRemaining >= cost) {
            runningRemaining -= cost;
            await supabaseClient
              .from('consumptions')
              .update({
                is_paid: true,
                paid_at: new Date().toISOString(),
                paid_by_name: `Règlement Recharge (${paymentMethod} - ${adminName})`
              })
              .eq('id', c.id);
          } else if (runningRemaining > 0) {
            const partialPaid = runningRemaining;
            const unpaidRest = cost - runningRemaining;
            runningRemaining = 0;

            await supabaseClient
              .from('consumptions')
              .update({ price_at_time: unpaidRest, quantity: 1 })
              .eq('id', c.id);

            await supabaseClient
              .from('consumptions')
              .insert({
                member_id: memberId,
                drink_id: c.drink_id,
                price_at_time: partialPaid,
                quantity: 1,
                is_paid: true,
                paid_at: new Date().toISOString(),
                paid_by_name: `Règlement partiel Recharge (${paymentMethod} - ${adminName})`,
                recorded_by_name: c.recorded_by_name || `${adminName} (Admin)`
              });
          }
        }

        amountToApply = runningRemaining;
      }

      // 2. Le reste est crédité au solde du membre (profiles.credit_balance)
      const currentCredit = activeCreditMember.credit || 0;
      const newCreditTotal = currentCredit + amountToApply;

      const { error: profErr } = await supabaseClient
        .from('profiles')
        .update({ credit_balance: newCreditTotal })
        .eq('id', memberId);

      if (profErr) throw profErr;

      // 3. Enregistrement dans la table d'audit credit_transactions
      try {
        await supabaseClient
          .from('credit_transactions')
          .insert({
            member_id: memberId,
            amount: amountVal,
            payment_method: paymentMethod,
            note: noteVal || null,
            created_by_name: `${adminName} (Admin)`
          });
      } catch (txErr) {
        console.warn("Table credit_transactions non encore créée :", txErr);
      }

      closeModal('credit-modal');
      alert(`Compte de ${activeCreditMember.name} crédité de ${amountVal.toFixed(2)} € avec succès (${paymentMethod}) !`);

      loadAppData();
      if (typeof loadAdminData === 'function') loadAdminData();
      if (typeof loadCaisseMembers === 'function') {
        loadCaisseMembers().then(() => {
          if (caisseSelectedMember && activeCreditMember && caisseSelectedMember.id === activeCreditMember.id) {
            caisseSelectedMember = caisseMembersList.find(m => m.id === caisseSelectedMember.id) || null;
          }
          if (typeof renderCaisseMembers === 'function') renderCaisseMembers(document.getElementById('caisse-member-search')?.value || '');
          if (typeof updateCaisseTicketUI === 'function') updateCaisseTicketUI();
        });
      }

    } catch (err) {
      if (err.message?.includes('credit_balance') || err.message?.includes('schema cache')) {
        alert("⚠️ La colonne 'credit_balance' n'est pas encore créée dans votre base Supabase.\n\nVeuillez exécuter le script SQL 'setup_bar_and_credits.sql' dans l'onglet SQL Editor de votre projet Supabase pour activer la gestion du crédit.");
      } else {
        alert("Erreur lors du rechargement de crédit : " + err.message);
      }
    } finally {
      toggleLoading(false);
    }
  });
}

async function clearMemberBalance(memberId, memberName = '', amountStr = '', methodLabel = '', skipConfirm = false) {
  let resolvedName = memberName;
  if (!resolvedName && window.allMembersList) {
    const found = window.allMembersList.find(m => String(m.id) === String(memberId));
    if (found) resolvedName = found.full_name || found.email || '';
  }
  if (!resolvedName) {
    try {
      const { data: prof } = await supabaseClient.from('profiles').select('full_name, email').eq('id', memberId).maybeSingle();
      if (prof) resolvedName = prof.full_name || prof.email || '';
    } catch (e) { }
  }
  if (!skipConfirm) {
    const confirmMsg = (resolvedName && amountStr)
      ? `Confirmez-vous le règlement et la remise à zéro de l'ardoise de ${resolvedName} (${amountStr} €) ?`
      : (resolvedName
        ? `Marquer TOUTE l'ardoise comme payée pour ${resolvedName} ?`
        : "Marquer TOUTE l'ardoise comme payée pour ce membre ?");
    if (!confirm(confirmMsg)) return;
  }

  show('loading');

  const adminLabel = currentUser ? (currentUser.full_name || currentUser.email) : 'Admin';
  const payload = {
    is_paid: true,
    paid_at: new Date().toISOString(),
    paid_by_name: methodLabel ? `${adminLabel} (${methodLabel})` : adminLabel
  };

  const { error } = await supabaseClient
    .from('consumptions')
    .update(payload)
    .eq('member_id', memberId)
    .or('is_paid.eq.false,is_paid.is.null');

  hide('loading');
  if (error) {
    alert("Erreur: " + error.message + "\n\nAstuce: Avez-vous bien ajouté les colonnes 'paid_at' (type timestampz) et 'paid_by_name' (type text) dans la table 'consumptions' sur Supabase ?");
  }
  else {
    alert(methodLabel ? `✅ Ardoise de ${resolvedName || 'ce membre'} réglée (${methodLabel}) et remise à zéro !` : "Ardoise effacée !");
    loadAdminData();
    if (memberId === currentUser.id) loadAppData(true);
  }
}

// ==============================================================================
// INTÉGRATION TERMINAL CB SUMUP SOLO (CLOUD API)
// ==============================================================================
function isSumUpConfigOwner() {
  return (currentUser?.email || '').toLowerCase().trim() === 'sebastien.tessier41@orange.fr';
}

function getSumUpConfig() {
  try {
    const raw = localStorage.getItem('bc41_sumup_config');
    return raw ? JSON.parse(raw) : { enabled: false, apiKey: '', merchantCode: '', readerId: '' };
  } catch (e) {
    return { enabled: false, apiKey: '', merchantCode: '', readerId: '' };
  }
}

function isSumUpEnabled() {
  const cfg = getSumUpConfig();
  return !!(cfg.enabled && cfg.apiKey && cfg.merchantCode && cfg.readerId);
}

function updateSumUpStatusPill() {
  const pill = document.getElementById('sumup-status-pill');
  if (!pill) return;
  const cfg = getSumUpConfig();
  if (cfg.enabled && cfg.apiKey && cfg.merchantCode && cfg.readerId) {
    pill.textContent = '✅ SumUp Solo Actif';
    pill.style.background = 'rgba(16, 185, 129, 0.2)';
    pill.style.color = '#34d399';
  } else if (cfg.apiKey) {
    pill.textContent = '⚠️ Boîtier Solo à sélectionner';
    pill.style.background = 'rgba(245, 158, 11, 0.2)';
    pill.style.color = '#fbbf24';
  } else {
    pill.textContent = 'Non configuré';
    pill.style.background = 'rgba(148, 163, 184, 0.15)';
    pill.style.color = '#94a3b8';
  }
}

async function loadSumUpConfigUI() {
  if (!isSumUpConfigOwner()) return;
  const cfg = getSumUpConfig();
  const enabledCb = document.getElementById('sumup-enabled-cb');
  const apiKeyIn = document.getElementById('sumup-api-key');
  const merchantIn = document.getElementById('sumup-merchant-code');
  const readerSel = document.getElementById('sumup-reader-select');

  if (enabledCb) enabledCb.checked = !!cfg.enabled;
  if (apiKeyIn) apiKeyIn.value = cfg.apiKey || '';
  if (merchantIn) merchantIn.value = cfg.merchantCode || '';
  if (readerSel && cfg.readerId) {
    readerSel.innerHTML = `<option value="${cfg.readerId}">Boîtier Solo configuré (${cfg.readerName || cfg.readerId})</option>`;
    readerSel.value = cfg.readerId;
  }
  updateSumUpStatusPill();
  if (cfg.apiKey) {
    await fetchSumUpMerchantAndReaders(true);
  }
}
window.loadSumUpConfigUI = loadSumUpConfigUI;

function openSumUpConfigModal() {
  if (!isSumUpConfigOwner()) {
    alert("Accès refusé : seul sebastien.tessier41@orange.fr est autorisé à configurer le boîtier SumUp.");
    return;
  }
  const modal = document.getElementById('sumup-config-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  loadSumUpConfigUI();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}
window.openSumUpConfigModal = openSumUpConfigModal;

function saveSumUpConfig() {
  if (!isSumUpConfigOwner()) {
    alert("Accès refusé : seul sebastien.tessier41@orange.fr est autorisé à modifier la configuration SumUp.");
    return;
  }
  const enabled = document.getElementById('sumup-enabled-cb')?.checked || false;
  const apiKey = (document.getElementById('sumup-api-key')?.value || '').trim();
  const merchantCode = (document.getElementById('sumup-merchant-code')?.value || '').trim();
  const readerSelect = document.getElementById('sumup-reader-select');
  const readerId = readerSelect?.value || '';
  const readerName = readerSelect?.options[readerSelect.selectedIndex]?.textContent || '';

  const cfg = { enabled, apiKey, merchantCode, readerId, readerName };
  localStorage.setItem('bc41_sumup_config', JSON.stringify(cfg));
  updateSumUpStatusPill();
  document.getElementById('sumup-config-modal')?.classList.add('hidden');
  alert("✅ Configuration SumUp enregistrée !");
}
window.saveSumUpConfig = saveSumUpConfig;

async function fetchSumUpMerchantAndReaders(silent = false) {
  if (!isSumUpConfigOwner()) return;
  const apiKey = (document.getElementById('sumup-api-key')?.value || getSumUpConfig().apiKey || '').trim();
  if (!apiKey) {
    if (!silent) alert("Veuillez d'abord saisir votre Clé API SumUp (sup_sk_...).");
    return;
  }

  try {
    if (!silent) toggleLoading(true);
    let merchantCode = (document.getElementById('sumup-merchant-code')?.value || '').trim();

    if (!merchantCode) {
      const meRes = await fetch('https://api.sumup.com/v0.1/me', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!meRes.ok) throw new Error("Clé API SumUp invalide ou refusée.");
      const meData = await meRes.json();
      merchantCode = meData?.merchant_profile?.merchant_code || '';
      const merchantIn = document.getElementById('sumup-merchant-code');
      if (merchantIn && merchantCode) merchantIn.value = merchantCode;
    }

    if (merchantCode) {
      const rRes = await fetch(`https://api.sumup.com/v0.1/merchants/${encodeURIComponent(merchantCode)}/readers`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        const items = rData?.items || (Array.isArray(rData) ? rData : []);
        const select = document.getElementById('sumup-reader-select');
        const savedCfg = getSumUpConfig();
        if (select) {
          if (items.length === 0) {
            select.innerHTML = `<option value="">-- Aucun boîtier Solo associé sur ce compte --</option>`;
          } else {
            select.innerHTML = items.map(r => {
              const sel = (savedCfg.readerId && savedCfg.readerId === r.id) ? 'selected' : '';
              return `<option value="${r.id}" ${sel}>${r.name || 'SumUp Solo'} (${r.status || 'Prêt'})</option>`;
            }).join('');
          }
        }
      }
    }
    if (!silent) {
      saveSumUpConfig();
    }
  } catch (err) {
    if (!silent) alert("Erreur connexion SumUp : " + err.message);
  } finally {
    if (!silent) toggleLoading(false);
  }
}
window.fetchSumUpMerchantAndReaders = fetchSumUpMerchantAndReaders;

async function pairNewSumUpSoloReader() {
  if (!isSumUpConfigOwner()) {
    alert("Accès refusé : seul sebastien.tessier41@orange.fr est autorisé à associer un boîtier SumUp.");
    return;
  }
  const apiKey = (document.getElementById('sumup-api-key')?.value || '').trim();
  let merchantCode = (document.getElementById('sumup-merchant-code')?.value || '').trim();
  const pairingCode = (document.getElementById('sumup-pairing-code')?.value || '').trim().toUpperCase();

  if (!apiKey) return alert("Veuillez d'abord renseigner votre Clé API SumUp (sup_sk_...).");
  if (!pairingCode) return alert("Veuillez saisir le code d'association à 8 ou 9 caractères affiché sur l'écran du boîtier SumUp Solo.");

  toggleLoading(true);
  try {
    if (!merchantCode) {
      const meRes = await fetch('https://api.sumup.com/v0.1/me', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (meRes.ok) {
        const meData = await meRes.json();
        merchantCode = meData?.merchant_profile?.merchant_code || '';
        const merchantIn = document.getElementById('sumup-merchant-code');
        if (merchantIn) merchantIn.value = merchantCode;
      }
    }
    if (!merchantCode) throw new Error("Code marchand introuvable.");

    const pairRes = await fetch(`https://api.sumup.com/v0.1/merchants/${encodeURIComponent(merchantCode)}/readers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        pairing_code: pairingCode,
        name: 'SumUp Solo Bar BC41'
      })
    });

    if (!pairRes.ok) {
      const errBody = await pairRes.json().catch(() => ({}));
      throw new Error(errBody.detail || errBody.message || `Code refusé (${pairRes.status})`);
    }

    document.getElementById('sumup-pairing-code').value = '';
    await fetchSumUpMerchantAndReaders(true);
    saveSumUpConfig();
    alert("✅ Boîtier SumUp Solo associé avec succès !");
  } catch (err) {
    alert("Erreur lors de l'association du boîtier Solo : " + err.message);
  } finally {
    toggleLoading(false);
  }
}
window.pairNewSumUpSoloReader = pairNewSumUpSoloReader;

async function processSumUpSoloPayment(amountEur, description) {
  if (currentUser?.profile?.role !== 'admin') {
    alert("Accès réservé aux administrateurs (Caisse Bar).");
    return false;
  }
  const cfg = getSumUpConfig();
  const modal = document.getElementById('sumup-checkout-modal');
  const amountEl = document.getElementById('sumup-checkout-amount');
  const descEl = document.getElementById('sumup-checkout-desc');
  const statusBox = document.getElementById('sumup-checkout-status-box');
  const btnConfirmManual = document.getElementById('sumup-btn-confirm-manual');
  const btnCancel = document.getElementById('sumup-btn-cancel-checkout');

  if (!modal) {
    return confirm(`Confirmez-vous que le paiement CB SumUp de ${amountEur.toFixed(2).replace('.', ',')} € (${description}) a bien été encaissé ?`);
  }

  amountEl.textContent = `${amountEur.toFixed(2).replace('.', ',')} €`;
  descEl.textContent = description;

  return new Promise(async (resolve) => {
    let pollTimer = null;
    let clientTxId = null;

    const cleanup = () => {
      if (pollTimer) clearInterval(pollTimer);
      modal.classList.add('hidden');
    };

    btnConfirmManual.onclick = () => {
      cleanup();
      resolve(true);
    };

    btnCancel.onclick = async () => {
      if (cfg.apiKey && cfg.merchantCode && cfg.readerId) {
        try {
          await fetch(`https://api.sumup.com/v0.1/merchants/${encodeURIComponent(cfg.merchantCode)}/readers/${encodeURIComponent(cfg.readerId)}/terminate`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${cfg.apiKey}` }
          });
        } catch (_) { }
      }
      cleanup();
      resolve(false);
    };

    modal.classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (cfg.apiKey && cfg.merchantCode && cfg.readerId) {
      statusBox.innerHTML = `📡 Envoi du montant au boîtier <strong>SumUp Solo</strong>...`;
      try {
        const valueInCents = Math.round(amountEur * 100);
        const res = await fetch(`https://api.sumup.com/v0.1/merchants/${encodeURIComponent(cfg.merchantCode)}/readers/${encodeURIComponent(cfg.readerId)}/checkout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfg.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            total_amount: {
              value: valueInCents,
              currency: 'EUR',
              minor_unit: 2
            },
            description: description
          })
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => ({}));
          statusBox.innerHTML = `⚠️ Impossible de réveiller automatiquement le Solo (${errJson.detail || res.status}).<br><small>Vous pouvez taper ${amountEur.toFixed(2).replace('.', ',')} € sur le boîtier puis cliquer sur Valider ci-dessous.</small>`;
          return;
        }

        const resData = await res.json().catch(() => ({}));
        clientTxId = resData?.data?.client_transaction_id || resData?.client_transaction_id || null;
        statusBox.innerHTML = `💳 <strong>Boîtier SumUp Solo allumé !</strong><br>En attente de la carte bancaire du membre sur le terminal...`;

        if (clientTxId) {
          pollTimer = setInterval(async () => {
            try {
              const txRes = await fetch(`https://api.sumup.com/v0.1/merchants/${encodeURIComponent(cfg.merchantCode)}/transactions?client_transaction_id=${encodeURIComponent(clientTxId)}`, {
                headers: { 'Authorization': `Bearer ${cfg.apiKey}` }
              });
              if (txRes.ok) {
                const txData = await txRes.json();
                const status = (txData?.status || '').toUpperCase();
                if (status === 'SUCCESSFUL') {
                  cleanup();
                  resolve(true);
                } else if (status === 'FAILED' || status === 'CANCELLED') {
                  statusBox.innerHTML = `❌ Paiement refusé ou annulé sur le boîtier SumUp Solo.`;
                  if (pollTimer) clearInterval(pollTimer);
                }
              }
            } catch (_) { }
          }, 2500);
        }
      } catch (e) {
        statusBox.innerHTML = `⚠️ Boîtier hors-ligne ou non joignable.<br><small>Encaissez sur le Solo puis cliquez sur « Paiement accepté » ci-dessous.</small>`;
      }
    } else {
      statusBox.innerHTML = `ℹ️ Liaison automatique Cloud non configurée (bouton ⚙️ SumUp dans Caisse Bar).<br><small>Encaissez <strong>${amountEur.toFixed(2).replace('.', ',')} €</strong> sur votre boîtier SumUp Solo puis cliquez sur <strong>Valider</strong> ci-dessous pour effacer l'ardoise.</small>`;
    }
  });
}
window.processSumUpSoloPayment = processSumUpSoloPayment;

async function openMemberConsumptionDetails(memberId, memberName) {
  show('loading');
  try {
    const { data: consumptions, error } = await supabaseClient
      .from('consumptions')
      .select('*, drinks(name)')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Récupérer le solde de crédit actuel
    const { data: memberProfile } = await supabaseClient
      .from('profiles')
      .select('credit_balance')
      .eq('id', memberId)
      .maybeSingle();

    const creditBalance = parseFloat(memberProfile?.credit_balance) || 0;

    const unpaidList = consumptions?.filter(c => !c.is_paid) || [];
    const paidList = consumptions?.filter(c => c.is_paid) || [];

    const totalDue = unpaidList.reduce((acc, c) => acc + (c.price_at_time * (c.quantity || 1)), 0);

    let creditHeaderHtml = '';
    if (creditBalance > 0) {
      creditHeaderHtml = ` <span class="badge" style="background: rgba(34, 197, 94, 0.2); color: #22c55e; font-size: 0.85rem; margin-left: 8px;">Crédit disponible : +${creditBalance.toFixed(2)} €</span>`;
    }

    document.getElementById('consumption-detail-title').innerHTML = `<i data-lucide="coffee" style="width:20px;height:20px;vertical-align:middle;margin-right:6px;"></i> Consommations de <strong>${memberName}</strong>${creditHeaderHtml}`;
    document.getElementById('detail-total-due').textContent = `${totalDue.toFixed(2)}€`;

    const unpaidBody = document.getElementById('detail-unpaid-list');
    if (unpaidList.length === 0) {
      unpaidBody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">Aucune boisson en ardoise.</td></tr>`;
    } else {
      unpaidBody.innerHTML = unpaidList.map(c => {
        const qtyText = c.quantity && c.quantity > 1 ? ` (x${c.quantity})` : '';
        const dateObj = new Date(c.created_at);
        const formattedDate = `${dateObj.toLocaleDateString('fr-FR')} à ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        const lineTotal = c.price_at_time * (c.quantity || 1);
        const isRectified = c.recorded_by_name && c.recorded_by_name.includes('Rectifié');
        const auditStyle = isRectified ? 'color: #f59e0b; font-weight: 600;' : 'color: var(--text-muted);';
        const auditDetails = [];
        if (c.recorded_by_name) auditDetails.push(`${isRectified ? '⚠️ ' : 'Enregistré par : '}${c.recorded_by_name}`);
        const auditText = auditDetails.length > 0 ? `<br><small style="font-size:0.75rem; ${auditStyle}">${auditDetails.join(' | ')}</small>` : '';
        return `
            <tr>
              <td>${formattedDate}</td>
              <td>${c.drinks?.name || 'Article'}${qtyText}${auditText}</td>
              <td class="text-danger" style="font-weight:600;">${lineTotal.toFixed(2)}€</td>
              <td style="text-align: right;">
                <button class="btn btn-outline" style="padding: 2px 7px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;" onclick="openEditConsumptionModal(${c.id})" title="Rectifier cette déclaration">
                  <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> Corriger
                </button>
              </td>
            </tr>
          `;
      }).join('');
    }

    const paidBody = document.getElementById('detail-paid-list');
    if (paidList.length === 0) {
      paidBody.innerHTML = `<tr><td colspan="4" class="text-muted" style="text-align:center;">Aucun historique de règlement.</td></tr>`;
    } else {
      paidBody.innerHTML = paidList.map(c => {
        const qtyText = c.quantity && c.quantity > 1 ? ` (x${c.quantity})` : '';
        const dateObj = new Date(c.created_at);
        const formattedDate = `${dateObj.toLocaleDateString('fr-FR')} à ${dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
        const lineTotal = c.price_at_time * (c.quantity || 1);
        const isRectified = c.recorded_by_name && c.recorded_by_name.includes('Rectifié');
        const auditStyle = isRectified ? 'color: #f59e0b; font-weight: 600;' : 'color: var(--text-muted);';
        const auditDetails = [];
        if (c.recorded_by_name) auditDetails.push(`${isRectified ? '⚠️ ' : 'Servi par : '}${c.recorded_by_name}`);
        if (c.paid_by_name) auditDetails.push(`Règlement : ${c.paid_by_name}`);
        const auditText = auditDetails.length > 0 ? `<br><small style="font-size:0.75rem; ${auditStyle}">${auditDetails.join(' | ')}</small>` : '';

        return `
            <tr>
              <td>${formattedDate}</td>
              <td>${c.drinks?.name || 'Article'}${qtyText}${auditText}</td>
              <td class="text-success" style="font-weight:600;">${lineTotal.toFixed(2)}€</td>
              <td style="text-align: right;">
                <button class="btn btn-outline" style="padding: 2px 7px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 4px;" onclick="openEditConsumptionModal(${c.id})" title="Rectifier cette déclaration">
                  <i data-lucide="edit-2" style="width: 12px; height: 12px;"></i> Corriger
                </button>
              </td>
            </tr>
          `;
      }).join('');
    }

    const collectBtn = document.getElementById('btn-collect-tab');
    if (collectBtn) {
      collectBtn.style.display = 'none';
    }

    hide('loading');
    document.getElementById('consumption-detail-modal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (err) {
    console.error("Erreur lors du chargement des détails de consommation :", err);
    alert("Erreur technique : " + err.message);
    hide('loading');
  }
}
window.openMemberConsumptionDetails = openMemberConsumptionDetails;

// ==============================================================================
// GESTION DES RECTIFICATIONS DE CONSOMMATION PAR LES ADMINS (MOTIF OBLIGATOIRE)
// ==============================================================================
let currentEditingConsumption = null;

async function openEditConsumptionModal(id) {
  if (!currentUser || currentUser.profile?.role !== 'admin') {
    alert("Seuls les administrateurs peuvent rectifier une déclaration de consommation.");
    return;
  }

  toggleLoading(true);
  try {
    // S'assurer que la liste des boissons est disponible
    if (!drinks || drinks.length === 0) {
      const { data: dData } = await supabaseClient.from('drinks').select('*').order('name');
      if (dData) drinks = dData;
    }

    const { data: cons, error } = await supabaseClient
      .from('consumptions')
      .select('*, drinks(*), profiles(id, full_name, email, credit_balance)')
      .eq('id', id)
      .single();

    if (error || !cons) {
      throw error || new Error("Consommation introuvable");
    }

    currentEditingConsumption = cons;

    // Remplir le select des boissons
    const drinkSelect = document.getElementById('edit-cons-drink-select');
    drinkSelect.innerHTML = (drinks || []).map(d => {
      const selected = String(d.id) === String(cons.drink_id) ? 'selected' : '';
      return `<option value="${d.id}" data-price="${d.price}" ${selected}>${d.name} (${parseFloat(d.price).toFixed(2)}€)</option>`;
    }).join('');

    // Si la boisson actuelle n'est plus dans la carte active (archivée ou modifiée), l'ajouter comme option
    if (cons.drink_id && !drinks.some(d => String(d.id) === String(cons.drink_id))) {
      const opt = document.createElement('option');
      opt.value = cons.drink_id;
      opt.dataset.price = cons.price_at_time;
      opt.textContent = `${cons.drinks?.name || 'Article'} (${parseFloat(cons.price_at_time).toFixed(2)}€)`;
      opt.selected = true;
      drinkSelect.appendChild(opt);
    }

    document.getElementById('edit-cons-id').value = cons.id;
    document.getElementById('edit-cons-member-id').value = cons.member_id;
    document.getElementById('edit-cons-member-name').textContent = cons.profiles?.full_name || cons.profiles?.email || 'Membre';

    const d = new Date(cons.created_at);
    document.getElementById('edit-cons-date').textContent = `${d.toLocaleDateString('fr-FR')} à ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

    const qty = cons.quantity || 1;
    document.getElementById('edit-cons-qty').value = qty;
    document.getElementById('edit-cons-price').value = cons.price_at_time;
    updateEditConsTotal();

    // Audit initial et statut
    const auditDetails = [];
    if (cons.recorded_by_name) auditDetails.push(`Enregistré par : ${cons.recorded_by_name}`);
    if (cons.paid_by_name) auditDetails.push(`Règlement : ${cons.paid_by_name}`);
    if (cons.is_paid) {
      auditDetails.push(`<span class="text-success" style="font-weight:600;">Statut : Réglé</span>`);
    } else {
      auditDetails.push(`<span class="text-danger" style="font-weight:600;">Statut : En ardoise (non payé)</span>`);
    }
    document.getElementById('edit-cons-audit-info').innerHTML = auditDetails.join('<br>');

    // Réinitialiser le champ motif obligatoire
    document.getElementById('edit-cons-reason').value = '';

    // Écouteurs pour recalculer en direct lors des changements
    drinkSelect.onchange = () => {
      const selectedOption = drinkSelect.options[drinkSelect.selectedIndex];
      if (selectedOption && selectedOption.dataset.price !== undefined) {
        document.getElementById('edit-cons-price').value = selectedOption.dataset.price;
      }
      updateEditConsTotal();
    };
    document.getElementById('edit-cons-qty').oninput = updateEditConsTotal;
    document.getElementById('edit-cons-price').oninput = updateEditConsTotal;

    document.getElementById('edit-consumption-modal').classList.remove('hidden');
    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (err) {
    console.error("Erreur ouverture modal rectification consommation :", err);
    alert("Impossible d'ouvrir la modification : " + err.message);
  } finally {
    toggleLoading(false);
  }
}
window.openEditConsumptionModal = openEditConsumptionModal;

function closeEditConsumptionModal() {
  const modal = document.getElementById('edit-consumption-modal');
  if (modal) modal.classList.add('hidden');
  currentEditingConsumption = null;
}
window.closeEditConsumptionModal = closeEditConsumptionModal;

function updateEditConsTotal() {
  const qty = parseFloat(document.getElementById('edit-cons-qty').value) || 0;
  const price = parseFloat(document.getElementById('edit-cons-price').value) || 0;
  const total = qty * price;
  const el = document.getElementById('edit-cons-total');
  if (el) el.textContent = `${total.toFixed(2)} €`;
}
window.updateEditConsTotal = updateEditConsTotal;

async function submitEditConsumption() {
  if (!currentEditingConsumption) return;

  const reasonInput = document.getElementById('edit-cons-reason');
  const reason = reasonInput ? reasonInput.value.trim() : '';

  if (!reason) {
    alert("⚠️ Le motif de la modification est OBLIGATOIRE.\nVeuillez obligatoirement indiquer la raison de cette correction.");
    if (reasonInput) reasonInput.focus();
    return;
  }

  const newDrinkId = parseInt(document.getElementById('edit-cons-drink-select').value) || document.getElementById('edit-cons-drink-select').value;
  const newQty = parseInt(document.getElementById('edit-cons-qty').value, 10);
  const newPrice = parseFloat(document.getElementById('edit-cons-price').value);

  if (isNaN(newQty) || newQty <= 0) {
    alert("La quantité doit être d'au moins 1. Pour supprimer complètement la consommation, utilisez le bouton rouge 'Supprimer la déclaration'.");
    return;
  }

  if (isNaN(newPrice) || newPrice < 0) {
    alert("Le prix unitaire doit être un nombre positif ou nul.");
    return;
  }

  const oldCons = currentEditingConsumption;
  const oldDrinkId = oldCons.drink_id;
  const oldQty = oldCons.quantity || 1;
  const oldPrice = oldCons.price_at_time || 0;
  const oldTotal = oldPrice * oldQty;
  const newTotal = newPrice * newQty;

  const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';
  const todayStr = new Date().toLocaleDateString('fr-FR');
  const updatedRecordedBy = `${oldCons.recorded_by_name || 'Enregistré'} | Rectifié le ${todayStr} par ${adminName} : ${reason}`;

  toggleLoading(true);
  try {
    // 1. Ajustement des stocks de boisson
    if (String(oldDrinkId) === String(newDrinkId)) {
      const qtyDiff = oldQty - newQty; // si newQty < oldQty => qtyDiff > 0 (on remet du stock)
      if (qtyDiff !== 0) {
        const d = drinks.find(x => String(x.id) === String(oldDrinkId));
        if (d && isStockManaged(d)) {
          const updatedStock = (d.stock || 0) + qtyDiff;
          await supabaseClient.from('drinks').update({ stock: updatedStock }).eq('id', oldDrinkId);
          d.stock = updatedStock;
        }
      }
    } else {
      // Changement de boisson : réintégrer l'ancienne et déduire la nouvelle
      const oldD = drinks.find(x => String(x.id) === String(oldDrinkId));
      if (oldD && isStockManaged(oldD)) {
        const updatedOldStock = (oldD.stock || 0) + oldQty;
        await supabaseClient.from('drinks').update({ stock: updatedOldStock }).eq('id', oldDrinkId);
        oldD.stock = updatedOldStock;
      }
      const newD = drinks.find(x => String(x.id) === String(newDrinkId));
      if (newD && isStockManaged(newD)) {
        const updatedNewStock = (newD.stock || 0) - newQty;
        await supabaseClient.from('drinks').update({ stock: updatedNewStock }).eq('id', newDrinkId);
        newD.stock = updatedNewStock;
      }
    }

    // 2. Si la consommation était déjà réglée par crédit, régulariser le compte crédit
    if (oldCons.is_paid && oldCons.paid_by_name?.toLowerCase().includes('crédit')) {
      const priceDiff = oldTotal - newTotal;
      if (priceDiff !== 0) {
        const { data: prof } = await supabaseClient
          .from('profiles')
          .select('credit_balance')
          .eq('id', oldCons.member_id)
          .single();
        const currentBal = parseFloat(prof?.credit_balance) || 0;
        const newBal = currentBal + priceDiff;
        await supabaseClient.from('profiles').update({ credit_balance: newBal }).eq('id', oldCons.member_id);

        try {
          await supabaseClient.from('credit_transactions').insert({
            member_id: oldCons.member_id,
            amount: priceDiff,
            payment_method: 'Régularisation',
            created_by_name: adminName,
            note: `Correction conso #${oldCons.id} : ${reason}`
          });
        } catch (e) {
          console.warn("Table credit_transactions non trouvée :", e);
        }
      }
    }

    // 3. Mettre à jour la ligne dans consumptions
    const updatePayload = {
      drink_id: newDrinkId,
      quantity: newQty,
      price_at_time: newPrice,
      recorded_by_name: updatedRecordedBy,
      note: reason
    };

    let { error: updateErr } = await supabaseClient
      .from('consumptions')
      .update(updatePayload)
      .eq('id', oldCons.id);

    // Si la colonne 'note' n'existe pas encore dans la table sur Supabase, on retente sans elle
    if (updateErr && (updateErr.message?.includes('note') || updateErr.code === '42703')) {
      delete updatePayload.note;
      const retry = await supabaseClient
        .from('consumptions')
        .update(updatePayload)
        .eq('id', oldCons.id);
      updateErr = retry.error;
    }

    if (updateErr) throw updateErr;

    alert("✅ Déclaration de consommation rectifiée avec succès !");
    closeEditConsumptionModal();

    // Recharger les interfaces
    const memId = oldCons.member_id;
    const memName = oldCons.profiles?.full_name || 'Membre';
    const detailModal = document.getElementById('consumption-detail-modal');
    if (detailModal && !detailModal.classList.contains('hidden')) {
      await openMemberConsumptionDetails(memId, memName);
    }
    await loadAppData(true);
    if (typeof loadAdminData === 'function') {
      await loadAdminData();
    }

  } catch (err) {
    console.error("Erreur mise à jour consommation :", err);
    alert("Erreur lors de la rectification : " + err.message);
  } finally {
    toggleLoading(false);
  }
}
window.submitEditConsumption = submitEditConsumption;

async function deleteCurrentConsumption() {
  if (!currentEditingConsumption) return;

  const reasonInput = document.getElementById('edit-cons-reason');
  const reason = reasonInput ? reasonInput.value.trim() : '';

  if (!reason) {
    alert("⚠️ Le motif de suppression est OBLIGATOIRE.\nVeuillez obligatoirement indiquer pourquoi cette déclaration est annulée / supprimée.");
    if (reasonInput) reasonInput.focus();
    return;
  }

  if (!confirm("Voulez-vous vraiment ANNULER et SUPPRIMER cette consommation ?\nLe stock sera réintégré et la suppression sera validée.")) {
    return;
  }

  const oldCons = currentEditingConsumption;
  const adminName = currentUser ? (currentUser.full_name || currentUser.profile?.full_name || currentUser.email) : 'Admin';

  toggleLoading(true);
  try {
    // 1. Réintégrer le stock
    const drink = drinks.find(x => String(x.id) === String(oldCons.drink_id));
    if (drink && isStockManaged(drink)) {
      const restoredStock = (drink.stock || 0) + (oldCons.quantity || 1);
      await supabaseClient.from('drinks').update({ stock: restoredStock }).eq('id', oldCons.drink_id);
      drink.stock = restoredStock;
    }

    // 2. Si payé par crédit, rembourser
    if (oldCons.is_paid && oldCons.paid_by_name?.toLowerCase().includes('crédit')) {
      const refundAmount = (oldCons.price_at_time || 0) * (oldCons.quantity || 1);
      if (refundAmount > 0) {
        const { data: prof } = await supabaseClient
          .from('profiles')
          .select('credit_balance')
          .eq('id', oldCons.member_id)
          .single();
        const currentBal = parseFloat(prof?.credit_balance) || 0;
        const newBal = currentBal + refundAmount;
        await supabaseClient.from('profiles').update({ credit_balance: newBal }).eq('id', oldCons.member_id);

        try {
          await supabaseClient.from('credit_transactions').insert({
            member_id: oldCons.member_id,
            amount: refundAmount,
            payment_method: 'Annulation Conso',
            created_by_name: adminName,
            note: `Annulation conso #${oldCons.id} (${drink?.name || 'Article'}) : ${reason}`
          });
        } catch (e) {
          console.warn("Table credit_transactions non trouvée :", e);
        }
      }
    } else {
      // Trace dans credit_transactions si ardoise
      try {
        await supabaseClient.from('credit_transactions').insert({
          member_id: oldCons.member_id,
          amount: 0,
          payment_method: 'Annulation Ardoise',
          created_by_name: adminName,
          note: `Annulation conso ardoise #${oldCons.id} (${drink?.name || 'Article'}) : ${reason}`
        });
      } catch (e) { }
    }

    // 3. Supprimer de la table consumptions
    const { error: delErr } = await supabaseClient
      .from('consumptions')
      .delete()
      .eq('id', oldCons.id);

    if (delErr) throw delErr;

    alert("✅ Déclaration de consommation supprimée avec succès et stock réintégré !");
    closeEditConsumptionModal();

    const memId = oldCons.member_id;
    const memName = oldCons.profiles?.full_name || 'Membre';
    const detailModal = document.getElementById('consumption-detail-modal');
    if (detailModal && !detailModal.classList.contains('hidden')) {
      await openMemberConsumptionDetails(memId, memName);
    }
    await loadAppData(true);
    if (typeof loadAdminData === 'function') {
      await loadAdminData();
    }

  } catch (err) {
    console.error("Erreur suppression consommation :", err);
    alert("Erreur lors de la suppression : " + err.message);
  } finally {
    toggleLoading(false);
  }
}
window.deleteCurrentConsumption = deleteCurrentConsumption;

async function uploadToSupabase(file) {
  if (!supabaseClient) return null;
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `drink_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
    const filePath = `drinks/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) {
      console.error("Erreur d'upload Supabase:", uploadError.message);
      alert("Erreur d'envoi Supabase : " + uploadError.message + "\n\n(Vérifiez que le bucket 'images' est bien PUBLIC et que les règles RLS autorisent l'upload).");
      return null;
    }

    const { data } = supabaseClient.storage
      .from('images')
      .getPublicUrl(filePath);

    return data?.publicUrl || null;
  } catch (err) {
    console.error("Erreur uploadToSupabase:", err); alert("Erreur technique d'envoi : " + err.message);
    return null;
  }
}

// Drink CRUD
function toggleDrinkStockFields(checked) {
  const fields = document.getElementById('drink-stock-fields');
  if (fields) {
    fields.style.display = checked ? 'grid' : 'none';
  }
}
window.toggleDrinkStockFields = toggleDrinkStockFields;

async function toggleDrinkStockTracking(drinkId, checked) {
  const drink = drinks.find(d => d.id == drinkId);
  const prevStock = (drink && drink.stock !== null && drink.stock !== undefined && drink.stock > -99999) ? drink.stock : 0;
  const newStockVal = checked ? prevStock : null;
  let payload = checked ? { stock: newStockVal, track_stock: true } : { stock: null, alert_threshold: 0, track_stock: false };

  toggleLoading(true);
  let { error } = await supabaseClient.from('drinks').update(payload).eq('id', drinkId);
  if (error && error.message && error.message.includes('track_stock')) {
    delete payload.track_stock;
    const retry1 = await supabaseClient.from('drinks').update(payload).eq('id', drinkId);
    error = retry1.error;
  }
  if (error && !checked && error.message && error.message.toLowerCase().includes('null')) {
    payload.stock = -999999;
    const retry2 = await supabaseClient.from('drinks').update(payload).eq('id', drinkId);
    error = retry2.error;
  }
  toggleLoading(false);

  if (error) {
    alert("Erreur lors de la mise à jour du suivi de stock : " + error.message);
    loadAdminData();
    return;
  }

  if (drink) {
    drink.stock = payload.stock;
    drink.track_stock = checked;
    if (!checked) drink.alert_threshold = 0;
  }
  loadAdminData();
  if (typeof renderCaisseProducts === 'function') renderCaisseProducts();
}
window.toggleDrinkStockTracking = toggleDrinkStockTracking;

document.getElementById('add-drink-btn')?.addEventListener('click', () => {
  editingDrinkId = null;
  document.getElementById('drink-modal-title').textContent = "Ajouter un article / boisson";
  document.getElementById('drink-name').value = '';
  document.getElementById('drink-price').value = '';
  const catSelect = document.getElementById('drink-category');
  if (catSelect) catSelect.value = 'bar';
  const manageStockCb = document.getElementById('drink-manage-stock');
  if (manageStockCb) manageStockCb.checked = true;
  toggleDrinkStockFields(true);
  const stockInput = document.getElementById('drink-stock');
  if (stockInput) stockInput.value = '0';
  document.getElementById('drink-icon').value = 'cup-soda';
  document.getElementById('drink-alert-threshold').value = '0';
  document.getElementById('drink-image-url').value = '';
  document.getElementById('drink-image-file').value = '';
  show('drink-modal');
});

function editDrink(id) {
  const drink = drinks.find(d => d.id == id);
  if (!drink) return;

  editingDrinkId = id;
  document.getElementById('drink-modal-title').textContent = "Modifier l'article";
  document.getElementById('drink-name').value = drink.name;
  document.getElementById('drink-price').value = drink.price;
  const catSelect = document.getElementById('drink-category');
  if (catSelect) catSelect.value = getItemCategory(drink);
  const managed = isStockManaged(drink);
  const manageStockCb = document.getElementById('drink-manage-stock');
  if (manageStockCb) manageStockCb.checked = managed;
  toggleDrinkStockFields(managed);
  const stockInput = document.getElementById('drink-stock');
  if (stockInput) stockInput.value = managed ? drink.stock : 0;
  document.getElementById('drink-alert-threshold').value = managed ? (drink.alert_threshold || 0) : 0;
  document.getElementById('drink-icon').value = drink.icon || 'cup-soda';
  document.getElementById('drink-image-url').value = drink.image_url || '';
  document.getElementById('drink-image-file').value = '';
  show('drink-modal');
  lucide.createIcons();
}
window.editDrink = editDrink;

document.getElementById('save-drink-btn')?.addEventListener('click', async () => {
  try {
    const name = document.getElementById('drink-name').value;
    const price = document.getElementById('drink-price').value;
    const icon = document.getElementById('drink-icon').value;
    let image_url = document.getElementById('drink-image-url').value;
    const imageFile = document.getElementById('drink-image-file').files[0];

    if (!name || !price) return alert("Nom et prix sont requis.");

    show('loading');
    if (imageFile) {
      const uploadedUrl = await uploadToSupabase(imageFile);
      if (uploadedUrl) image_url = uploadedUrl;
    }

    const catSelect = document.getElementById('drink-category');
    const category = catSelect ? catSelect.value : getItemCategory({ name });
    const manageStockCb = document.getElementById('drink-manage-stock');
    const isManaged = manageStockCb ? manageStockCb.checked : true;
    const alert_threshold = document.getElementById('drink-alert-threshold').value;
    const stockInput = document.getElementById('drink-stock');
    const stockVal = isManaged ? (stockInput ? (parseInt(stockInput.value, 10) || 0) : 0) : null;
    const drinkData = {
      name,
      price: parseFloat(price),
      icon,
      image_url,
      stock: stockVal,
      track_stock: isManaged,
      alert_threshold: isManaged ? (parseInt(alert_threshold) || 0) : 0,
      category
    };

    const runSaveDrink = async (data) => {
      if (editingDrinkId) {
        return await supabaseClient.from('drinks').update(data).eq('id', editingDrinkId);
      } else {
        return await supabaseClient.from('drinks').insert(data);
      }
    };

    let res = await runSaveDrink(drinkData);
    if (res && res.error && res.error.message && res.error.message.includes('track_stock')) {
      delete drinkData.track_stock;
      res = await runSaveDrink(drinkData);
    }
    if (res && res.error && res.error.message && res.error.message.includes('category')) {
      delete drinkData.category;
      res = await runSaveDrink(drinkData);
    }
    if (res && res.error && !isManaged && res.error.message && res.error.message.toLowerCase().includes('null')) {
      drinkData.stock = -999999;
      res = await runSaveDrink(drinkData);
    }

    hide('loading');
    if (res && res.error) alert("Erreur de sauvegarde: " + res.error.message);
    else {
      closeModal('drink-modal');
      loadAppData();
      loadAdminData();
    }
  } catch (err) { hide('loading'); alert("Erreur générale: " + err.message); }
});

async function deleteDrink(id) {
  if (!confirm("Supprimer cette boisson ?")) return;
  const { error } = await supabaseClient.from('drinks').delete().eq('id', id);
  if (error) alert("Erreur: " + error.message);
  else {
    loadAppData();
    loadAdminData();
  }
}
window.deleteDrink = deleteDrink;

// Sub Types Logic
document.getElementById('add-subtype-btn')?.addEventListener('click', () => {
  editingSubTypeId = null;
  document.getElementById('subtype-modal-title').textContent = "Ajouter un type d'abonnement";
  document.getElementById('subtype-name').value = '';
  document.getElementById('subtype-duration').value = '';
  document.getElementById('subtype-price').value = '';
  show('subtype-modal');
});

async function editSubType(id) {
  show('loading');
  const { data: type, error } = await supabaseClient.from('subscription_types').select('*').eq('id', id).single();
  hide('loading');

  if (error) return alert("Erreur: " + error.message);

  editingSubTypeId = id;
  document.getElementById('subtype-modal-title').textContent = "Modifier le type d'abonnement";
  document.getElementById('subtype-name').value = type.name;
  document.getElementById('subtype-duration').value = type.duration_days;
  document.getElementById('subtype-price').value = type.price;
  show('subtype-modal');
}

document.getElementById('save-subtype-btn')?.addEventListener('click', async () => {
  const name = document.getElementById('subtype-name').value;
  const duration = document.getElementById('subtype-duration').value;
  const price = document.getElementById('subtype-price').value;

  if (!name || !duration || !price) return alert("Tous les champs sont requis.");

  const subData = { name, duration_days: parseInt(duration), price: parseFloat(price) };

  show('loading');
  let res;
  if (editingSubTypeId) {
    res = await supabaseClient.from('subscription_types').update(subData).eq('id', editingSubTypeId);
  } else {
    res = await supabaseClient.from('subscription_types').insert(subData);
  }
  hide('loading');

  if (res.error) alert("Erreur: " + res.error.message);
  else {
    closeModal('subtype-modal');
    loadAdminData();
  }
});

async function deleteSubType(id) {
  if (!confirm("Supprimer ce type d'abonnement ? ATTENTION: Cela peut impacter les abonnements en cours.")) return;
  const { error } = await supabaseClient.from('subscription_types').delete().eq('id', id);
  if (error) alert("Erreur: " + error.message);
  else loadAdminData();
}

/*
// Config Save
document.getElementById('save-config-btn').addEventListener('click', async () => {
  const name = document.getElementById('cfg-club-name').value;
  const bucket = document.getElementById('cfg-storage-bucket').value;
  let logo = document.getElementById('cfg-logo-url').value;
  const logoFile = document.getElementById('cfg-logo-file').files[0];

  show('loading');
  try {
    if (logoFile) {
      const uploadedUrl = await uploadToSupabase(logoFile);
      if (uploadedUrl) logo = uploadedUrl;
    }

    const updateData = { club_name: name, logo_url: logo, storage_bucket: bucket };

    let res;
    if (settings && settings.id) {
      res = await supabaseClient.from('settings').update(updateData).eq('id', settings.id);
    } else {
      // If no settings exist yet, we use upsert with id:1
      res = await supabaseClient.from('settings').upsert({ id: 1, ...updateData });
    }

    if (res.error) throw res.error;

    alert("Réglages enregistrés !");
    document.getElementById('cfg-logo-file').value = '';
    loadAppData();
  } catch (err) {
    alert("Erreur: " + err.message);
  } finally {
    hide('loading');
  }
});
*/


// --- CSV IMPORT (générique : nom, email, montant, date) ---
document.getElementById('csv-import-btn')?.addEventListener('click', () => {
  document.getElementById('csv-import')?.click();
});

document.getElementById('csv-import')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  show('loading');
  try {
    // Charger les types d'abonnements pour matcher par prix
    const { data: subTypes, error: stErr } = await supabaseClient.from('subscription_types').select('*');
    if (stErr || !subTypes || subTypes.length === 0) {
      throw new Error("Aucun type d'abonnement configuré. Créez-en d'abord dans l'onglet Abonnements.");
    }

    // Lecture du fichier XLS / XLSX / CSV via SheetJS
    const processRows = async (rows) => {
      if (rows.length === 0) throw new Error("Le fichier est vide.");

      const keys = Object.keys(rows[0]);
      console.log('Colonnes disponibles dans le fichier :', keys);

      // Détection des colonnes — ordre de priorité explicite pour les exports AssoConnect
      const emailKey =
        keys.find(k => /adresse\s*email/i.test(k)) ||
        keys.find(k => /email\s*acheteur/i.test(k)) ||
        keys.find(k => /email|mail/i.test(k));

      const firstNameKey = keys.find(k => /pr[eé]nom\s*participant/i.test(k)) ||
        keys.find(k => /pr[eé]nom/i.test(k));
      const lastNameKey = keys.find(k => /^nom\s*participant$/i.test(k)) ||
        keys.find(k => /\bnom\b/i.test(k) && !/pr[eé]nom/i.test(k));
      const nameKey = keys.find(k => /\bname\b|nom complet/i.test(k));

      const amountKey =
        keys.find(k => /montant\s*d[uû]/i.test(k)) ||
        keys.find(k => /montant|prix|tarif|amount|price|cotisation/i.test(k));

      const endDateKey =
        keys.find(k => /date\s*de\s*fin\s*adh[eé]sion/i.test(k)) ||
        keys.find(k => /date\s*fin/i.test(k));

      const startDateKey =
        keys.find(k => /date\s*de\s*d[eé]but\s*adh[eé]sion/i.test(k)) ||
        keys.find(k => /date\s*de\s*paiement/i.test(k)) ||
        keys.find(k => /date\s*d[eé]but/i.test(k)) ||
        keys.find(k => /date\s*paiement|date\s*cr[eé]ation/i.test(k));

      if (!emailKey) throw new Error("Colonne Email introuvable.");
      if (!amountKey) throw new Error("Colonne Montant introuvable.");
      if (!endDateKey) throw new Error("Colonne 'Date de fin adhésion' introuvable.");

      const parseDate = (raw) => {
        if (!raw && raw !== 0) return null;
        if (typeof raw === 'number') return new Date(Math.round((raw - 25569) * 86400 * 1000));
        const s = raw.toString().trim();
        const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
        const ymdMatch = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (dmyMatch) return new Date(`${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`);
        if (ymdMatch) return new Date(s);
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      };

      let imported = 0, skipped = 0, errors = [];

      for (const row of rows) {
        const email = row[emailKey]?.toString().trim().toLowerCase();
        if (!email) { skipped++; continue; }

        let full_name = 'Membre';
        if (firstNameKey && lastNameKey) full_name = `${row[firstNameKey]} ${row[lastNameKey]}`.trim();
        else if (nameKey) full_name = row[nameKey];
        else if (lastNameKey) full_name = row[lastNameKey];
        if (!full_name) full_name = 'Membre';

        const rawAmount = row[amountKey]?.toString().replace(',', '.').replace(/[^0-9.]/g, '');
        const amount = parseFloat(rawAmount);
        if (isNaN(amount)) { errors.push(`${email} : montant invalide`); continue; }

        const endDate = parseDate(row[endDateKey]);
        if (!endDate) { errors.push(`${email} : date fin invalide`); continue; }
        let startDate = parseDate(row[startDateKey]) || new Date();

        let matchedType = subTypes.find(t => Math.abs(parseFloat(t.price) - amount) < 0.01) ||
          subTypes.reduce((p, c) => Math.abs(parseFloat(c.price) - amount) < Math.abs(parseFloat(p.price) - amount) ? c : p);

        const record = {
          email, full_name,
          subscription_type_id: matchedType.id,
          subscription_end_date: endDate.toISOString().split('T')[0]
        };
        const subStartDate = startDate.toISOString().split('T')[0];

        // --- Synchronisation immédiate pour les membres déjà inscrits ---
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('id')
          .eq('email', email)
          .maybeSingle();

        if (profile) {
          // Récupérer le dernier abonnement
          const { data: subs } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('member_id', profile.id)
            .order('end_date', { ascending: false })
            .limit(1);

          const latestSub = subs && subs.length > 0 ? subs[0] : null;

          if (!latestSub || latestSub.type_id !== matchedType.id || latestSub.end_date !== record.subscription_end_date) {
            if (latestSub && latestSub.type_id === matchedType.id) {
              await supabaseClient.from('subscriptions').update({
                end_date: record.subscription_end_date,
                start_date: subStartDate
              }).eq('id', latestSub.id);
            } else {
              await supabaseClient.from('subscriptions').insert({
                member_id: profile.id,
                type_id: matchedType.id,
                start_date: subStartDate,
                end_date: record.subscription_end_date
              });
            }
          }
        }

        const { error: uErr } = await supabaseClient
          .from('imported_members')
          .upsert(record, { onConflict: 'email' });

        if (uErr) errors.push(`${email} : ${uErr.message}`);
        else imported++;
      }

      let msg = `✅ ${imported} membre(s) synchronisé(s) et mis à jour.`;
      if (skipped > 0) msg += `\n⏭ ${skipped} ligne(s) ignorée(s) (email vide).`;
      if (errors.length > 0) msg += `\n⚠️ Erreurs :\n${errors.slice(0, 5).join('\n')}`;
      alert(msg);
      loadAdminData();
    };

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);

        // --- ÉTAPE 1 : lecture du classeur ---
        let workbook;
        try {
          workbook = XLSX.read(data, { type: 'array', cellDates: false });
        } catch (readErr) {
          alert(`❌ SheetJS ne peut pas lire ce fichier.\nErreur : ${readErr.message}\n\nAssurez-vous que le fichier n'est pas corrompu ou protégé par un mot de passe.`);
          hide('loading'); e.target.value = ''; return;
        }

        const sheetNames = workbook.SheetNames;
        if (!sheetNames || sheetNames.length === 0) {
          alert(`❌ Le classeur ne contient aucun onglet.\nFichier peut-être corrompu.`);
          hide('loading'); e.target.value = ''; return;
        }

        // --- ÉTAPE 2 : chercher l'onglet avec le plus de données ---
        let raw = [];
        let usedSheetName = sheetNames[0];
        const sheetDiag = [];

        for (const name of sheetNames) {
          const s = workbook.Sheets[name];
          // Force-expand the declared range in case !ref is too narrow
          if (s['!ref']) {
            try {
              const range = XLSX.utils.decode_range(s['!ref']);
              range.e.r = Math.max(range.e.r, 50000);
              range.e.c = Math.max(range.e.c, 60);
              s['!ref'] = XLSX.utils.encode_range(range);
            } catch (_) { }
          }
          const r = XLSX.utils.sheet_to_json(s, { header: 1, defval: '', raw: true });
          sheetDiag.push(`"${name}" : ${r.length} ligne(s)`);
          if (r.length > raw.length) {
            raw = r;
            usedSheetName = name;
          }
        }

        if (!raw || raw.length === 0) {
          alert(`❌ SheetJS n'a trouvé aucune ligne dans aucun onglet.\n\nOnglets analysés :\n${sheetDiag.join('\n')}\n\nEssayez de sauvegarder le fichier en .xlsx depuis Excel et réessayez.`);
          hide('loading'); e.target.value = ''; return;
        }

        // --- ÉTAPE 3 : détection de la ligne d'en-têtes ---
        const headerRowIdx = raw.findIndex(r => r.filter(c => c !== '' && c !== null && c !== undefined).length >= 2);
        if (headerRowIdx === -1) {
          const sample = raw.slice(0, 3).map(r => JSON.stringify(r)).join('\n');
          alert(`❌ Impossible de trouver une ligne d'en-têtes.\n\nOnglet : "${sheetNames[0]}"\nLignes lues : ${raw.length}\nExemple des 3 premières lignes :\n${sample}`);
          hide('loading'); e.target.value = ''; return;
        }

        const headers = raw[headerRowIdx].map(h => h?.toString().trim());

        // --- ÉTAPE 4 : construction des lignes de données ---
        const rows = [];
        for (let i = headerRowIdx + 1; i < raw.length; i++) {
          const r = raw[i];
          if (!r || r.every(c => c === '' || c === null || c === undefined)) continue;
          const obj = {};
          headers.forEach((h, idx) => { obj[h] = r[idx] ?? ''; });
          rows.push(obj);
        }

        if (rows.length === 0) {
          const headerPreview = headers.slice(0, 10).join(', ');
          const rowAfterHeader = raw[headerRowIdx + 1];
          const sampleRow = rowAfterHeader ? JSON.stringify(rowAfterHeader).substring(0, 200) : '(aucune ligne après en-têtes)';
          alert(`❌ En-têtes trouvés (ligne ${headerRowIdx + 1}) mais aucune ligne de données après.\n\nEn-têtes (10 premiers) : ${headerPreview}\nLigne suivante brute : ${sampleRow}\nNombre total de lignes brutes : ${raw.length}`);
          hide('loading'); e.target.value = ''; return;
        }

        await processRows(rows);
      } catch (err) {
        alert('Erreur lecture fichier : ' + err.message);
      } finally {
        hide('loading');
        e.target.value = '';
      }
    };
    reader.onerror = () => {
      hide('loading');
      alert('Impossible de lire le fichier.');
      e.target.value = '';
    };
    reader.readAsArrayBuffer(file);
  } catch (outerErr) {
    hide('loading');
    alert('Erreur : ' + outerErr.message);
    e.target.value = '';
  }
});

// Fin du fichier app.js
