function openDatabase() {
    return new Promise (function(resolve, reject){
        const request = indexedDB.open('UniversityInfo', 1)
        request.onupgradeneeded = function(event) {
            const db = event.target.result
            db.createObjectStore (
                'Students', {keyPath: 'id', autoIncrement: true}
            )
        }
        request.onsuccess = function(event) {
            resolve(event.target.result)
        }

        request.onerror = function(event) {
            reject(request.error)
        }
    })
}
const dbPromise = openDatabase()

async function addStudent(data) {
    const db = await dbPromise;

    const transaction = db.transaction('Students', 'readwrite');
    const store = transaction.objectStore('Students');
    const request = store.add(data);

    return new Promise(function(resolve, reject) {
        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}
async function getAllStudents () {
    const db = await dbPromise;
    const transaction = db.transaction('Students', 'readonly')
    const store = transaction.objectStore('Students')
    const request = store.getAll()
    return new Promise(function(resolve, reject){
        request.onsuccess = function () {
            resolve(request.result)
        }

        request.onerror = function () {
            reject(request.error)
        }
    })

}
async function deleteStudent(id) {
    const db = await dbPromise;
    const transaction = db.transaction('Students', 'readwrite')
    const store = transaction.objectStore('Students')
    const request = store.delete(id)
    return new Promise (function(resolve,reject){
        request.onsuccess = function(){
            resolve()
        }
        request.onerror = function(){
            reject(request.error)
        }
    })
}
async function getStudent (id) {
    const db = await dbPromise;
    const transaction = db.transaction('Students', 'readonly')
    const store = transaction.objectStore('Students')
    const request = store.get(id)
    return new Promise(function(resolve, reject){
        request.onsuccess = function () {
            resolve(request.result)
        }

        request.onerror = function () {
            reject(request.error)
        }
    })

}
async function updateStudent(student) {
    const db = await dbPromise;

    const transaction = db.transaction('Students', 'readwrite');
    const store = transaction.objectStore('Students');
    const request = store.put(student);

    return new Promise(function(resolve, reject) {
        request.onsuccess = function() {
            resolve();
        };

        request.onerror = function() {
            reject(request.error);
        };
    });
}
