(function() {
    'use strict';

    var app = {
        isLoading: true,
        visibleCards: {},
        selectedCities: [],
        spinner: document.querySelector('.loader'),
        cardTemplate: document.querySelector('.cardTemplate'),
        container: document.querySelector('.main'),
        addDialog: document.querySelector('.dialog-container'),
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun']
    }

    document.getElementById('butRefresh').addEventListener('click', () => {
        app.updateForecast();
    });

    document.getElementById('butAdd').addEventListener('click', () => {
        app.toggleAddDialog(true);
    });

    document.getElementById('butAddCity').addEventListener('click', () => {
        var select = document.getElementById('selectCityToAdd');
        var selected = select.options[select.selectedIndex];
        var key = selected.value;
        var label = selected.textContent;
        if (!app.selectedCities) {
            app.selectedCities = [];
        }

        app.getForecast(key, label);
        app.selectedCities.push({ key: key, label: label });
        //app.saveSelectedCities();
        app.toggleAddDialog(false);
    });

    document.getElementById('butAddCancel').addEventListener('click', () => {
        app.toggleAddDialog(false);
    });

    app.toggleAddDialog = function(visible) {
        if (visible) {
            app.addDialog.classList.add('dialog-container--visible');
        } else {
            app.addDialog.classList.remove('dialog-container--visible'); 
        }
    }

    app.updateForecastCard = function(date) {
        var dataLastUpdated = new data('.data-related');
        var sujnrise = data.channel.astronomy.sunrise;
        var sunset = data.channel.astronomy.sunset;
        var currrent = data.channel.item.condition;
        var humidity = data.channel.astronomy.humidity;
        var wind = data.channel.wind;

        var card = app.visibleCards[data.key];
        if (!card) {
            card = app.cardTemplate.cloneNode(true);
            card.classList.remove('cardTemplate');
            card.querySelector('.location').textContent = data.label;
            card.removeAttribute('hidden');
            app.container.appendChild(card);
            app.visibleCards[data.key] = card;
        }

        var cardLastupdatedElem = card.querySelector('.card-last-updated');
        var cardLastupdated = cardLastupdatedElem.textContent;
        if (cardLastupdated) {
            cardLastUpdated = new Date(cardLastUpdated);
            if (dataLastUpdated.getTime() < cardLastupdated.getTime()) {
                return;
            }
        }
        cardLastupdatedElem.textContent = data.created;

        card.querySelector('.description').textContent = current.text;
        card.querySelector('.date').textContent = current.date;
        card.querySelector('.current .icon').classList.add(app.getIconClass(current.code));
        card.querySelector('.current .temperature .value').textContent = Math.round(current.temp);

        card.querySelector('.current .sunrise').textContent = sunrise;
        card.querySelector('.current .sunset').textContent = sunset; 
        card.querySelector('.current .humidity').textContent = Math.round(humidity) + '%';
        card.querySelector('.current .wind .value').textContent = Math.round(wind.speed);
        card,querySelector('.current .wind .direction').textContent = wind.direction;

        var nextDays = card.querySelectioAll('.future .oneday');
        var today = new Date();
        today = today.getDay();
        for (var i = 0; i < 7; i++) {
            var nextDay = nextDays[i];
            var daile = data.channel.item.forecast[i];
            if (daily && nextDay) {
                nextDay.querySelector('.date').textContent = 
                app.daysOfWeek[(i + today) % 7];
                nextDay.querySelector('.icon').classList.add(app.getIconClass(daily.code));
                nextDay.querySelector('.temp-high .value').textContent =
                Math.round(daily.high);
                nextDay.querySelector('.temp-low .value').textContent = 
                Math.round(daily.low);
            }
        }

        if (app.isLoading) {
            app.spinner.setAttribute('hidden', true);
            app.container.removeAttribute('hidden');
            app.isLoading = false;
        }
    }
    

    
        app.getForecast = function(key, label) {
            var statement = 'select * from weather.forecast where woeid=' + key;
            var url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' + statement;
            if ('caches' in window) {
                caches.match(url)
                .then(res => {
                    if (res) {
                        res.json()
                        .then(function updateFromCache(json) {
                            var results = json.query.results;
                            results.key = key;
                            results.label = label;
                            results.created = json.query.created;
                            app.updateForecastCard(results);
                            
                        })
                    }
                })

            }

            fetch("url")
            .then(res => res.json())
            .then(res => {
                var results = res.query.results;
                console.log(results);
                results.key = key;
                results.label = label;
                results.created = res.query.created;
                app.updateForecastCard(results);
            });
            }  


            app.updateForecasts = function() {
                var keys = Object.keys(app.visibleCards);
                keys.forEach(key => {
                    app.getForecast(key);
                });
            };


            app.saveSelectedCities = function() {
                var selectedCities = JSON.stringify(app.selectedCities);
                localStorage.selectedCities = selectedCities;
            };

            app.getIconClass = function(weatherCode) {
                weatherCode = parseInt(weatherCode);
                switch (weatherCode) {

                    case 25: // cold 
                    case 32: // sunny
                    case 33: // fair (night)
                    case 34: // fair (day)
                    case 36: // hot
                    case 3200: // not available 
                    return 'clear-day';
                    case 0: // tornado
                    case 1: // tropical storm 
                    case 2: // hurricane
                    case 6: // mixed rain and sleet
                    case 8: // freezing drizzle
                    case 9: // drizzle
                    case 10: // freezing rain 
                    case 11: // showers
                    case 12: // showers
                    case 17: // hail
                    case 35: // mixed rain and hail
                    case 40: // scattered showers
                        return 'rain';
                    case 3: // severe thunderstorms
                    case 4: // thunderstorms
                    case 37: // isolated thunderstorms
                    case 38: // scattered thunderstorms
                    case 39: // scattered thunderstorms (not a typo)
                    case 45: // thundershowers
                    case 47: // insolated thundershowers
                        return 'thunderstorms';
                    case 5: // mixed rain and snow 
                    case 7: // mixed snow and sleet
                    case 13: // snow flurries
                    case 14: // light snow showers 
                    case 16: // snow 
                    case 18: // sleet
                    case 41: // heavy snow 
                    case 42: // scattered snow showers
                    case 43: // heavy snow 
                    case 46: // snow showers 
                        return 'snow';
                    case 15: // blowing snow 
                    case 19: // dust
                    case 20: // foggy
                    case 21: // haze
                    case 22: // smoky
                        return 'fog';
                    case 24: // windy
                    case 23: // blustery
                        return 'windy';
                    case 26: // cloudy
                    case 27: // mostly cloudy (night)
                    case 28: // mostly cloudy (day)
                    case 31: // clear (night)
                        return 'cloudy';
                    case 29: // partly cloudy (night)
                    case 30: // partly cloudy (day)
                    case 44: // partly cloudy
                        return 'partly-cloudy-day';


                }
            }

            var initialWeatherForecast = {
            key: '2459115',
            label: 'New York, NY',
            created: '2016-07-22T01:00:00Z',
            channel: {
                astronomy: {
                    sunrise: "5:43 am",
                    sunset: "8:21 pm"
                },
                item: {
                    condition: {
                        text: "Windy",
                        date: "Thu, 21 Jul 2016 09:00 PM EDT",
                        temp: 56,
                        code: 24
                    },
                    forecast: [
                    {code: 44, high: 86, low: 70},
                    {code: 44, high: 94, low: 73},
                    {code: 4, high: 95, low: 78},
                    {code: 24, high: 75, low: 89},
                    {code: 24, high: 89, low: 77},
                    {code: 44, high: 92, low: 79},
                    {code: 44, high: 89, low: 77},
                    ]
                },
                atmosphere: {
                    humidity: 56
                },
                wind: {
                    speed: 25,
                    direction: 195
                }
                }
            }

            //app.updateForecastCard(initialWeatherForecast)
        

            app.selectedCities = localStorage.selectedCities;
            if (app.selectedCities) {
                app.selectedCities = JSON.parse(app.selectedCities);
                app.selectedCities.forEach(city => {
                    app.getForecast(city.key, city.label);
                })
            } else {
                    app.updateForecastCard(initialWeatherForecast);
                    app.selectedCities = [
                        {key: initialWeatherForecast.key, label: initialWeatherForecast.label}

                    ];
                    app.saveSelectdCities();

            }
            if ('serviceWorker in navigator') {
                navigator.serviceWorker.register('./service-worker.js')
                .then(() => {
                    console.log('service worker registered')
                })
            }
        })() 