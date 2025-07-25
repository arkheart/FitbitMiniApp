// This function ensures that the script runs after the DOM is fully loaded
$(document).ready(function() {
    let intradayChart;
    // Initialize date and time pickers
    $("#start-date, #end-date, #intraday-date").datepicker({
        dateFormat: 'yy-mm-dd'
    });
    $('#start-time-intraday, #end-time-intraday').timepicker({
        timeFormat: 'HH:mm'
    });

    // Set default values for intraday pickers
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;

    $('#intraday-date').val(todayString);
    $('#start-time-intraday').val('00:00');
    $('#end-time-intraday').val('23:59');

    // This variable will store the Fitbit client ID
    let clientId;

    // This function fetches the client ID from the server
    async function fetchConfig() {
        try {
            // We make a request to our server's /config endpoint
            const response = await fetch('/config');
            // We parse the JSON response to get the configuration
            const config = await response.json();
            // We store the client ID in our variable
            clientId = config.clientId;
            // Now that we have the client ID, we can enable the login button
            $('#login-button').prop('disabled', false);
        } catch (error) {
            // If there's an error, we log it to the console
            console.error('Error fetching configuration:', error);
            // We also show an alert to the user
            alert('Could not load application configuration. Please try again later.');
        }
    }

    // This is the URI where Fitbit will redirect the user after authentication
    const redirectUri = 'http://localhost:3000';
    // This is the scope of the data we are requesting from the user
    const scope = 'activity heartrate profile';

    // We get references to the DOM elements we will be working with
    const $loginButton = $('#login-button');
    const $logoutButton = $('#logout-button');
    const $authSection = $('#auth-section');
    const $dataSection = $('#data-section');
    const $apiData = $('#api-data');
    const $stepsSection = $('#steps-section');
    const $startDate = $('#start-date');
    const $endDate = $('#end-date');
    const $fetchStepsButton = $('#fetch-steps-button');
    const $stepsData = $('#steps-data');
    const $intradaySection = $('#intraday-section');
    const $intradayDate = $('#intraday-date');
    const $startTimeIntraday = $('#start-time-intraday');
    const $endTimeIntraday = $('#end-time-intraday');
    const $fetchIntradayButton = $('#fetch-intraday-button');
    const $intradayData = $('#intraday-data');
    const $toggleChartButton = $('#toggle-chart-button');
    const $intradayChart = $('#intraday-chart');

    // This function handles the authentication process
    function handleAuth() {
        // We check if there is a hash in the URL, which indicates a redirect from Fitbit
        if (window.location.hash) {
            // We parse the hash to get the access token
            const fragment = new URLSearchParams(window.location.hash.slice(1));
            if (fragment.has('access_token')) {
                // We get the access token and user ID from the fragment
                const accessToken = fragment.get('access_token');
                const userId = fragment.get('user_id');
                // We store the token and user ID in local storage for later use
                localStorage.setItem('fitbitAccessToken', accessToken);
                localStorage.setItem('fitbitUserId', userId);
                // We clear the hash from the URL
                window.location.hash = '';
                // We show the data view and fetch the user's profile data
                showDataView();
                fetchProfileData(accessToken);
            }
        }

        // We check if there is a stored token in local storage
        const storedToken = localStorage.getItem('fitbitAccessToken');
        if (storedToken) {
            // If there is a token, we show the data view and fetch the user's profile data
            showDataView();
            fetchProfileData(storedToken);
        }
    }

    // This function redirects the user to the Fitbit authorization page
    function login() {
        // We construct the authorization URL with our client ID, redirect URI, and scope
        const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&expires_in=604800`;
        // We redirect the user to the authorization URL
        window.location.href = authUrl;
    }

    // This function logs the user out by removing the token and user ID from local storage
    function logout() {
        localStorage.removeItem('fitbitAccessToken');
        localStorage.removeItem('fitbitUserId');
        // We show the authentication view
        showAuthView();
    }

    // This function shows the authentication view and hides the data view
    function showAuthView() {
        $authSection.show();
        $dataSection.hide();
        $stepsSection.hide();
        $intradaySection.hide();
    }

    // This function shows the data view and hides the authentication view
    function showDataView() {
        $authSection.hide();
        $dataSection.show();
        $stepsSection.show();
        $intradaySection.show();
    }

    // This function fetches the user's profile data from the Fitbit API
    function fetchProfileData(token) {
        // We get the user ID from local storage
        const userId = localStorage.getItem('fitbitUserId');
        // We make an AJAX call to the Fitbit API
        $.ajax({
            url: `https://api.fitbit.com/1/user/${userId}/profile.json`,
            // We include the access token in the authorization header
            headers: {
                'Authorization': `Bearer ${token}`
            },
            // If the call is successful, we display the data in the preformatted text block
            success: function(data) {
                const user = data.user;
                const profileHtml = `
                    <p><strong>First Name:</strong> ${user.firstName}</p>
                    <p><strong>Age:</strong> ${user.age}</p>
                `;
                $apiData.html(profileHtml);
            },
            // If there's an error, we handle it
            error: function(jqXHR, textStatus, errorThrown) {
                // If the error is a 401 (Unauthorized), it means the token is expired or invalid
                if (jqXHR.status === 401) {
                    // We log the user out to force a re-login
                    logout();
                    return;
                }
                // We log the error to the console and display an error message to the user
                console.error('Error fetching Fitbit data:', textStatus, errorThrown);
                $apiData.text('Error fetching data.');
            }
        });
    }

    // This function fetches the user's steps data from the Fitbit API
    function fetchStepsData(token, startDate, endDate) {
        const userId = localStorage.getItem('fitbitUserId');
        
        $.ajax({
            url: `https://api.fitbit.com/1/user/${userId}/activities/steps/date/${startDate}/${endDate}.json`,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(data) {
                let stepsHtml = '<ul>';
                data['activities-steps'].forEach(function(day) {
                    stepsHtml += `<li>${day.dateTime}: ${day.value} steps</li>`;
                });
                stepsHtml += '</ul>';
                $stepsData.html(stepsHtml);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 401) {
                    logout();
                    return;
                }
                console.error('Error fetching Fitbit steps data:', textStatus, errorThrown);
                $stepsData.text('Error fetching steps data.');
            }
        });
    }

    // This function fetches intraday step data from the Fitbit API
    function fetchIntradayData(token, date, startTime, endTime) {
        const userId = localStorage.getItem('fitbitUserId');
        $.ajax({
            url: `https://api.fitbit.com/1/user/${userId}/activities/steps/date/${date}/1d/15min/time/${startTime}/${endTime}.json`,
            headers: {
                'Authorization': `Bearer ${token}`
            },
            success: function(data) {
                const dataset = data['activities-steps-intraday'].dataset;
                const labels = dataset.map(point => point.time);
                const values = dataset.map(point => point.value);

                if (intradayChart) {
                    intradayChart.destroy();
                }

                intradayChart = new Chart($intradayChart, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Steps',
                            data: values,
                            backgroundColor: '#A9BDB4',
                            borderColor: '#5A6E66',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });

                let intradayHtml = '<ul>';
                dataset.forEach(function(point) {
                    intradayHtml += `<li>${point.time}: ${point.value} steps</li>`;
                });
                intradayHtml += '</ul>';
                $intradayData.html(intradayHtml);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 401) {
                    logout();
                    return;
                }
                console.error('Error fetching Fitbit intraday data:', textStatus, errorThrown);
                $intradayData.text('Error fetching intraday data.');
            }
        });
    }

    // We attach the login and logout functions to the click events of the respective buttons
    $loginButton.on('click', login);
    $logoutButton.on('click', logout);
    $fetchStepsButton.on('click', function() {
        const token = localStorage.getItem('fitbitAccessToken');
        const startDate = $startDate.val();
        const endDate = $endDate.val();

        if (startDate && endDate && startDate > endDate) {
            alert('Start date cannot be after end date.');
            return;
        }

        if (token && startDate && endDate) {
            fetchStepsData(token, startDate, endDate);
        }
    });

    $fetchIntradayButton.on('click', function() {
        const token = localStorage.getItem('fitbitAccessToken');
        const date = $intradayDate.val();
        const startTime = $startTimeIntraday.val();
        const endTime = $endTimeIntraday.val();

        if (startTime && endTime && startTime > endTime) {
            alert('Start time cannot be after end time.');
            return;
        }

        if (token && date && startTime && endTime) {
            fetchIntradayData(token, date, startTime, endTime);
        }
    });

    $toggleChartButton.on('click', function() {
        $intradayChart.toggle();
        $intradayData.toggle();
    });

    // We disable the login button until the configuration is loaded
    $('#login-button').prop('disabled', true);
    // We fetch the configuration from the server
    fetchConfig();
    // We handle the authentication process
    handleAuth();
});