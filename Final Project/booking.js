

//Retrieve from databa the tutors active = true"
let tutorProfiles = [
    {tutorID: 'nnnnn', name: 'Thomas', sex: 'm', profileURL: './pictures/thomas.png', nearestMRT: 'Yishun', contactNo: '91234567', subject: ['Math', 'English', 'Science'], active: true},
    {tutorID: 'xxxxx', name: 'Cheryl', sex: 'f', profileURL: './pictures/cheryl.png', nearestMRT: 'Bishan', contactNo: '91234568', subject: ['Science', 'English'], active: true}
]

//Re
let tuitionLising = [
    {listingID: 'abc', tutorID: 'nnnnn', date: '23/11/2023', time: '3PM-5PM', status: 'available'},
    {listingID: 'abcd', tutorID: 'nnnnn', date: '24/11/2023', time: '4PM-6PM', status: 'available'},
    {listingID: 'xyz', tutorID: 'xxxxx', date: '22/11/2023', time: '7PM-9PM', status: 'available'},
    {listingID: 'xyzv', tutorID: 'xxxxx', date: '25/11/2023', time: '3PM-5PM', status: 'available'},
    {listingID: 'xyznb', tutorID: 'xxxxx', date: '22/11/2023', time: '7PM-9PM', status: 'available'}
]

let parentProfile = {
    parentID: '2222', name: 'Nickel', sex: 'm', nearestMRT: 'Ang Mo Kio', childEducationLevel: 'Primary', childSex: 'f', childName: 'Kim', subject: ['Math', 'English'] 
}           m     

let mrtCoordinates = {
    Yishun: [1.429666, 103.835044],
    Bishan: [1.35092, 103.848206],
    AngMoKio: [1.370025,103.849588]
}

//open + close modal
const overlay = document.getElementById('overlay');
const openModalBtns = document.querySelectorAll('[data-target]'); //added a selector to identify which modal to open by finding the id allocated to the newly added selector 'data-target'
const closeModalBtns = document.querySelectorAll('.close-button');


//Functions 
//Render TutorProfiles
const app = Vue.createApp({
    data() {
        return {
            tutors: [], //Store Tutor Profiles to display
            selected: null, //store selected Tuition Listing
            notes: '' //parent notes to tutor
        }
    },    
    methods: {
        //convert array subjects to string
        handleSubjectArray() {
            for (tutor of this.tutors) {
                subjectStr = ''
                subjects = tutor['subject']
                //if the length of the array > 1, add 'and ' to the last subject
                if (subjects.length > 1) {
                    for (subject of subjects) {
                        if (subjects.indexOf(subject) == (subjects.length-1)) {
                            subjectStr += `and ${subject}`
                        }
                        else {
                            subjectStr += `${subject}, `
                        }
                    }
                }
                //else just add as a string
                else {
                    subjectStr += subjects.toString()
                }
                //assign the value back the object
                tutor['subject'] = subjectStr
                console.log(subjectStr)      
            }
        },
        //add a list of tuition listing of each tutor into data tutors as a key value pair timeslot: []
        handleTimeSlot() {
            for (tutor of this.tutors) {
                timeSlots = []
                tutorID = tutor.tutorID
                //retrieve the tuition listing from batabase based on the Tutor ID
                for (listing of tuitionLising) {
                    if (tutorID == listing.tutorID) {
                        timeSlots.push(listing)
                    }
                }
                //sort the tuition slots based on date
                timeSlots.sort((a, b) => {
                    const dateA = new Date(a.date.split('/').reverse().join('/'));
                    const dateB = new Date(b.date.split('/').reverse().join('/'));
                    return timeslots = dateA - dateB;
                })
                tutor['timeSlots'] = timeSlots
            }
        },

        calculateDistance() {
            //get coordinates of the parent nearest MRt
            parentMRT = parentProfile.nearestMRT
            parentStr = parentMRT.split(' ').join('')
            parentCoordinates = mrtCoordinates[parentStr]

            for (tutor of this.tutors) {
            //get coordinates of the tutor
                tutorMRT = tutor.nearestMRT
                tutorStr = tutorMRT.split(' ').join('')
                tutorCoordinates = mrtCoordinates[tutorStr]

            //calculate distance
                const origin = new google.maps.LatLng(parentCoordinates[0], parentCoordinates[1]);
                const destination = new google.maps.LatLng(tutorCoordinates[0], tutorCoordinates[1]);

                let distance = google.maps.geometry.spherical.computeDistanceBetween(origin, destination);
                //if more than 1000 meter, display as km else display at meter
                if (distance > 999) {
                    distance = distance/1000
                    distance = [distance.toFixed(1), 'km']
                }

                else {
                    distance = [Math.ceil(distance / 100) * 100, 'm']
                    
                }
                tutor['distance'] = distance
            }
    
        },

        handleBooking() {
            console.log(this.selected, this.notes)
            //update the status of the Tuition Listing to pending
            //Check the Tuition Listings of the Tutor (to make sure that we only render tutors who have available tuition listing)
                //If null => set the 'active' of the tutor to 'false'
        },

        resetSelected() {
            this.selected = null
            this.notes = null
        },

        renderProfiles() {
            this.tutors = tutorProfiles
            this.handleTimeSlot()
            this.handleSubjectArray()
            this.calculateDistance()
        }
        

    }

})

app.mount('#app')










