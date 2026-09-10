const request = indexedDB.open('UniversityInfo', 1);
request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('Students', { keyPath: 'id', autoIncrement: true });
};
let db;
request.onsuccess = function (event) {
    db = event.target.result;
};
function addStudent(data) {
    const transaction = db.transaction('Students', 'readwrite');
    const store = transaction.objectStore('Students');
    const addRequest = store.add(data);
    addRequest.onsuccess = function () {
    console.log('Студент добавлен');
    };
    addRequest.onerror = function () {
    console.log(addRequest.error)
    };
};