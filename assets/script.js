$(document).ready(function() {
    // Получение текущих даты и времени
    const currentDate = new Date();
    const currentTime = currentDate.getHours() + ':' + currentDate.getMinutes();

    // Установка минимальной и максимальной даты для выбора
    $('#date').attr('min', getMinDate());
    $('#date').attr('max', getMaxDate());

    // Загрузка данных из LocalStorage
    loadDataFromLocalStorage();

    // Обработчик изменения даты
    $('#date').on('change', function() {
        const selectedDate = $(this).val();
        renderSessions(selectedDate);
    });

    // Обработчик клика на сеанс
    $('#sessions').on('click', 'li', function() {
        const sessionId = $(this).data('session-id');
        const selectedDate = $('#date').val();
        renderSeats(sessionId, selectedDate);
    });

    // Обработчик клика на место
    $('#seats-table').on('click', '.seat', function() {
        if ($(this).hasClass('archived')) return;

        const seatId = $(this).data('seat-id');
        const isBooked = $(this).hasClass('booked');

        if (!isBooked) {
            bookSeat(seatId);
        } else {
            cancelBooking(seatId);
        }
    });
});

// Функция для получения минимально допустимой даты
function getMinDate() {
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    return oneWeekAgo.toISOString().split('T')[0];
}

// Функция для получения максимально допустимой даты
function getMaxDate() {
    const currentDate = new Date();
    const oneWeekLater = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    return oneWeekLater.toISOString().split('T')[0];
}

// Функция для загрузки данных из LocalStorage
function loadDataFromLocalStorage() {
    let data = localStorage.getItem('bookingData');
    if (data) {
        data = JSON.parse(data);
        console.log("Данные загружены из LocalStorage:", data);
    } else {
        data = {};
    }
    window.data = data;
}

// Функция для сохранения данных в LocalStorage
function saveDataToLocalStorage() {
    localStorage.setItem('bookingData', JSON.stringify(window.data));
}

// Функция для рендеринга списка сеансов
function renderSessions(date) {
    const sessions = [];
    for (let i = 9; i <= 21; i += 2) {
        sessions.push({
            time: `${i}:00`,
            bookedSeats: window.data[date] ? window.data[date][`${i}:00`] : [],
        });
    }

    const $sessionsList = $('#sessions');
    $sessionsList.empty();

    sessions.forEach((session, index) => {
        const li = $('<li>')
            .addClass('session')
            .data('session-id', index)
            .text(`${session.time}`);

        if (new Date(date + 'T' + session.time) < new Date()) {
            li.addClass('archived');
        }

        $sessionsList.append(li);
    });
}

// Функция для рендеринга схемы зала
function renderSeats(sessionIndex, date) {
    const seatsPerRow = 10;
    const totalRows = 5;
    const sessionTime = `${9 + sessionIndex * 2}:00`;
    const bookedSeats = window.data[date] && window.data[date][sessionTime] || [];

    const $seatsTableBody = $('#seats-table tbody');
    $seatsTableBody.empty();

    for (let row = 0; row < totalRows; row++) {
        const tr = $('<tr>');

        for (let col = 0; col < seatsPerRow; col++) {
            const seatId = `R${row + 1}C${col + 1}`;
            const td = $('<td>')
                .addClass('seat')
                .data('seat-id', seatId);

            if (bookedSeats.includes(seatId)) {
                td.addClass('booked');
            } else {
                td.addClass('available');
            }

            if (new Date(date + 'T' + sessionTime) < new Date()) {
                td.addClass('archived');
            }

            tr.append(td);
        }

        $seatsTableBody.append(tr);
    }

    updateFreeSeatsCount(bookedSeats.length);
}

// Функция для обновления количества свободных мест
function updateFreeSeatsCount(bookedSeatsCount) {
    const freeSeatsCount = 50 - bookedSeatsCount;
    $('#free-seats-count').text(freeSeatsCount);
}

// Функция для бронирования места
function bookSeat(seatId) {
    const selectedDate = $('#date').val();
    const selectedSession = $('.session.active').data('session-id');
    const sessionTime = `${9 + selectedSession * 2}:00`;

    if (!window.data[selectedDate]) {
        window.data[selectedDate] = {};
    }

    if (!window.data[selectedDate][sessionTime]) {
        window.data[selectedDate][sessionTime] = [];
    }

    window.data[selectedDate][sessionTime].push(seatId);

    saveDataToLocalStorage();

    renderSeats(selectedSession, selectedDate);
}

// Функция для отмены бронирования
function cancelBooking(seatId) {
    const selectedDate = $('#date').val();
    const selectedSession = $('.session.active').data('session-id');
    const sessionTime = `${9 + selectedSession * 2}:00`;

    if (window.data[selectedDate] && window.data[selectedDate][sessionTime]) {
        const index = window.data[selectedDate][sessionTime].indexOf(seatId);
        if (index !== -1) {
            window.data[selectedDate][sessionTime].splice(index, 1);
        }
    }

    saveDataToLocalStorage();

    renderSeats(selectedSession, selectedDate);
}