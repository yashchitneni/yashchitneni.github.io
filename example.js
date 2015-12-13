$(document).ready(function () {

    var symbolTypes = {
        "triangleDown": d3.svg.symbol().type("triangle-down"),
        "triangleUp": d3.svg.symbol().type("triangle-up"),
        "square": d3.svg.symbol().type("square"),
        "diamond": d3.svg.symbol().type("diamond"),
        "cross": d3.svg.symbol().type("cross"),
        "circle": d3.svg.symbol().type("circle")
    }

    var abbrevOfListOfStates = new Array("AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VT", "WA", "WI", "WV", "WY");

    var mappedStatesToCounts = {};
    var mappedStatesToSports = {};

    var seasonsIDs = new Array('Winter', 'Spring', 'Summer', 'Fall');
    var sportsIDs = new Array('football', 'baseball', 'soccer', 'basketball', 'hockey', 'golf', 'running', 'lacrosse', 'cycling');
    var capturedeviceIDs = new Array('nikon', 'canon', 'apple', 'sony', 'panasonic', 'other');

    var plottedStates = new Array();
    for (i = 0; i < abbrevOfListOfStates.length; i++) {
        var fullNameState = convert_state(abbrevOfListOfStates[i], 'name');
        plottedStates.push(fullNameState);
    }


    var selectedStates = new Array();

    var plottedSeasons = seasonsIDs.slice();
    var plottedSports = sportsIDs.slice();
    var plottedCaptureDevices = capturedeviceIDs.slice();

    var plottedData = new Array();

    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        },
        width = 750 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var svg = d3.select(".content").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    d3.tsv('100kPostData.tsv', function (data) {

        // formats the latitude, longitude, and datetaken to numbers instead of strings
        data.forEach(function (d) {
            d.Lat = +d.Lat;
            d.Lon = +d.Lon;
            d.DateTaken = +d.DateTaken;
            d.DateTaken = getDate(d.DateTaken);
            plottedData.push(d);
        });




        // Add the points!

        var changedAxis = function () {
            x.domain(d3.extent(plottedData, function (d) {
                return d.Lon;
            })).nice();
            y.domain(d3.extent(plottedData, function (d) {
                return d.Lat;
            })).nice();

            // Add the x-axis.
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.svg.axis().scale(x).orient("bottom"));

            // Add the y-axis.
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.svg.axis().scale(y).orient("left"));
        }
        changedAxis();

        var changeMapStuff = function () {

            svg.selectAll(".point")
                .data(plottedData)
                .enter().append("path")
                .attr("class", "point")
                .attr("d", function (d, i) {
                    if (d.CaptureDevice === "nikon") {
                        return symbolTypes.square()
                    } else if (d.CaptureDevice === "canon") {
                        return symbolTypes.diamond()
                    } else if (d.CaptureDevice === "apple") {
                        return symbolTypes.circle()
                    } else if (d.CaptureDevice === "sony") {
                        return symbolTypes.cross()
                    } else if (d.CaptureDevice === "panasonic") {
                        return symbolTypes.triangleDown()
                    } else {
                        return symbolTypes.triangleUp();
                    };
                })
                .style("fill", function (d) {
                    if (d.Sport === "football") {
                        return "red"
                    } else if (d.Sport === "baseball") {
                        return "lawngreen"
                    } else if (d.Sport === "soccer") {
                        return "blue"
                    } else if (d.Sport === "basketball") {
                        return "yellow"
                    } else if (d.Sport === "hockey") {
                        return "cyan"
                    } else if (d.Sport === "golf") {
                        return "darkolivegreen"
                    } else if (d.Sport === "running") {
                        return "purple"
                    } else if (d.Sport === "lacrosse") {
                        return "orange"
                    } else {
                        return "black"
                    };
                })
                .attr("transform", function (d) {
                    return "translate(" + x(d.Lon) + "," + y(d.Lat) + ")";
                });
        }
        changeMapStuff();

        // get number of photos in each state
        for (i = 0; i < abbrevOfListOfStates.length; i++) {
            var currentState = convert_state(abbrevOfListOfStates[i], 'name');
            var count = 0;
            data.forEach(function (d) {
                if (d.State == currentState) {
                    count = count + 1;
                }
            });
            mappedStatesToCounts[abbrevOfListOfStates[i]] = count;
        }

        // set the color of each state based on number of photos and sport
        for (i = 0; i < abbrevOfListOfStates.length; i++) {
            pickColor(abbrevOfListOfStates[i], mappedStatesToCounts[abbrevOfListOfStates[i]], mappedStatesToSports[abbrevOfListOfStates[i]]);
        }

        abbrevOfListOfStates.forEach(function (s) {
            document.getElementById(s).onclick = function () {
                var points = svg.selectAll(".point").data(plottedData);
                var axes = svg.selectAll(".axis").data(plottedData);
                var fullStateName = convert_state(s, 'name');
                var nameOfStateCSS = '#'.concat(s);
                if (selectedStates.indexOf(fullStateName) < 0) {
                    $(nameOfStateCSS).css('fill', 'black');
                    $(nameOfStateCSS).css('opacity', 1);
                    selectedStates.push(fullStateName);
                    wipeEverything();
                    addDataToPlot(data, selectedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                    points.remove();
                    axes.remove();
                    changedAxis();
                    changeMapStuff();
                } else {
                    pickColor(s, mappedStatesToCounts[s]);
                    for (i = 0; i < selectedStates.length; i++) {
                        if (selectedStates[i] == fullStateName) {
                            selectedStates.splice(i, 1);
                        }
                    }
                    if (selectedStates.length == 0) {
                        wipeEverything();
                        addDataToPlot(data, plottedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        axes.remove();
                        changedAxis();
                        changeMapStuff();
                    } else {
                        removeDataFromPlot(selectedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        axes.remove();
                        changedAxis();
                        changeMapStuff();
                    }
                }
            }
        });

        // Seasons checkboxes (Dont forget to check them all at the beginning)
        seasonsIDs.forEach(function (s) {
            $('#'.concat(s)).change(function () {
                var points = svg.selectAll(".point").data(plottedData);
                //                var axes = svg.selectAll(".axis").data(plottedData);
                if ($(this).is(":checked")) {
                    plottedSeasons.push(s);
                    // call data selecting function
                    if (selectedStates.length != 0) {
                        wipeEverything();
                        addDataToPlot(data, selectedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        //                        axes.remove();
                        changeMapStuff();
                        console.log(plottedData);
                    } else {
                        wipeEverything();
                        addDataToPlot(data, plottedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        //                        axes.remove();
                        changeMapStuff();
                        console.log(plottedData);
                    }
                } else {
                    for (i = 0; i < plottedSeasons.length; i++) {
                        if (plottedSeasons[i] == s) plottedSeasons.splice(i, 1);
                    }
                    // call data removing function
                    removeDataFromPlot(plottedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                    points.remove();
                    //                    axes.remove();
                    changeMapStuff();
                    console.log(plottedData);
                }
            })
        })

        // Sports checkboxes (Dont forget to check them all at the beginning)
        sportsIDs.forEach(function (s) {
            $('#'.concat(s)).change(function () {
                var points = svg.selectAll(".point").data(plottedData);
                //                var axes = svg.selectAll(".axis").data(plottedData);
                if ($(this).is(":checked")) {
                    plottedSports.push(s);
                    // call data selecting function
                    if (selectedStates.length != 0) {
                        wipeEverything();
                        addDataToPlot(data, selectedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        //                        axes.remove();
                        changeMapStuff();
                    } else {
                        wipeEverything();
                        addDataToPlot(data, plottedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        //                        axes.remove();
                        changeMapStuff();
                    }
                } else {
                    for (i = 0; i < plottedSports.length; i++) {
                        if (plottedSports[i] == s) plottedSports.splice(i, 1);
                    }
                    // call data removing function
                    removeDataFromPlot(plottedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                    points.remove();
                    //                    axes.remove();
                    changeMapStuff();
                }
            })
        })


        capturedeviceIDs.forEach(function (s) {
            $('#'.concat(s)).change(function () {
                var points = svg.selectAll(".point").data(plottedData);
                //                var axes = svg.selectAll(".axis").data(plottedData);
                if ($(this).is(":checked")) {
                    plottedCaptureDevices.push(s);
                    // call data selecting function
                    if (selectedStates.length != 0) {
                        wipeEverything();
                        addDataToPlot(data, selectedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        //                        axes.remove();
                        changeMapStuff();
                    } else {
                        wipeEverything();
                        addDataToPlot(data, plottedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                        points.remove();
                        //                        axes.remove();
                        changeMapStuff();
                    }
                } else {
                    for (i = 0; i < plottedCaptureDevices.length; i++) {
                        if (plottedCaptureDevices[i] == s) plottedCaptureDevices.splice(i, 1);
                    }
                    // call data removing function
                    removeDataFromPlot(plottedStates, plottedSports, plottedCaptureDevices, plottedSeasons);
                    points.remove();
                    //                    axes.remove();
                    changeMapStuff();
                }
            })
        })

    });

    // helper function to select data based on different filters
    function addDataToPlot(data, selectedStates, selectedSports, selectedCaptureDevices, selectedSeasons) {
        data.forEach(function (d) {
            if (selectedStates.indexOf(d.State) > -1 && selectedSports.indexOf(d.Sport) > -1 && selectedCaptureDevices.indexOf(d.CaptureDevice) > -1 && selectedSeasons.indexOf(d.DateTaken) > -1) {
                plottedData.push(d);
            }
        });
    }

    // helpter function to remove data based on different filters
    function removeDataFromPlot(selectedStates, selectedSports, selectedCaptureDevices, selectedSeasons) {
        for (i = 0; i < plottedData.length; i++) {
            if (selectedStates.indexOf(plottedData[i].State) == -1 || selectedSports.indexOf(plottedData[i].Sport) == -1 || selectedCaptureDevices.indexOf(plottedData[i].CaptureDevice) == -1 || selectedSeasons.indexOf(plottedData[i].DateTaken) == -1) {
                plottedData.splice(i, 1);
                i = i - 1;
            }
        }
    }

    function wipeEverything() {
        plottedData.length = 0;

    }

    // helper function to get the year the photo was taken
    function getDate(dateInMilliseconds) {
        var d = new Date();
        d.setTime(dateInMilliseconds);
        month = d.getMonth();
        if (month == 1 || month == 2 || month == 12) {
            return "Winter";
        } else if (month == 3 || month == 4 || month == 5) {
            return "Spring";
        } else if (month == 6 || month == 7 || month == 8) {
            return "Summer";
        } else {
            return "Fall";
        }
    }

    function pickColor(abbrv, occurrences) {
        var nameOfStateCSS = '#'.concat(abbrv);
        var color = "white";

        // BASED ON PERCENTILES 20th -> 11, 40th -> 23, 60th -> 56, 80th -> 97
        $(nameOfStateCSS).css('fill', '#1E3D7B')
        if (occurrences < 11) {
            $(nameOfStateCSS).css('opacity', .2);
        } else if (occurrences >= 11 && occurrences < 23) {
            $(nameOfStateCSS).css('opacity', .4);
        } else if (occurrences >= 23 && occurrences < 56) {
            $(nameOfStateCSS).css('opacity', .6);
        } else if (occurrences >= 56 && occurrences < 97) {
            $(nameOfStateCSS).css('opacity', .8);
        } else {
            $(nameOfStateCSS).css('opacity', 1);
        }
    }

    function convert_state(name, to) {
        var name = name.toUpperCase();
        var states = new Array({
            'name': 'Alabama',
            'abbrev': 'AL'
        }, {
            'name': 'Alaska',
            'abbrev': 'AK'
        }, {
            'name': 'Arizona',
            'abbrev': 'AZ'
        }, {
            'name': 'Arkansas',
            'abbrev': 'AR'
        }, {
            'name': 'California',
            'abbrev': 'CA'
        }, {
            'name': 'Colorado',
            'abbrev': 'CO'
        }, {
            'name': 'Connecticut',
            'abbrev': 'CT'
        }, {
            'name': 'Delaware',
            'abbrev': 'DE'
        }, {
            'name': 'DistrictofColumbia',
            'abbrev': 'DC'
        }, {
            'name': 'Florida',
            'abbrev': 'FL'
        }, {
            'name': 'Georgia',
            'abbrev': 'GA'
        }, {
            'name': 'Hawaii',
            'abbrev': 'HI'
        }, {
            'name': 'Idaho',
            'abbrev': 'ID'
        }, {
            'name': 'Illinois',
            'abbrev': 'IL'
        }, {
            'name': 'Indiana',
            'abbrev': 'IN'
        }, {
            'name': 'Iowa',
            'abbrev': 'IA'
        }, {
            'name': 'Kansas',
            'abbrev': 'KS'
        }, {
            'name': 'Kentucky',
            'abbrev': 'KY'
        }, {
            'name': 'Louisiana',
            'abbrev': 'LA'
        }, {
            'name': 'Maine',
            'abbrev': 'ME'
        }, {
            'name': 'Maryland',
            'abbrev': 'MD'
        }, {
            'name': 'Massachusetts',
            'abbrev': 'MA'
        }, {
            'name': 'Michigan',
            'abbrev': 'MI'
        }, {
            'name': 'Minnesota',
            'abbrev': 'MN'
        }, {
            'name': 'Mississippi',
            'abbrev': 'MS'
        }, {
            'name': 'Missouri',
            'abbrev': 'MO'
        }, {
            'name': 'Montana',
            'abbrev': 'MT'
        }, {
            'name': 'Nebraska',
            'abbrev': 'NE'
        }, {
            'name': 'Nevada',
            'abbrev': 'NV'
        }, {
            'name': 'NewHampshire',
            'abbrev': 'NH'
        }, {
            'name': 'NewJersey',
            'abbrev': 'NJ'
        }, {
            'name': 'NewMexico',
            'abbrev': 'NM'
        }, {
            'name': 'NewYork',
            'abbrev': 'NY'
        }, {
            'name': 'NorthCarolina',
            'abbrev': 'NC'
        }, {
            'name': 'NorthDakota',
            'abbrev': 'ND'
        }, {
            'name': 'Ohio',
            'abbrev': 'OH'
        }, {
            'name': 'Oklahoma',
            'abbrev': 'OK'
        }, {
            'name': 'Oregon',
            'abbrev': 'OR'
        }, {
            'name': 'Pennsylvania',
            'abbrev': 'PA'
        }, {
            'name': 'RhodeIsland',
            'abbrev': 'RI'
        }, {
            'name': 'SouthCarolina',
            'abbrev': 'SC'
        }, {
            'name': 'SouthDakota',
            'abbrev': 'SD'
        }, {
            'name': 'Tennessee',
            'abbrev': 'TN'
        }, {
            'name': 'Texas',
            'abbrev': 'TX'
        }, {
            'name': 'Utah',
            'abbrev': 'UT'
        }, {
            'name': 'Vermont',
            'abbrev': 'VT'
        }, {
            'name': 'Virginia',
            'abbrev': 'VA'
        }, {
            'name': 'Washington',
            'abbrev': 'WA'
        }, {
            'name': 'WestVirginia',
            'abbrev': 'WV'
        }, {
            'name': 'Wisconsin',
            'abbrev': 'WI'
        }, {
            'name': 'Wyoming',
            'abbrev': 'WY'
        });
        var returnthis = false;
        $.each(states, function (index, value) {
            if (to == 'name') {
                if (value.abbrev == name) {
                    returnthis = value.name;
                    return false;
                }
            } else if (to == 'abbrev') {
                if (value.name.toUpperCase() == name) {
                    returnthis = value.abbrev;
                    return false;
                }
            }
        });
        return returnthis;
    }
});
