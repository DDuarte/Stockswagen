angular.module('starter.controllers', [])

  .controller('AppCtrl', function ($scope, $rootScope, currentAuth) {

    $rootScope.authData = currentAuth;

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    var navIcons = document.getElementsByClassName('ion-navicon');
    for (var i = 0; i < navIcons.length; i++) {
      navIcons.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    }

    ////////////////////////////////////////
    // Layout Methods
    ////////////////////////////////////////

    $scope.hideNavBar = function () {
      document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
    };

    $scope.showNavBar = function () {
      document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
    };

    $scope.hideNavButtons = function () {
      document.getElementsByTagName('ion-nav-buttons')[0].style.display = 'none';
    };

    $scope.noHeader = function () {
      var content = document.getElementsByTagName('ion-content');
      for (var i = 0; i < content.length; i++) {
        if (content[i].classList.contains('has-header')) {
          content[i].classList.toggle('has-header');
        }
      }
    };

    $scope.setExpanded = function (bool) {
      $scope.isExpanded = bool;
    };

    $scope.setHeaderFab = function (location) {
      var hasHeaderFabLeft = false;
      var hasHeaderFabRight = false;

      switch (location) {
        case 'left':
          hasHeaderFabLeft = true;
          break;
        case 'right':
          hasHeaderFabRight = true;
          break;
      }

      $scope.hasHeaderFabLeft = hasHeaderFabLeft;
      $scope.hasHeaderFabRight = hasHeaderFabRight;
    };

    $scope.hasHeader = function () {
      var content = document.getElementsByTagName('ion-content');
      for (var i = 0; i < content.length; i++) {
        if (!content[i].classList.contains('has-header')) {
          content[i].classList.toggle('has-header');
        }
      }
    };

    $scope.hideHeader = function () {
      $scope.hideNavBar();
      $scope.noHeader();
    };

    $scope.showHeader = function () {
      $scope.showNavBar();
      $scope.hasHeader();
    };

    $scope.clearFabs = function () {
      var fabs = document.getElementsByClassName('button-fab');
      if (fabs.length && fabs.length > 1) {
        fabs[0].remove();
      }
    };
  })

  .controller('LoginCtrl', function ($scope, $rootScope, $state, Auth, Token) {
    $rootScope.auth = Auth;

    $scope.login = function (authMethod) {
      $rootScope.auth.$authWithOAuthPopup(authMethod).then(function (authData) {
      }).catch(function (error) {
        if (error.code === 'TRANSPORT_UNAVAILABLE') {
          $rootScope.auth.$authWithOAuthRedirect(authMethod).then(function (authData) {
          });
        } else {
          console.log(error);
        }
      });
    };

    $scope.loginAnon = function() {
      $rootScope.auth.$authAnonymously().then(function (authData) {

      }).catch(function (error) {
        console.log(error);
      });
    };

    $rootScope.auth.$onAuth(function (authData) {

      // This will display the user's name in our view
      $scope.authData = authData;

      if (authData === null) {
        console.log('Not logged in yet');
      } else {
        console.log('Logged in as', authData.uid);

        if (authData.facebook) {
          authData.profileImageURL = authData.facebook.profileImageURL;
          authData.displayName = authData.facebook.displayName;
        } else if (authData.github) {
          authData.profileImageURL = authData.github.profileImageURL;
          authData.displayName = authData.github.displayName;
        } else if (authData.google) {
          authData.profileImageURL = authData.google.profileImageURL;
          authData.displayName = authData.google.displayName;
        }

        // kick off the platform web client
        Ionic.io();

        // this will give you a fresh user or the previously saved 'current user'
        var user = Ionic.User.current();

        // if the user doesn't have an id, you'll need to give it one.
        if (!user.id) {
          user.id = authData.uid;
        }

        user.set('image', authData.profileImageURL);
        user.set('displayName', authData.displayName);
        console.log(authData);

        var push = new Ionic.Push({
          "debug": true
        });

        push.register(function (pushToken) {
          var user = Ionic.User.current();

          Token(user.id).transaction(function (/* currentToken */) {
            return pushToken.token;
          });

          user.addPushToken(pushToken);
          user.save().then(function () {
            $state.go('app.portfolio');
          });
        });
      }
    });
  })

  .controller('PortfolioListCtrl', function ($scope, $timeout, $ionicModal, Auth, Portfolio, Quotes, ionicMaterialInk, Token) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab('right');

    $scope.portfolio = Portfolio(Auth.$getAuth().uid);
    $scope.quotes = Quotes;

    $scope.presentNumber = function (number) {
      return (number >= 0) ? '+' + number : number.toString();
    };

    $timeout(function () {
      // Activate ink for controller
      ionicMaterialInk.displayEffect();

      var push = new Ionic.Push({});
      push.register(function (pushToken) {
        var user = Ionic.User.current();

        Token(user.id).transaction(function (/* currentToken */) {
          return pushToken.token;
        });

        user.addPushToken(pushToken);
        user.save();
      });
    }, 500);
  })

  .controller('AddStockCtrl', function ($scope, $timeout, $ionicModal, $ionicPopup, Auth, Portfolio) {
    $timeout(function () {
      document.getElementById('fab-portfolio').classList.toggle('on');
    }, 200);

    $scope.form = {
      lowerBound: 50,
      upperBound: 100,
      subscription: false
    };

    $ionicModal.fromTemplateUrl('templates/addStock.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.addStockModal = modal;
    });

    $scope.closeAddStock = function () {
      $scope.addStockModal.hide();
    };

    $scope.openAddStock = function () {
      $scope.addStockModal.show();
    };

    $scope.stocks = [
      {name: 'Apple Inc.', tick: 'AAPL'},
      {name: 'Alphabet Inc.', tick: 'GOOGL'},
      {name: 'Alphabet Inc.', tick: 'GOOG'},
      {name: 'Microsoft Corporation', tick: 'MSFT'},
      {name: 'Amazon.com, Inc.', tick: 'AMZN'},
      {name: 'Facebook, Inc.', tick: 'FB'},
      {name: 'Intel Corporation', tick: 'INTC'},
      {name: 'Gilead Sciences, Inc.', tick: 'GILD'},
      {name: 'Comcast Corporation', tick: 'CMCSK'},
      {name: 'Comcast Corporation', tick: 'CMCSA'},
      {name: 'Cisco Systems, Inc.', tick: 'CSCO'},
      {name: 'Amgen Inc.', tick: 'AMGN'},
      {name: 'Starbucks Corporation', tick: 'SBUX'},
      {name: 'Walgreens Boots Alliance, Inc.', tick: 'WBA'},
      {name: 'The Kraft Heinz Company', tick: 'KHC'},
      {name: 'Celgene Corporation', tick: 'CELG'},
      {name: 'QUALCOMM Incorporated', tick: 'QCOM'},
      {name: 'Costco Wholesale Corporation', tick: 'COST'},
      {name: 'Mondelez International, Inc.', tick: 'MDLZ'},
      {name: 'Biogen Inc.', tick: 'BIIB'},
      {name: 'The Priceline Group Inc.', tick: 'PCLN'},
      {name: 'Twenty-First Century Fox, Inc.', tick: 'FOX'},
      {name: 'Express Scripts Holding Company', tick: 'ESRX'},
      {name: 'Baidu, Inc.', tick: 'BIDU'},
      {name: 'Texas Instruments Incorporated', tick: 'TXN'},
      {name: 'Regeneron Pharmaceuticals, Inc.', tick: 'REGN'},
      {name: 'Netflix, Inc.', tick: 'NFLX'},
      {name: 'Adobe Systems Incorporated', tick: 'ADBE'},
      {name: 'PayPal Holdings, Inc.', tick: 'PYPL'},
      {name: 'PowerShares QQQ Trust, Series 1', tick: 'QQQ'},
      {name: 'Automatic Data Processing, Inc.', tick: 'ADP'},
      {name: 'Alexion Pharmaceuticals, Inc.', tick: 'ALXN'},
      {name: 'Cognizant Technology Solutions Corporation', tick: 'CTSH'},
      {name: 'Liberty Global plc', tick: 'LBTYA'},
      {name: 'Avago Technologies Limited', tick: 'AVGO'},
      {name: 'Liberty Global plc', tick: 'LILAK'},
      {name: 'Liberty Global plc', tick: 'LBTYB'},
      {name: 'Twenty-First Century Fox, Inc.', tick: 'FOXA'},
      {name: 'Liberty Global plc', tick: 'LBTYK'},
      {name: 'Liberty Global plc', tick: 'LILA'},
      {name: 'eBay Inc.', tick: 'EBAY'},
      {name: 'Yahoo! Inc.', tick: 'YHOO'},
      {name: 'Broadcom Corporation', tick: 'BRCM'},
      {name: 'CME Group Inc.', tick: 'CME'},
      {name: 'Vertex Pharmaceuticals Incorporated', tick: 'VRTX'},
      {name: 'Monster Beverage Corporation', tick: 'MNST'},
      {name: 'Tesla Motors, Inc.', tick: 'TSLA'},
      {name: 'T-Mobile US, Inc.', tick: 'TMUS'},
      {name: 'DISH Network Corporation', tick: 'DISH'},
      {name: 'Activision Blizzard, Inc', tick: 'ATVI'}];

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

    $scope.createPortfolioEntry = function (entry) {
      console.log('Entry:', entry);
      Portfolio(Auth.$getAuth().uid).$add({
          tick: entry.stock.tick,
          subscription: entry.subscription,
          lowerBound: entry.lowerBound,
          upperBound: entry.upperBound,
          name: entry.stock.name
        })
        .then(function () {

          $scope.closeAddStock();

        })
        .catch(function (error) {

          $ionicPopup
            .alert({
              title: 'Error creating portfolio entry',
              template: 'Reason: ' + error.toString()
            })
            .then(function () {
              $scope.closeAddStock();
            });

          console.error('Error:', error);
        });

    };
  })

  .controller('StockCtrl', function ($scope, $stateParams, Quote, HistoricalQuote, moment) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    $scope.quote = Quote($stateParams.tick);
    $scope.historicalQuote = HistoricalQuote($stateParams.tick);

    $scope.quote.$watch(function() {

      $scope.historicalQuote.$watch(function() {

        $scope.chartConfig = {
          "options": {
            "chart": {
              "type": "line"
            }
          },
          "series": [
            {
              "name": $scope.quote.symbol,
              "data": $scope.historicalQuote.map(function (quoteElem) { return [moment(new Date(quoteElem.date)).valueOf(), quoteElem.close ]; }),
              type: "line",
              tooltip: {
                valueDecimals: 2
              },
              marker : {
                enabled : true,
                radius : 3
              },
              shadow : true
            }
          ],
          "title": {
            "text": $scope.quote.symbol + ' Stock Price'
          },
          "credits": {
            "enabled": false
          },
          rangeSelector : {
            selected : 1
          },
          "loading": false,
          "useHighStocks": true
        }

      });

    });

  })

  .controller('ProfileCtrl', function ($scope, $rootScope, $stateParams, $timeout, $state, $window, $ionicHistory) {
    // Set Header
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = false;
    $scope.$parent.setExpanded(false);
    $scope.$parent.setHeaderFab(false);

    $scope.logout = function () {
      $rootScope.authData = null;
      $rootScope.auth.$unauth();
      $window.localStorage.clear();
      $ionicHistory.clearCache();
      $ionicHistory.clearHistory();
      $state.go('login');
    }
  });
