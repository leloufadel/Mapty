'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
let speed, pace;

/////////////////////////////////////////////////////
class App {
    #map; 
    #mapEvent;
    #workout = [];
    constructor(){
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this))

        inputType.addEventListener('change',  this._toggleElevationField
           
        )
    }    
    _getPosition(){
        if(navigator.geolocation)
navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
    alert(`couldn't get your position`)
}) 
    }
   
    _loadMap(position) {
          
            const {latitude} = position.coords;
            const {longitude} = position.coords;
         const coords = [latitude, longitude]
        //    console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
         
            this.#map = L.map('map').setView(coords, 13);
         
         L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
             attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
         }).addTo(this.#map);
         // Handling clicks on maps
         this.#map.on('click', this._showForm.bind(this) 
             
         
         );
        
        }
    _showForm(mapE){
        this.#mapEvent = mapE;
             form.classList.remove('hidden');
             inputDistance.focus();
    }
    _toggleElevationField(){
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    
    }
    _newWorkout(e) {
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositives = (...inputs) => inputs.every(inp => inp > 0)
        
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;
        // Prevent default ;
        e.preventDefault();
      // if workout running , create running Object
if(type === 'running'){
    const cadence = +inputCadence.value;
    if(!validInputs(distance, duration, cadence) || !allPositives(distance, duration, cadence))
     return alert('Inputs have to be a Positive Number');

    workout = new Running( distance, duration, [lat, lng], cadence);

}
      // if workout cycling, create cycling Object
      if(type === 'cycling'){

        const elevation = +inputElevation.value;
        if(!validInputs(distance, duration, elevation) || !allPositives(distance, duration))
     return alert('Inputs have to be a Positive Number')
     workout = new Cycling( distance, duration, [lat, lng], elevation);

    }
    // add new object to workout Array: 

    this.#workout.push(workout);

     console.log(workout);

        // clear fields: 
        inputElevation.value = inputCadence.value = inputDistance.value = inputDuration.value = '';
      
          L.marker([lat, lng]).addTo(this.#map)
          .bindPopup(
          L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose:false,
              closeOnClick:false,
              className: 'running-popup',
          })
          )
          .setPopupContent('workout')
          .openPopup();
      
      }
      renderWorkoutMarker(){
        
      }
 }

 class Workout {
    date = new Date();
     id = (Date.now() + ('').slice(-10));
 
     constructor(distance, duration, coords){
     this.distance = distance;
     this.duration = duration;
     this.coords = coords;
     }
 }
 
 class Running extends Workout{ 
     constructor(distance, duration, coords, cadence){
 
     super(distance, duration, coords) 
     this.cadence = cadence;
     this.pace();
     }
     pace(){
         //min/km
         this.pace = this.duration / this.distance;
         return pace;
     }
     
 }
 class Cycling extends Workout{ 
         constructor(distance, duration, coords, elevationGain){
 
     super(distance, duration, elevationGain) 
     this.elevationGain = elevationGain;
     this.calcspeed();
 
     }
     calcspeed(){
         //min/km
         this.speed = this.distance / (this.duration/60);
         return speed;
     }
 }
 
 const run1 = new Running(39, -12, 5.2, 24, 178);
 const cycling1 = new Cycling([39, -12], 5.2, 24, 178);
//   console.log(run1, cycling1)
const app = new App();



