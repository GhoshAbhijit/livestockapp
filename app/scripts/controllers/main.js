'use strict';

/**
 * @ngdoc function
 * @name myApp.controller:myController
 * @description
 * # myController
 * Controller of the myApp
 */
angular.module("myApp")
  .controller("myController", function ($scope, $interval) {
    var socket, oStockList = [];
    $scope.pageHeader = "Live Stocks Application";
    // Retrieve data through web socket
    socket = new WebSocket("ws://stocks.mnet.website");

    socket.onopen = function (event) { //Socket open
        console.log("Open" + event);
    };
    socket.close = function (event) { //Socket close
        alert("Close" + event);
    };
    socket.onmessage = function (event) { //Socket currently running
        $scope.handleUpdateMessage(event.data);
    };
    socket.onerror = function (event) { //Socket connection error
        alert("Error" + event);
    };

    $scope.handleUpdateMessage = function (data) {
        //iterate through object
        var dataSet = JSON.parse(data);
        dataSet.forEach(function (item) {
            $scope.checkAndAdd(item);
            $scope.$apply();
        });
    };

    $scope.checkAndAdd = function (stock) {
        var found = oStockList.some(function (item) {
            var currentTime = $scope.fromNowOrDateTime(item.lastUpdate);
            if (item.ticker === stock[0]) {
                item.price = stock[1];
                item.lastUpdate = Date();
                item.formattedTime = currentTime;
            }
            return item.ticker === stock[0];
        });
        if (!found) {
            oStockList.push({
                ticker: stock[0],
                price: stock[1],
                lastUpdate: Date(),
                formattedTime: moment().fromNow()
            });
        }
    };
    $scope.oStockList = oStockList;

    $interval(function () {
        angular.forEach($scope.oStockList, function (value) {
            var currentTime = $scope.fromNowOrDateTime(value.lastUpdate);
            value.formattedTime = currentTime;
        });
    }, 1000);

    // Custom format Last updated time
    $scope.fromNowOrDateTime = function (oldTime) {
        var now = moment();
        if (Math.abs(moment(now.diff(oldTime))) < 60000) { //last updated within a minute
            return now.fromNow(); //a few seconds ago
        } else if (Math.abs(moment(now.diff(oldTime))) < 3600000 * 24) { //last updated within a day
            return moment(oldTime).format("hh:mm a"); //
        } else { //last updated more than a day ago
            return moment(oldTime).format("DD MMM h:mm a");
        }
    };
})
.directive("trackRecord", function () {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            scope.$watch(attrs.trackRecord, function (newValue, oldValue) {
                if (newValue !== oldValue) {
                    var newbgcolor = newValue < oldValue ? "red" : "green";
                    scope.newbgcolor = newbgcolor;
                    scope.newcolor = "white";
                }
            });
        }
    };
});
