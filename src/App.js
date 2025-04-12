import { PokemonTeamViewModel } from "../viewModel.js"; //importar el viewModel para los llamados
import PokemonCard from "./PokemonCard.js"; // Importar el componente PokemonCard para mostrar les cartes de Pokémon

export const App = {
  components: {
    "pokemon-card": PokemonCard,
  },
  template: /*html*/ `
  <div>
  <!-- Secció de configuració -->
  <section v-if="currentScreen === 'setup'" class="setup-container">
      <h2 class="setup-title">Configuració dels Jugadors</h2>
      <p class="setup-instruccions">
          Introdueix els noms dels jugadors per començar el joc.
      </p>
  
      <div class="toggle-container">
          <label for="two-players-toggle">Dos Jugadors:</label>
          <label class="switch">
          <input type="checkbox" v-model="isTwoPlayers" />
          <span class="slider round"></span>
          </label>
      </div>
  
      <div class="player-input-group">
          <label for="player1-name" class="player-label">Nom del Jugador 1:</label>
          <input type="text" v-model="player1Name" class="player-input" required />
      </div>
  
      <div class="player-input-group" v-if="isTwoPlayers">
          <label for="player2-name" class="player-label">Nom del Jugador 2:</label>
          <input type="text" v-model="player2Name" class="player-input" required />
      </div>
  
      <button @click="startGame" class="setup-button">Següent</button>
  </section>
        <!-- Secció de selecció de l'equip -->
  <section v-if="currentScreen === 'teamSelection'" id="team-selection-section">
      <h2>Selecciona el teu Equip</h2>
      <h2>{{ currentPlayerSelectionMessage }}</h2>        
      <h2 id="credits-display">
          Crèdits restants: <span id="credits-value">{{ creditsDisplay }}</span>
      </h2>
      <div id="team-section">
          <h2 id="current-player-selection">{{ currentPlayerSelectionDisplay }}</h2>
          <div id="selected-team-grid" class="grid-container" ref="teamContainer">
            <pokemon-card
            v-for="(poke, index) in currentPlayerTeam"
            :key="index"
            :pokemon="poke"
            :is-selected="isPokemonInTeam(poke.name)"
            @toggle-selection="handleToggleSelection"
            />
          </div>
      </div>

      <button id="next-player-button" @click="handleNextPlayer">
          {{buttonLabel}}
      </button>
      <!-- Opcions d'ordenació -->
      <div id="sort-options-section">
          <h2>Opcions d'Ordenació</h2>
          <form id="sort-options-form">
              <fieldset>
                  <legend>Ordena per:</legend>
                  <label>
                  <input type="radio" name="sort-criteria" value="name" v-model="sortCriteria" />
                  Nom
                  </label>
                  <label>
                  <input type="radio" name="sort-criteria" value="points" v-model="sortCriteria" />
                  Punts
                  </label>
                  <label>
                  <input type="radio" name="sort-criteria" value="type" v-model="sortCriteria" />
                  Tipus
                  </label>
              </fieldset>
              <fieldset>
                  <legend>Mètode d'ordenació:</legend>
                  <label>
                  <input type="radio" name="sort-method" value="bubble" v-model="sortMethod" />
                  Bombolla
                  </label>
                  <label>
                  <input type="radio" name="sort-method" value="insertion" v-model="sortMethod" />
                  Inserció
                  </label>
                  <label>
                  <input type="radio" name="sort-method" value="selection" v-model="sortMethod" />
                  Selecció
                  </label>
              </fieldset>
              <button type="button" id="sort-team" @click="handleSortOptions">
              Ordenar
              </button>
          </form>
      </div>
      <div id="pokemon-grid" class="grid-container" ref="gridContainer">
          <pokemon-card
          v-for="(poke, index) in globalPokemonList"
          :key="index"
          :pokemon="poke"
          :is-selected="isPokemonInTeam(poke.name)"
          @toggle-selection="handleToggleSelection"
          />
      </div>
  </section>



     <!-- Secció de visualització d'equips -->
   <section v-if="currentScreen === 'battle'" id="teams-overview-section">
  <h2>Vista General dels Equips</h2>
  <p> HE REDUCIDO EL INTERVALO A 1 SEGUNDO PARA LAS PRUEBAS </p>
  <h3>{{ player1Name }}'s Team</h3>
  <div id="player1-team-display" class="player1-selected-team-grid">
    <pokemon-card
      v-for="(poke, index) in player1Team"
      :key="index"
      :pokemon="poke"
      :is-selected="true"
    />
  </div>
  <h3>{{ player2Name }}'s Team</h3>
  <div id="player2-team-display" class="player2-selected-team-grid">
    <pokemon-card
      v-for="(poke, index) in player2Team"
      :key="index"
      :pokemon="poke"
      :is-selected="true"
    />
  </div>
</section>

<!-- Arena de Combat -->
<section v-if="currentScreen === 'battle'" id="battle-arena-section">
  <div class="battle-container">
    <div id="pokemon1-display" class="pokemon-fighter">
      <pokemon-card :pokemon="currentPokemon1" :is-selected="true" v-if="currentPokemon1" />
    </div>
    <p class="vs-text">VS</p>
    <div id="pokemon2-display" class="pokemon-fighter">
      <pokemon-card :pokemon="currentPokemon2" :is-selected="true" v-if="currentPokemon2" />
    </div>
    <div class="battle-log-container">
      <h2>Registre de la Batalla</h2>
      <div id="battle-log">{{ battleLog }}</div>
    </div>
  </div>
</section>

<!-- Secció de la Batalla -->
<section v-if="currentScreen === 'battle'" id="battle-section">
  <h2>Moment de la Batalla!</h2>
  <p id="current-turn-display">{{ currentTurnMessage }}</p>
  <button @click="startBattle">Començar Batalla</button>
</section>
</div>    
`,
  data() {
    return {
      jsonUrl: "./pokemon_data.json", // URL del fitxer JSON
      viewModel: new PokemonTeamViewModel(), // Instància del ViewModel
      currentScreen: "setup", // Pantalla actual (setup, teamSelection, battle)
      gridContainer: "", // Referència al contenidor de la graella
      teamGrid: "", // Referència a la graella d'equips seleccionats
      creditsDisplay: "", // Referència a la visualització de crèdits
      playerSetupSection: "", // Referència a la secció de configuració del jugador
      teamSelectionSection: "", // Referència a la secció de selecció d'equips
      battleSection:"",
      twoPlayersToggle: "",
      currentPlayerSelectionDisplay: "",
      player2Container: "",
      currentPokemon1: null,  // Pokémon actual del jugador 1 para la batalla
      currentPokemon2: null, 
      currentPlayer: 1,
      isTwoPlayers: true,
      player1Name: "",
      player2Name: "",
      currentPlayerSelectionMessage: "", 
      currentPlayerSelectionDisplay: "",
      //      creditsDisplay: "",
      sortCriteria: "",
      sortMethod: "",
      globalPokemonList: [],
      //      currentPlayerTeam: [],
      showTeamList: [],
      buttonLabel: "Següent Jugador",
    };
  },
  methods: {
    init(){ // Inicializa el ViewModel
      this.cacheDom();
      this.bindEvents();
  //    await this.fetchAndLoadPokemons();
  //    this.renderGlobalList();
  //    this.updateCreditsDisplay();
    },
    toggleTwoPlayersMode() { // Alterna entre el mode de dos jugadors i un jugador
      if (this.twoPlayersToggle.checked) {
          this.player2Container.style.display = "block";
      } else {
          this.player2Container.style.display = "none";
          document.getElementById("player2-name").value = "CPU";
      }
    },
    async fetchAndLoadPokemons() { // Carrega les dades dels Pokémon des d'un fitxer JSON
      try {
        console.log("Fetching from URL:", this.jsonUrl);
        const response = await fetch(this.jsonUrl);
        if (!response.ok) {
          throw new Error("HTTP error: " + response.status);
        }
        const data = await response.json();
        console.log("Data fetched:", data);
        this.viewModel.pokemonList.loadPokemons(data);
      } catch (error) {
        console.error("Error loading Pokémon data:", error);
      }
    },
    startTeamSelection() { // Inicia la selecció d'equips para el jugador actual y actualiza la vista
      // Read player names from the setup form
      const player1Name = document.getElementById("player1-name").value.trim();
      let player2Name = document.getElementById("player2-name").value.trim();
  
      // If the toggle is off, set Player 2 to CPU
      if (!this.twoPlayersToggle.checked) {
          player2Name = "CPU";
      }
  
      // Validation: Ensure at least Player 1 has a name
      if (!player1Name) {
          alert("Please enter a name for Player 1.");
          return;
      }
  
      // Call initializeMatch() on the ViewModel to set up players
      this.viewModel.initializeMatch(player1Name, player2Name);
  
      // Transition to the team selection screen
      this.playerSetupSection.style.display = "none";
      this.teamSelectionSection.style.display = "block";
  
      // Set up for Player 1's team selection
      this.currentPlayer = 1;
      this.currentPlayerSelectionDisplay.textContent = `${player1Name}, selecciona el teu Pokémon`;
      this.renderGlobalList();
      this.updateCreditsDisplay();
  },
  transitionToBattle() { // Transición a la pantalla de batalla
    // Hide team selection and sort options.
    this.teamSelectionSection.style.display = "none";
    document.getElementById("sort-options-section").style.display = "none";

    // Show the battle section.
    this.battleSection.style.display = "block";

    // For example, update the battle header with Player 1’s turn.
    document.getElementById("current-turn-display").textContent =
      `Comença la batalla: ${this.viewModel.player1.getName()}!`;

    // (Optionally, you might also render both teams in the battle section.)
  },
  async startBattle() { // Inicia la batalla entre els dos jugadors
    this.currentScreen = 'battle'; // Cambia a la pantalla de batalla
    console.log("🔥 Iniciant la batalla...");
  
    // Bucle para simular las rondas mientras ambos equipos tengan Pokémon
    while (
      this.viewModel.player1.team.selectedTeam.length > 0 &&
      this.viewModel.player2.team.selectedTeam.length > 0
    ) {
      await this.fightRound(); // Ejecuta una ronda y espera a que termine
    }
  
    // Limpia los Pokémon de la arena solo al final de la batalla
    this.currentPokemon1 = null;
    this.currentPokemon2 = null;
  
    this.updateBattleState(); // Actualiza el estado después de la batalla
    console.log("🏆 Batalla finalitzada!");
  },
  async fightRound() { // Simula una ronda de batalla entre dos Pokémon y actualitza la vista para mostrar els resultats cuandos acabi la ronda
    const pokemon1 = this.viewModel.getRandomFighter(this.viewModel.player1.team);
    const pokemon2 = this.viewModel.getRandomFighter(this.viewModel.player2.team);
  
    if (!pokemon1 || !pokemon2) return;
  
    // Actualiza los Pokémon actuales en la arena (sin retrasos ni limpieza)
    this.currentPokemon1 = pokemon1;
    this.currentPokemon2 = pokemon2;
  
    // Ejecuta la lógica de la ronda desde el viewModel
    await this.viewModel.fightRound();
  },

  updateBattleState() { // Actualiza el estado de la batalla después de cada ronda
    // Actualiza el registro de la batalla desde el DOM
    const battleLogElement = document.getElementById('battle-log');
    this.battleLog = battleLogElement.textContent;

    // Verifica si hay un ganador
    if (this.viewModel.player1.team.selectedTeam.length === 0) {
      this.battleLog += `\n🏆 ${this.viewModel.player2.name} ha guanyat!`;
    } else if (this.viewModel.player2.team.selectedTeam.length === 0) {
      this.battleLog += `\n🏆 ${this.viewModel.player1.name} ha guanyat!`;
    }
  },
  created() { // Inicializa el ViewModel
    // Inicializa los nombres de los jugadores y los equipos
    this.viewModel.initializeMatch(this.player1Name, this.player2Name);
    // Configura el equipo del CPU si es necesario
    this.viewModel.autoSelectCpuTeam();
  },

updateTeamsDisplay() { // Actualitza la visualització dels equips seleccionats cada vegada que es canvia de jugador
 
  // Clear previous lists
  this.player1List.innerHTML = "";
  this.player2List.innerHTML = "";

  let turn = this.currentPlayer;
  // Populate Player 1's Team
  this.currentPlayer=1;
  this.showTeam(this.player1List);
  
  // Populate Player 2's Team
  this.currentPlayer=2;
  this.showTeam(this.player2List);
  this.currentPlayer=turn;
},

    startGame() { // Inicia el joc i mostra la pantalla de selecció d'equips
      //      this.view.bindEvents();
      if (!this.player1Name || (this.isTwoPlayers && !this.player2Name)) {
        alert("Si us plau, introdueix els noms de tots els jugadors.");
        return;
      }
      if (!this.isTwoPlayers) {
        this.player2Name = "CPU";
      }
      console.log(
        `Jugador 1: ${this.player1Name}, Jugador 2: ${this.player2Name}`
      );
      this.currentScreen = "teamSelection";
      this.creditsDisplay = this.viewModel.currentPlayer.team.credits;
      this.startTeamSelection();
    },
    startTeamSelection() { // Inicia la selecció d'equips per al jugador actual i actualitza la vista
      // Call initializeMatch() on the ViewModel to set up players
      this.viewModel.initializeMatch(this.player1Name, this.player2Name);
      // Set up for Player 1's team selection
      this.viewModel.currentPlayer = this.viewModel.player1;
      this.currentPlayerSelectionMessage = `${this.player1Name}, selecciona el teu equip Pokémon`;
      this.renderGlobalList();
      //      this.updateCreditsDisplay();
    },
    // Exemple del mètode adaptat
    renderGlobalList() { // Renderitza la llista global de Pokémon
      // En lloc de manipular el DOM, actualitzem la propietat reactiva:
      this.globalPokemonList = this.viewModel.getGlobalList();
      // Això farà que Vue re-renderitzi la graella amb la nova llista.
    },
    renderSelectionTeam() { // Renderitza l'equip seleccionat del jugador actual
      this.currentPlayerTeam = this.viewModel.currentPlayer.getTeam();
    },
    handleNextPlayer() { // Maneja la transició al següent jugador
      if (this.viewModel.currentPlayer === this.viewModel.player1) {
        this.viewModel.switchPlayer();
        if (this.isTwoPlayers) {
          this.currentPlayerSelectionMessage = `${this.player2Name}, selecciona el teu equip Pokémon`;
          this.buttonLabel = "Fi de la selecció d'equips";
        } else {
          this.viewModel.autoSelectCpuTeam();
          this.currentScreen = "battle"; // Transición directa a batalla para un jugador
        }
      } else {
        this.currentScreen = "battle"; // Ambos jugadores han seleccionado sus equipos
      }
    },
    updateCurrentPlayerTeam() { // Actualitza l'equip del jugador actual
      // En lloc de manipular el DOM, actualitzem la propietat reactiva:
      this.currentPlayerTeam = this.viewModel.getCurrentTeam();
      // Això farà que Vue re-renderitzi la graella amb la nova llista.
    },
    handleSortOptions() { // Maneja les opcions d'ordenació seleccionades
      this.viewModel.sortGlobalList(this.sortCriteria, this.sortMethod);
      this.renderGlobalList();
    },
    updateCreditsDisplay() { // Actualitza la visualització de crèdits
      this.creditsDisplay = `${this.viewModel
        .getCurrentPlayer()
        .getCredits()}`;
    },
    isPokemonInTeam(name) { // Comprova si un Pokémon està a l'equip del jugador actual y retorna un booleà
      const playerTeam =
        this.viewModel.currentPlayer === this.viewModel.player1
          ? this.viewModel.player1.team
          : this.viewModel.player2.team;
      return playerTeam.selectedTeam.some((p) => p.name === name);
    },
    // Called from inside the parent when child emits `toggle-selection`
    handleToggleSelection(pokemon) { // Maneja la selecció/deselecció d'un Pokémon
      // If it's already in the team, remove it. Otherwise, try to add it.
      const isInTeam = this.isPokemonInTeam(pokemon.name);
      if (isInTeam) {
        this.viewModel.removePokemonFromTeam(pokemon.name);
      } else {
        const addResult =
          this.viewModel.addPokemonToCurrentPlayer(pokemon);
        if (!addResult) {
          alert("No es pot afegir el Pokémon.");
        }
      }

      // After adding/removing, refresh the player's team
      //      this.updateCurrentPlayerTeam();
      // Possibly update credits or other UI
      //      this.updateCreditsDisplay();
    },
  },
  // Altres mètodes...
  mounted() {
    this.fetchAndLoadPokemons();
    // Aquí pots comprovar la referència del grid si cal
    console.log("Grid container:", this.$refs.gridContainer);
  },
  // ...
  computed: {
    player1Team() { // Retorna l'equip seleccionat del jugador 1
      return this.viewModel.player1.team.selectedTeam;
    },
    player2Team() { // Retorna l'equip seleccionat del jugador 2
      return this.viewModel.player2.team.selectedTeam;
    },
    currentTurnMessage() { // Retorna el missatge del torn actual
      return `És el torn de ${this.viewModel.getCurrentPlayer().name}`;
    },
    creditsDisplay() { // Retorna la visualització de crèdits
      // Return the current player’s credits directly from the viewModel
      return this.viewModel.currentPlayer.team.credits;
    },
    currentPlayerTeam() { //  
      return this.viewModel.getCurrentTeam();
    },
  },
};
