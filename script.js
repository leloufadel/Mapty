'use strict';

class Workout {
    constructor(distance, duration, coords) {
        this.date = new Date();
        this.id = (Date.now() + '').slice(-10);
        this.distance = distance;
        this.duration = duration;
        this.coords = coords;
    }
}

class Running extends Workout {
    constructor(distance, duration, coords, cadence) {
        super(distance, duration, coords);
        this.type = 'running';
        this.cadence = cadence;
        this.calcPace();
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
    }

    calcSpeed() {
        // Calculate speed in km/h
        this.speed = this.distance / (this.duration / 60); // speed in km per hour
        return this.speed;
    }
}

class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this.form = document.querySelector('.form');
        this.inputType = document.querySelector('.form__input--type');
        this.inputDistance = document.querySelector('.form__input--distance');
        this.inputDuration = document.querySelector('.form__input--duration');
        this.inputCadence = document.querySelector('.form__input--cadence');
        this.inputElevation = document.querySelector('.form__input--elevation');

        this._getPosition();

        this.form.addEventListener('submit', this._newWorkout.bind(this));
        this.inputType.addEventListener('change', this._toggleElevationField.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                () => alert(`Couldn't get your position`)
            );
        }
    }

    _loadMap(position) {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showForm.bind(this));
    }

    _showForm(mapE) {
        this.#mapEvent = mapE;
        this.form.classList.remove('hidden');
        this.inputDistance.focus();
    }

    _toggleElevationField() {
        this.inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        this.inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }

    _newWorkout(e) {
        e.preventDefault();

        const type = this.inputType.value;
        const distance = +this.inputDistance.value;
        const duration = +this.inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng;

        if (!distance || !duration || !lat || !lng) {
            return alert('Please enter valid inputs for distance and duration.');
        }

        let workout;
        if (type === 'running') {
            const cadence = +this.inputCadence.value;
            workout = new Running(distance, duration, [lat, lng], cadence);
        } else if (type === 'cycling') {
            const elevation = +this.inputElevation.value;
            workout = new Cycling(distance, duration, [lat, lng], elevation);
        }

        if (workout) {
            this.#workouts.push(workout);
            this.renderWorkoutMarker(workout);
        }

        this.form.reset();
    }

    renderWorkoutMarker(workout) {
        if (!workout) return;

        L.marker(workout.coords)
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${workout.type}-popup`
                })
            )
            .setPopupContent(`${workout.type} workout`)
            .openPopup();
    }
}

const app = new App();
