'use strict';

class Workout {
    constructor(distance, duration, coords) {
        this.date = new Date();
        this.id = (Date.now() + '').slice(-10);
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
    }
    _setDescription (){
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;

            }
}

class Running extends Workout {
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.type = 'running';
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        // Calculate pace in min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    constructor(distance, duration, coords, elevationGain) {
        super(distance, duration, coords);
        this.type = 'cycling';
        this.elevationGain = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // Calculate speed in km/h
        this.speed = this.distance / (this.duration / 60); // speed in km per hour
        return this.speed;
    }
}
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const reset = document.querySelector('.reset');


class App {
    #map;
    #mapZoomLevel = 13;
    #mapEvent;
    #workouts = [];
   

    constructor() {
        this._getPosition();
       // Get data from local storage
         this._getLocalStorage();

       // attach event handlers;
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField.bind(this));
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
        reset.addEventListener('click', this._resetWorkout.bind(this));

    }


    _getPosition() {
        if (navigator.geolocation)
          navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this),
            function () {
              alert('Could not get your position');
            }
          );
      }
    
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.pt/maps/@${latitude},${longitude}`);

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }


    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }
    
  _hideForm() {
    // Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

    _toggleElevationField() {
        this.inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        this.inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();

        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;

        if (!distance || !duration || !lat || !lng) {
            return alert('Please enter valid inputs for distance and duration.');
        }

        let workout;
        if (type === 'running') {
            const cadence = +inputCadence.value;
            workout = new Running(distance, duration, [lat, lng], cadence);
        } else if (type === 'cycling') {
            const elevation = +inputElevation.value;
            workout = new Cycling(distance, duration, [lat, lng], elevation);
        }

    //     // Add new object to workout array
        this.#workouts.push(workout);
    
        // Render workout on map as marker
        this._renderWorkoutMarker(workout);
    
        // Render workout on list
        this._renderWorkout(workout);
    
        // // Hide form + clear input fields
        // this._hideForm();
    
        // // Set local storage to all workouts
        // this._setLocalStorage();
      }
    
      _renderWorkoutMarker(workout) {
        L.marker(workout.coords)
          .addTo(this.#map)
          .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${workout.type}-popup`,
            })
          )
          .setPopupContent(
            `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`
          )
          .openPopup();
      }
    _renderWorkout(workout) {
        let html = `
          <li class="workout workout--${workout.type}" data-id="${workout.id}">
            <h2 class="workout__title">${workout.description}</h2>
            <div class="workout__details">
              <span class="workout__icon">${
                workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
              }</span>
              <span class="workout__value">${workout.distance}</span>
              <span class="workout__unit">km</span>
            </div>
            <div class="workout__details">
              <span class="workout__icon">⏱</span>
              <span class="workout__value">${workout.duration}</span>
              <span class="workout__unit">min</span>
            </div>
        `;
    
        if (workout.type === 'running')
        html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;
  
      if (workout.type === 'cycling')
        html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
        `;
        form.insertAdjacentHTML('afterend', html);

}

_moveToPopup(e) {
    
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    console.log(workout);

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

   
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

//   reset() {
//     localStorage.removeItem('workouts');
//     location.reload();
//     console.log('hi')
//   }

}
const app = new App();
