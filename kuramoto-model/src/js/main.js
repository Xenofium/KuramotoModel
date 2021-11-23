//REST methods
async function postData(url = '', data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Access-Token': 'herokutest',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data) // body data type must match "Content-Type" header
    });
    return await response.json(); // parses JSON response into native JavaScript objects
}

// App alerts
let alerts = {
    getErrorAlert(string) {
        return {
            position: 'top-end',
            icon: 'error',
            title: string,
            showConfirmButton: false,
            timer: 2500
        }
    },

    guideAlert: {
        title: `How to use app`,
        html: `<ol class="guide-list">
    <li class="guide-list__item">Add oscillators and set settings</li>
    <li class="guide-list__item">Click refresh button</li>
</ol>
<p class="guide__description">Also you can export your scene by clicking on the blue button or import scene with the brown button</p>`,
        width: '60vw',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Apply'

    },

    environmentSettingsAlert: {
        title: `Environment settings`,
        html: `<form class="settings__form">
  <label>Animation time:<input type="text" id="settingsAnimationTime"></label>
  <label>FPS: <input type="text" id="settingsFPS"></label>
</form>
`,
        width: '60vw',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Apply'
    },

    getSettingsAlert(objectName = 'New') {
        return {
            title: `${objectName} settings`,
            html: `<form class="settings__form">
    <label>Color: <input type="color" id="settingsColor"></label>
    <label>Name: <input type="text" id="settingsName"></label>
    <label>Angle(position in degrees): <input type="text" id="settingsAngle"></label>
    <label>Frequency: <input type="text" id="settingsT"></label>
    <label>Connectivity: <input type="text" id="settingsConnectionForce"></label>
</form>
`,
            width: '60vw',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Apply'
        }

    }
}


// Functions to react with modals
function getRad(degrees) {
    return degrees * (Math.PI / 180)
}

function getDeg(radians) {
    return radians / (Math.PI / 180)
}

function validNewObjectSettings() {
    let TInput = document.getElementById('settingsT')
    let angleInput = document.getElementById('settingsAngle')
    let connectionForceInput = document.getElementById('settingsConnectionForce')

    numberInputs = [TInput, angleInput, connectionForceInput]

    for (input of numberInputs) {
        if (isNaN(+input.value)) {
            return false
        }
    }
    return true
}

//download any text file for user
function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}


class OscillatorObject {
    constructor(props) {
        this.id = Math.random().toString(16).slice(2)
        this.color = props.color || '#00D1E0'
        this.name = props.name || 'default'
        this.angle = props.angle || 0
        this.frequency = props.frequency || 1
        this.connectivity = props.connectivity || 1
    }
}

let vm = new Vue({
    el: '#app',

    data: {
        objectList: [new OscillatorObject({})],
        environmentSettings: {
            fps: 60,
            animationTime: 30, //seconds
        }
    },

    methods: {
        changeSettingsSidebarVisibility: function() {
            let settingsSidebar = document.getElementsByClassName('settings')[0]
            settingsSidebar.classList.toggle('settings_opened')
        },

        addObject: function() {
            Swal.fire(alerts.getSettingsAlert()).then((result) => {
                if (result.isConfirmed) {
                    if (!validNewObjectSettings()) {
                        Swal.fire(alerts.getErrorAlert('Some number properties were not numbers'))
                    } else {
                        this.objectList.push(new OscillatorObject(this.getNewObjectSettings()))
                        this.$nextTick(() => {
                            if (this.isOscillatorListOverflowed()) {

                                this.$refs.scrollingList.classList.add('object-list_scroll')
                            }
                        })
                    }
                }
            })

        },

        getNewObjectSettings: function() {
            let colorInput = document.getElementById('settingsColor')
            let nameInput = document.getElementById('settingsName')
            let angleInput = document.getElementById('settingsAngle')
            let TInput = document.getElementById('settingsT')
            let connectionForceInput = document.getElementById('settingsConnectionForce')

            return {
                color: colorInput.value,
                name: nameInput.value,
                angle: getRad(angleInput.value),
                frequency: +TInput.value,
                connectivity: +connectionForceInput.value
            }

        },

        deleteObject(object) {
            for (currentObject of this.objectList) {
                if (currentObject === object) {
                    let indexOfObject = this.objectList.indexOf(object)
                    this.objectList.splice(indexOfObject, 1)
                }
            }
            this.$nextTick(() => {
                if (!this.isOscillatorListOverflowed()) {
                    this.$refs.scrollingList.classList.remove('object-list_scroll')
                }
            })
        },

        validNewEnvironmentSettings() {
            let animationTimeInput = document.getElementById('settingsAnimationTime')
            let FPSInput = document.getElementById('settingsFPS')

            let numberInputs = [animationTimeInput, FPSInput]

            for (input of numberInputs) {
                if (isNaN(+input.value)) {
                    return false
                }
            }

            if ((animationTimeInput.value === '') || (FPSInput.value === '')) {
                return false
            }

            return !((+animationTimeInput.value > 300) || (+FPSInput.value > 240));

        },

        changeEnvironmentSettings() {
            let alertPromise = Swal.fire(alerts.environmentSettingsAlert)

            let animationTimeInput = document.getElementById('settingsAnimationTime')
            let FPSInput = document.getElementById('settingsFPS')
            animationTimeInput.value = this.environmentSettings.animationTime
            FPSInput.value = this.environmentSettings.fps

            alertPromise.then((result) => {
                if (result.isConfirmed) {
                    if (!this.validNewEnvironmentSettings()) {
                        Swal.fire(alerts.getErrorAlert(`Some number properties were not numbers or Animation time > 300 or fps > 240`))
                    } else {
                        this.environmentSettings = {
                            fps: +FPSInput.value,
                            animationTime: +animationTimeInput.value
                        }
                    }
                }
            })

        },

        changeSettings(object) {
            let alertState = Swal.fire(alerts.getSettingsAlert(object.name))

            let colorInput = document.getElementById('settingsColor')
            let nameInput = document.getElementById('settingsName')
            let angleInput = document.getElementById('settingsAngle')
            let TInput = document.getElementById('settingsT')
            let connectionForceInput = document.getElementById('settingsConnectionForce')

            colorInput.value = object.color
            nameInput.value = object.name
            angleInput.value = Math.round(getDeg(object.angle))
            TInput.value = object.frequency
            connectionForceInput.value = object.connectivity

            alertState.then((result) => {
                if (result.isConfirmed) {
                    if (!validNewObjectSettings()) {
                        Swal.fire(alerts.getErrorAlert('Some number properties were not numbers'))
                    } else Object.assign(object, this.getNewObjectSettings())
                }
            })
        },

        updateAnim() {
            //check number of oscillators
            if (this.objectList.length < 2) {
                Swal.fire(alerts.getErrorAlert('Must be 2 or more oscillators'))
                return
            }

            //show loading banner
            let requestIndicator = document.getElementById('requestIndicator')
            requestIndicator.style.display = 'block'

            console.log(this.environmentSettings.fps, this.environmentSettings.animationTime)
                //post oscillators
            postData('https://xenofium-astromodel.herokuapp.com/api/kuramoto/data/trade/', {
                fps: this.environmentSettings.fps,
                time: this.environmentSettings.animationTime,
                objects: this.formattedObjectList,
            }).then((data) => {
                onData(data)
                requestIndicator.style.display = 'none'
            });
        },

        importObjects(evt) {
            let files = evt.target.files;
            let file = files[0];
            let reader = new FileReader();
            reader.readAsText(file)
            reader.onload = () => {
                this.objectList = JSON.parse(reader.result);
                this.checkScrollingListMargin('future')
            }
        },

        exportObjects() {
            download('oscillators.json', JSON.stringify(this.objectList))
        },

        showGuide() {
            Swal.fire(alerts.guideAlert)
        },

        randomizeObjectColor(object) {
            object.color = '#' + Math.random().toString(16).slice(3, 9)
        },

        isOscillatorListOverflowed() {
            // код для вычисления высоты элемента, мб понадобится
            // let oscillatorVerticalSpace =
            //     /*получить высоту элемента */
            //     this.$refs.oscillatorObject[0].offsetHeight
            //     /*получить нижний отступ элемента */
            //     +
            //     Number(window.getComputedStyle(vm.$refs.oscillatorObject[0]).marginBottom.slice(0, -2))
            //     /*получить верхний отступ элемента */
            //     +
            //     Number(window.getComputedStyle(vm.$refs.oscillatorObject[0]).marginTop.slice(0, -2))
            if (this.$refs.scrollingList.scrollHeight > this.$refs.scrollingList.offsetHeight) {
                return true
            }
            return false
        }
    },

    computed: {
        formattedObjectList() {
            let formattedObjectList = {}

            for (let object of this.objectList) {
                let formattedObject = {}
                Object.assign(formattedObject, object)
                delete formattedObject.id
                delete formattedObject.name
                delete formattedObject.color
                formattedObject.start_angle = formattedObject.angle
                delete formattedObject.angle
                formattedObjectList[`${object.id}`] = formattedObject
            }

            return formattedObjectList
        },

    },

})

let objectsImport = document.getElementById('objectsImport')
objectsImport.addEventListener('change', vm.importObjects)