angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, Auth, $ionicUser) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };

  $scope.login2 = function(authMethod) {
    Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
    }).catch(function(error) {
      if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthPopup(authMethod).then(function(authData) {
        });
      } else {
        console.log(error);
      }
    });
  };

  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log('Not logged in yet');
    } else {
      console.log('Logged in as', authData.uid);

      // kick off the platform web client
      Ionic.io();

      // this will give you a fresh user or the previously saved 'current user'
      var user = Ionic.User.current();

      // if the user doesn't have an id, you'll need to give it one.
      if (!user.id) {
        user.id = authData.uid;
      }

      user.set('image', authData.github.profileImageURL);
      console.log(authData);

      // persist the user
      user.save();

      var push = new Ionic.Push({});

      push.register(function(pushToken) {
        var user = Ionic.User.current();
        user.addPushToken(pushToken);
        user.save();

        console.log("Got Token:", pushToken.token);
      });
    }
    // This will display the user's name in our view
    $scope.authData = authData;
  });

  // Form data for the login modal
  $scope.loginData = {};
  $scope.isExpanded = false;
  $scope.hasHeaderFabLeft = false;
  $scope.hasHeaderFabRight = false;

  var navIcons = document.getElementsByClassName('ion-navicon');
  for (var i = 0; i < navIcons.length; i++) {
    navIcons.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  }

  ////////////////////////////////////////
  // Layout Methods
  ////////////////////////////////////////

  $scope.hideNavBar = function() {
    document.getElementsByTagName('ion-nav-bar')[0].style.display = 'none';
  };

  $scope.showNavBar = function() {
    document.getElementsByTagName('ion-nav-bar')[0].style.display = 'block';
  };

  $scope.noHeader = function() {
    var content = document.getElementsByTagName('ion-content');
    for (var i = 0; i < content.length; i++) {
      if (content[i].classList.contains('has-header')) {
        content[i].classList.toggle('has-header');
      }
    }
  };

  $scope.setExpanded = function(bool) {
    $scope.isExpanded = bool;
  };

  $scope.setHeaderFab = function(location) {
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

  $scope.hasHeader = function() {
    var content = document.getElementsByTagName('ion-content');
    for (var i = 0; i < content.length; i++) {
      if (!content[i].classList.contains('has-header')) {
        content[i].classList.toggle('has-header');
      }
    }

  };

  $scope.hideHeader = function() {
    $scope.hideNavBar();
    $scope.noHeader();
  };

  $scope.showHeader = function() {
    $scope.showNavBar();
    $scope.hasHeader();
  };

  $scope.clearFabs = function() {
    var fabs = document.getElementsByClassName('button-fab');
    if (fabs.length && fabs.length > 1) {
      fabs[0].remove();
    }
  };
})

.controller('PortfolioCtrl', function($scope) {
  $scope.portfolio = [
    { tick: 'Reggae', id: 1 },
    { tick: 'Chill', id: 2 },
    { tick: 'Dubstep', id: 3 },
    { tick: 'Indie', id: 4 },
    { tick: 'Rap', id: 5 },
    { tick: 'Cowbell', id: 6 }
  ];
})

.controller('StockCtrl', function($scope, $stateParams) {
})

.controller('ProfileCtrl', function($scope, $stateParams, $timeout, ionicMaterialMotion, ionicMaterialInk) {
  // Set Header
  $scope.$parent.showHeader();
  $scope.$parent.clearFabs();
  $scope.isExpanded = false;
  $scope.$parent.setExpanded(false);
  $scope.$parent.setHeaderFab(false);

  // Set Motion
  $timeout(function() {
    ionicMaterialMotion.slideUp({
      selector: '.slide-up'
    });
  }, 300);

  $timeout(function() {
    ionicMaterialMotion.fadeSlideInRight({
      startVelocity: 3000
    });
  }, 700);

  // Set Ink
  ionicMaterialInk.displayEffect();
});
