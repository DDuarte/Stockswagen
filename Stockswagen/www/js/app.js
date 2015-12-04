// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'firebase', 'ionic.service.core', 'ionic.service.analytics', 'ionic-material',
  'starter.controllers', 'ionMdInput', 'ion-autocomplete'])

.factory('Auth', function($firebaseAuth) {
  var endPoint = 'https://stockswagen.firebaseio.com';
  var usersRef = new Firebase(endPoint);
  return $firebaseAuth(usersRef);
})

.run(function($rootScope, $state, $ionicPlatform, $ionicAnalytics) {
  $ionicPlatform.ready(function() {

    $ionicAnalytics.register();

    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });

  $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === 'AUTH_REQUIRED') {
      $state.go('login');
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.views.maxCache(0);

  $stateProvider

  .state('app', {
    url: '/app',
    resolve: {
      'currentAuth': ['Auth', function(Auth) {
        return Auth.$requireAuth();
      }]
    },
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('app.portfolio', {
    url: '/portfolio',
    views: {
      'menuContent': {
        templateUrl: 'templates/portfolio.html',
        controller: 'PortfolioCtrl'
      },
      'fabContent': {
        template: '<button ng-click="openAddStock()" id="fab-portfolio" class="button button-fab button-fab-top-right expanded button-energized-900 spin"><i class="icon ion-plus"></i></button>',
        controller: function ($scope, $timeout, $ionicModal) {
          $timeout(function () {
            document.getElementById('fab-portfolio').classList.toggle('on');
          }, 200);

          $ionicModal.fromTemplateUrl('templates/addStock.html', {
            scope: $scope
          }).then(function(modal) {
            $scope.addStockModal = modal;
          });

          $scope.closeAddStock = function() {
            $scope.addStockModal.hide();
          };

          $scope.openAddStock = function () {
            $scope.addStockModal.show();
          };

          $scope.form = {
            tick: '',
            notifications: false,
            min: 50,
            max: 100
          };

          $scope.stocks = [{ name: 'Apple Inc.', tick: 'AAPL' },
            { name: 'Alphabet Inc.', tick: 'GOOGL' },
            { name: 'Alphabet Inc.', tick: 'GOOG' },
            { name: 'Microsoft Corporation', tick: 'MSFT' },
            { name: 'Amazon.com, Inc.', tick: 'AMZN' },
            { name: 'Facebook, Inc.', tick: 'FB' },
            { name: 'Intel Corporation', tick: 'INTC' },
            { name: 'Gilead Sciences, Inc.', tick: 'GILD' },
            { name: 'Comcast Corporation', tick: 'CMCSK' },
            { name: 'Comcast Corporation', tick: 'CMCSA' },
            { name: 'Cisco Systems, Inc.', tick: 'CSCO' },
            { name: 'Amgen Inc.', tick: 'AMGN' },
            { name: 'Starbucks Corporation', tick: 'SBUX' },
            { name: 'Walgreens Boots Alliance, Inc.', tick: 'WBA' },
            { name: 'The Kraft Heinz Company', tick: 'KHC' },
            { name: 'Celgene Corporation', tick: 'CELG' },
            { name: 'QUALCOMM Incorporated', tick: 'QCOM' },
            { name: 'Costco Wholesale Corporation', tick: 'COST' },
            { name: 'Mondelez International, Inc.', tick: 'MDLZ' },
            { name: 'Biogen Inc.', tick: 'BIIB' },
            { name: 'The Priceline Group Inc.', tick: 'PCLN' },
            { name: 'Twenty-First Century Fox, Inc.', tick: 'FOX' },
            { name: 'Express Scripts Holding Company', tick: 'ESRX' },
            { name: 'Baidu, Inc.', tick: 'BIDU' },
            { name: 'Texas Instruments Incorporated', tick: 'TXN' },
            { name: 'Regeneron Pharmaceuticals, Inc.', tick: 'REGN' },
            { name: 'Netflix, Inc.', tick: 'NFLX' },
            { name: 'Adobe Systems Incorporated', tick: 'ADBE' },
            { name: 'PayPal Holdings, Inc.', tick: 'PYPL' },
            { name: 'PowerShares QQQ Trust, Series 1', tick: 'QQQ' },
            { name: 'Automatic Data Processing, Inc.', tick: 'ADP' },
            { name: 'Alexion Pharmaceuticals, Inc.', tick: 'ALXN' },
            { name: 'Cognizant Technology Solutions Corporation', tick: 'CTSH' },
            { name: 'Liberty Global plc', tick: 'LBTYA' },
            { name: 'Avago Technologies Limited', tick: 'AVGO' },
            { name: 'Liberty Global plc', tick: 'LILAK' },
            { name: 'Liberty Global plc', tick: 'LBTYB' },
            { name: 'Twenty-First Century Fox, Inc.', tick: 'FOXA' },
            { name: 'Liberty Global plc', tick: 'LBTYK' },
            { name: 'Liberty Global plc', tick: 'LILA' },
            { name: 'eBay Inc.', tick: 'EBAY' },
            { name: 'Yahoo! Inc.', tick: 'YHOO' },
            { name: 'Broadcom Corporation', tick: 'BRCM' },
            { name: 'CME Group Inc.', tick: 'CME' },
            { name: 'Vertex Pharmaceuticals Incorporated', tick: 'VRTX' },
            { name: 'Monster Beverage Corporation', tick: 'MNST' },
            { name: 'Tesla Motors, Inc.', tick: 'TSLA' },
            { name: 'T-Mobile US, Inc.', tick: 'TMUS' },
            { name: 'DISH Network Corporation', tick: 'DISH' },
            { name: 'Activision Blizzard, Inc', tick: 'ATVI' }];

          $scope.stocks.forEach(function (stock, i) {
            $scope.stocks[i].fullName = stock.tick + ' - ' + stock.name;
          });

          $scope.getTestItems = function (query, isInitializing) {
            if (isInitializing) {
              return {
                items: $scope.stocks.slice(0, 9)
              };
            }

            if (query) {
              var options = {
                keys: ['tick', 'name']
              };

              var f = new Fuse($scope.stocks, options);
              return {
                items: f.search(query)
              };
            }

            return {items: []};
          };

          $scope.model = "";
        }
      }
    }
  })

  .state('app.single', {
    url: '/portfolio/:tick',
    views: {
      'menuContent': {
        templateUrl: 'templates/stock.html',
        controller: 'StockCtrl'
      },
      'fabContent': {
        template: ''
      }
    }
  })

  .state('app.profile', {
    url: '/profile',
    views: {
      'menuContent': {
        templateUrl: 'templates/profile.html',
        controller: 'ProfileCtrl'
      },
      'fabContent': {
        template: ''
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/portfolio');
});
