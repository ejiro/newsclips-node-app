/**
 * Created by eakporo on 8/16/17.
 */


var myApp;
myApp = myApp || (function () {
        var pleaseWaitDiv = $('#progressModal');
        return {
            showPleaseWait: function() {
                pleaseWaitDiv.modal();
            },
            hidePleaseWait: function () {
                pleaseWaitDiv.modal('hide');
            }
        };
    })();

function getUserData(userId, callback) {
    $.ajax({
        url: "http://localhost:3000/api/user/"+userId,
        // the URL for the request
        type: "GET",
        // whether this is a POST or GET request
        dataType: "json",
        // the type of data we expect back
        success: function (user) {
            var param = $.param(user);
            console.log(param);
            var id = userId.replace("@", "-");
            id = id.replace(".", "-");
            var userElm = $("#"+id);
            userElm.find(".points").html("Points: "+user.points);
            userElm.find(".reputation").html("Reputation: "+user.reputation);
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
            if(callback !== undefined){
                callback();
            }
        }
    });
}

function getAllUserData() {
    $.ajax({
        url: "http://localhost:3000/api/user",
        // the URL for the request
        type: "GET",
        // whether this is a POST or GET request
        dataType: "json",
        // the type of data we expect back
        success: function (responseJson) {
             $.each(responseJson, function (i, user) {
                 var param = $.param(user);
                 console.log(param);
                 $('#participants_rows').append(nunjucks.render("participant?"+param, {user: user}));
            });
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
        }
    });
}

function postUserData (postData) {
    $.ajax({
        url: "http://localhost:3000/api/user",
        // the URL for the request
        type: "POST",
        // whether this is a POST or GET request
        dataType: "json",
        data: postData,
        // the type of data we expect back
        success: function (user) {
            var param = $.param(user);
            console.log(param);
            $('#participants_rows').append(nunjucks.render("participant?"+param, {user: user}));
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
        }
    });
}


function getAllClipData(clipTable, clipRoute, modalElm, consumer) {
    $.ajax({
        url: "http://localhost:3000/api/newsclip",
        // the URL for the request
        type: "GET",
        // whether this is a POST or GET request
        dataType: "json",
        // the type of data we expect back
        success: function (responseJson) {
            $('#'+clipTable+' > tbody').empty();
            $.each(responseJson, function (i, clip) {
                //clean up producer string since it is a references containing #
                var producer = clip["producer"];
                producer = producer.substring(producer.indexOf("#") + 1);
                clip["producer"] = producer;
                clip["consumer"] = consumer;
                var param = $.param(clip);
                console.log(param);
                $('#'+clipTable+' > tbody:last-child').append(nunjucks.render(clipRoute+"?"+param, {clip: clip}));
            });
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
            if(modalElm !== null) {
                modalElm.find('.modal-body').css({
                    display: 'table'
                });
            }
        }
    });
}

function postClipData (postData) {
    $.ajax({
        url: "http://localhost:3000/api/newsclip",
        // the URL for the request
        type: "POST",
        // whether this is a POST or GET request
        dataType: "json",
        data: postData,
        // the type of data we expect back
        success: function (clip) {
            var param = $.param(clip);
            console.log(param);
            $('#clipTable > tbody:last-child').append(nunjucks.render("newsclip?"+param, {clip: clip}));
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
        }
    });
}

function postWatchedClipData (postData, clip, producer, consumer) {
    $.ajax({
        url: "http://localhost:3000/api/WatchedTransaction",
        // the URL for the request
        type: "POST",
        // whether this is a POST or GET request
        dataType: "json",
        data: postData,
        // the type of data we expect back
        success: function (watched) {
            var param = $.param(watched);
            console.log(param);
            getUserData(producer);
            getUserData(consumer, function () {
                myApp.hidePleaseWait();

                $.each([ producer, consumer ], function( index, value ) {
                    var id = value.replace("@", "-");
                    id = id.replace(".", "-");

                    var colorStr = '#f2ff68'; // color of highlight
                    $("#"+id+" > .change-"+index).each(function (i,x) {
                        $(this).css("background-color",colorStr);
                        setTimeout(function(){
                            $(x).css("background-color","#fff0f5"); // reset background
                            $(x).effect("highlight", {color: colorStr}, 2500); // animate
                        },500);
                    });
                });
            });

            var txId = watched["transactionId"];
            getTransactionData(txId)
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
        }
    });
}

function getAllTransactionData() {
    $.ajax({
        url: "http://localhost:3000/api/system/historian",
        // the URL for the request
        type: "GET",
        // whether this is a POST or GET request
        dataType: "json",
        // the type of data we expect back
        success: function (responseJson) {

            responseJson.sort(function(a,b){
                // Turn your strings into dates, and then subtract them
                // to get a value that is either negative, positive, or zero.
                return new Date(a.timestamp) - new Date(b.timestamp);
            });

            $.each(responseJson, function (i, transaction) {
                //var txId = transaction["transactionId"];
                var classType = transaction["$class"];
                var eventEmitted = transaction["eventsEmitted"];
                var timestamp = new Date(transaction["transactionTimestamp"]);
                transaction["timestamp"] = timestamp.toUTCString();

                var param = $.param(transaction);
                console.log(param);
                //if(classType.indexOf("Watched") >= 0) {
                if(eventEmitted && eventEmitted.length){
                    $('ul.transactions').append(nunjucks.render("transaction?" + param, {transaction: transaction}));
                }
            });
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
        }
    });
}

function getTransactionData(txId, callback) {
    $.ajax({
        url: "http://localhost:3000/api/system/historian/"+txId,
        // the URL for the request
        type: "GET",
        // whether this is a POST or GET request
        dataType: "json",
        // the type of data we expect back
        success: function (transaction) {
            //var txId = transaction["transactionId"];
            var classType = transaction["$class"];
            var eventEmitted = transaction["eventsEmitted"];
            var timestamp = new Date(transaction["transactionTimestamp"]);
            transaction["timestamp"] = timestamp.toUTCString();

            var param = $.param(transaction);
            console.log(param);
            //if(classType.indexOf("Watched") >= 0) {
            if(eventEmitted && eventEmitted.length){
                $('ul.transactions').append(nunjucks.render("transaction?" + param, {transaction: transaction}));

                var colorStr = '#43ff2c'; // color of highlight
                $('ul.transactions > li.'+txId+' div').each(function (i,x) {
                    $(this).css("background-color",colorStr);
                    setTimeout(function(){
                        $(x).css("background-color","#FFFFE0"); // reset background
                        $(x).effect("highlight", {color: colorStr}, 3500); // animate
                    },500);
                });
            }
        },
        error: function (xhr, status) {
            // code run if request fails; raw request and status
            console.log("Sorry, there was a problem!");
        },
        complete: function (xhr, status) {  	// code to run regardless of success or failure
            console.log("The request is complete!");
        }
    });
}

function getFormDataAsJSON($form){
    var unindexed_array = $form.serializeArray();
    var indexed_array = {};

    $.map(unindexed_array, function(n, i){
        indexed_array[n['name']] = n['value'];
    });

    return indexed_array;
}

$(document).ready(function() {
    var env = new nunjucks.Environment(new nunjucks.WebLoader('../template'));

    //GET all participants from the blockchain
    getAllUserData();

    //GET all assets from the blockchain
    getAllClipData("clipTable", "newsclip", null, null);

    //GET all transactions from the blockchain
    getAllTransactionData();

    //POST a participant to the blockchain
    $("#userFormSubmit").on('click', function() {
        $("#userForm").submit();
    });
    $('#userForm').on('submit', function(e){
        e.preventDefault();
        var postData = getFormDataAsJSON($(this));
        postUserData(postData);
    });

    //POST a clip to the blockchain
    $("#clipFormSubmit").on('click', function() {
        $("#clipForm").submit();
    });
    $('#clipForm').on('submit', function(e){
        e.preventDefault();
        var postData = getFormDataAsJSON($(this));
        postData["published"] = true;
        postClipData(postData);
    });

    $('#clipModal').on('show.bs.modal', function(e) {
        var producer = $(e.relatedTarget).attr("data-producer");
        $(this).find('#clipId').val(producer+"_"+Math.random());
        $(this).find('#clipProducer').val(producer); //e.relatedTarget.id);
    });

    $('#clipListModal').on('show.bs.modal', function(e) {
        var consumer = $(e.relatedTarget).attr("data-consumer");

        //GET all assets from the blockchain
        getAllClipData("clipListTable", "watchclip", $(this), consumer);
    });

    $(document).on('click', ".watch-btn" , function() {
        var clip = $(this).attr("data-clip");
        var producer = $(this).attr("data-producer");
        var consumer = $(this).attr("data-consumer");
        var postData = {};
        postData["$class"] = "org.acme.sample.WatchedTransaction";
        postData["newsClip"] = "resource:org.acme.sample.NewsClip#"+clip;
        postData["consumer"] = "resource:org.acme.sample.User#"+consumer;

        myApp.showPleaseWait();
        postWatchedClipData(postData, clip, producer, consumer);
    });
});

