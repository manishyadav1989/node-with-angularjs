(function(angular, document){
    angular.module('stockApp',["ngRoute"])
        .config(function($routeProvider){
            $routeProvider
                .when('/', {
                    templateUrl:'./client/public/views/home/html',
                    controller:'homeCtl'
                })
                .when('/home', {
                    templateUrl:'./client/public/views/home/html',
                    controller:'homeCtl'
                })
                .otherwise('/home');
        })
        .controller('homeCtrl', function($scope){
            $scope.title = "Stock Market";
        });
}(angular, document))