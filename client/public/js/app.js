(function(angular, document){
    angular.module('stockApp',["ngRoute"])
        .config(function($routeProvider){
            $routeProvider
                .when('/', {
                    templateUrl:'./client/views/home.html',
                    controller:'homeCtrl'
                })
                .when('/home', {
                    templateUrl:'./client/views/home.html',
                    controller:'homeCtrl'
                })
                .otherwise('/home');
        })
        .controller('homeCtrl', function($scope, searchStock){
            $scope.title = "Stock Market";
            $scope.dataSource = {
                                "chart": {
                                    "caption": "Stock",
                                    "subcaption": "Last Year",
                                    "numberPrefix": "$",
                                    "canvasleftmargin": "145",
                                    "chartTopMargin": "10",
                                    "chartRightMargin": "10",
                                    "showBorder": "0"
                                },
                                "dataset": [
                                    {
                                        "data": [
                                            {
                                                "value": "38.42"
                                            },
                                            {
                                                "value": "41.43"
                                            },
                                            {
                                                "value": "34.78"
                                            },
                                            {
                                                "value": "40.67"
                                            },
                                            {
                                                "value": "44.12"
                                            },
                                            {
                                                "value": "38.45"
                                            },
                                            {
                                                "value": "40.71"
                                            },
                                            {
                                                "value": "49.90"
                                            },
                                            {
                                                "value": "40.12"
                                            },
                                            {
                                                "value": "34.91"
                                            },
                                            {
                                                "value": "42.02"
                                            },
                                            {
                                                "value": "35.21"
                                            },
                                            {
                                                "value": "43.31"
                                            },
                                            {
                                                "value": "40.21"
                                            },
                                            {
                                                "value": "40.54"
                                            },
                                            {
                                                "value": "40.90"
                                            },
                                            {
                                                "value": "54.21"
                                            },
                                            {
                                                "value": "41.90"
                                            },
                                            {
                                                "value": "33.43"
                                            },
                                            {
                                                "value": "46.73"
                                            },
                                            {
                                                "value": "50.42"
                                            },
                                            {
                                                "value": "40.74"
                                            },
                                            {
                                                "value": "42.31"
                                            },
                                            {
                                                "value": "50.39"
                                            },
                                            {
                                                "value": "51.10"
                                            },
                                            {
                                                "value": "44.84"
                                            },
                                            {
                                                "value": "51.64"
                                            },
                                            {
                                                "value": "47.62"
                                            },
                                            {
                                                "value": "39.61"
                                            },
                                            {
                                                "value": "35.13"
                                            }
                                        ]
                                    }
                                ]
                            }
            
            searchStock.getStockByID("1234lkjqwasdf")
                .then(function(data){
                    console.log(`data is => ${JSON.stringify(data)}`)
                })
                .catch(function(error){
                    console.log(`error is => ${JSON.stringify(error)}`)
                })
                            
        })
        .directive('stockChart',function(){
            return{
                restrict  :'E',
                template:'<div id="chart-container">FusionCharts will render here</div>',
                link:function($scope, elem, attr){
                    FusionCharts.ready(function () {
                        new FusionCharts({
                            type: 'sparkline',
                            renderAt: 'chart-container',
                            width: '100%',
                            height: '100%',
                            dataFormat: 'json',
                            dataSource: $scope.dataSource
                        })
                        .render();
                    });
                }  
            } 
        })
        .service('searchStock', function($http){
            this.getStockByID = function(stockID){
                return $http({
                    url:"http://172.17.0.40:3002/getStockByID",
                    method:"post",
                    headers:{
                        "content-type":"application/json",
                        "auth-key":"sktcoasnjgrul"
                    },
                    json:{
                        stockID:stockID
                    }
                })
                .then(function(data){
                    return data;
                })
                .catch(function(error){
                    return error;
                });
            }
        });
}(angular, document))