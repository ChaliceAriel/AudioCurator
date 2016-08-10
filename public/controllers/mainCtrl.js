
/*Setup mainCtrl.js by associating app name using .module method, and passing controller name to .controller method
Use function argument to inject in the $scope object and the mainServ service file.*/

angular.module("AudioCurator").controller("mainCtrl", function($scope, $rootScope, $http, $state, mainServ) {

  // This will hold an arry of songs that make up or continuous playlist
  $scope.songs = [];

  // This holds all of the post data that we have requested from teh server
  $rootScope.postHistory;

  // This variable will hold info about the currently logged in user and will be falsy if no user is been logged in.
  $scope.loggedInUser = {};

  // Variable for showing or hiding login button. Logout button should display when this is false.
  $scope.showLoginButton = $scope.loggedInUser === {} ? false : true;

  // This variable controls whether the Login/Register form is displayed.
  $scope.showAuthForm = false;

  // Toggles the value of the showAuthForm variable to display or hide the login form.
  $scope.toggleLoginView = function() {
    $scope.showAuthForm = $scope.showAuthForm ? false : true;
  };

  // Clears sensitive login information from the input forms. Called immediately after being passed login or register function.
  $scope.clearLogin = function(){
    $scope.user = {};
    $scope.newUser = {};
  };

  // This variable determines which of the Login/Register forms is displayed. (true = login)
  $scope.loginOrRegister = true;

  // This function calls /logout to log out the current user and clear session data.
  $scope.logout = function() {
    $http.get('/logout')
      .then(function(res){
        $scope.showLoginButton = true;               // Show login button and hide logout button.
        $scope.loggedInUser = {};     // Set loggedInUser to empty object (will also cause login button to display again instead of logout).
        $state.go('home');
      })
  };

  // This function initiates the login process when the login form is submitted.
  $scope.login = function(user) {
    $http.post('/login', user)
      .then(function(res){
        $scope.loggedInUser = res.config.data.email;
        $scope.getMe(); // Sets loggedInUser to email of logged in user. Need to fix this to include displayName.
        $scope.showLoginButton = false;          // Hide login button and show logout button.
        $scope.showAuthForm = false;                 // Hide the auth form.
        $state.go('admin');                          // Redirects to admin page after login.
      })
  };

  // This is submitted by our registration form and sends a new user object to our /signup route which will test for a unique username and email, then create the user in the database and log them in.
  $scope.register = function(user) {
    $http.post('/signup', user)
      .then(function(res){
        console.log('/signup res', res);
        $scope.showLoginButton = false; 
        $scope.getMe();             // Hide login button and show logout button.
        $scope.showAuthForm = false;                 // Hide the auth form
        $state.go('admin');                          // Redirects to admin page after registration/login
      })
  };


  // Tell SC to use our client ID
  SC.initialize({
      client_id: mainServ.clientId
  });

  // This function will be reworked to take in a souncdloud 'share url' (when user makes a post) and return or save the streaming url to the database.
  // SC.get("https://api.soundcloud.com/users/slavetothesound/favorites", {
  //     limit: 30
  // }, function(tracks) {
  //     for (var i = 0; i < tracks.length; i ++) {
  //         SC.stream( '/tracks/' + tracks[i].id, function( sm_object ){
  //           var url = 'https' + sm_object.url.slice(4);
  //               var track = {
  //                 id: tracks[i].id,
  //                 title: tracks[i].title,
  //                 artist: tracks[i].genre,
  //                 url: url
  //             };
  //             $scope.$apply(function () {
  //                 $scope.songs.push(track);
  //                 console.log('favorites tracks', track);
  //             });
  //         });
  //     }
  // });

  // var buildPlaylist2 = function(postData){
  //
  // };

  var buildPlaylist = function(postData) {
    console.log('buildPlaylist postData', postData);
    $scope.songs = [];
    // for (var i = 0; i < postData.length; i++) {     // This for loop doesn't produce streamable results. Reason unknown.
    //   console.log('METHOD ONE');
    //   var track = {
    //     id: postData[i].trackInfo.soundcloudId,
    //     title: postData[i].trackInfo.title,
    //     artist: 'herpderp placeholder',
    //     url: postData[i].trackInfo.streamURL + '?client_id=' + mainServ.clientId
    //   };
    //   $scope.songs.push(track);
    //   console.log("buildplaylist tracks" + i, track);
    // }
    for (var i = 0; i < postData.length; i++) {
      SC.stream('/tracks/' + postData[i].trackInfo.soundcloudId, function(sm_object){
        var url = 'https' + sm_object.url.slice(4);
        var track = {
          id: postData[i].trackInfo.soundcloudId,
          title: postData[i].trackInfo.title,
          artist: postData[i].trackInfo.artist,
          url: url
        };
        $scope.songs.unshift(track);
        // console.log("buildplaylist2 track" + i, track);
        $scope.artist = track.artist;
        $scope.title = track.title;
      })
    }
  };



  /////////////// I think these can be removed? ///////////////////
  $scope.name = mainServ.name;

  $scope.readytodelete = false;
  $scope.readytoupdate = false;

  $scope.clientId = mainServ.clientId;
  $scope.clientSecret = mainServ.clientSecret;

  $scope.clientStream;

  $scope.getStream = function(clientId){
    mainServ.getClientStream(clientId)
    .then(function(res){
      $scope.clientStream = res;
    });
  };
  //////////////////////////////////////////////////////////////////

  // This function will get info about the logged in user if we need it.
  // $scope.getUser = function () {
  //   mainServ.getUser()
  //   .then(function(res){
  //     $scope.user = res;
  //   });
  // };


  // This function gets all the posts from the server so that we can display them on the page
  var displayPosts = function(){
    mainServ.getPosts()               // get the posts!
    .then(function(res){
      $rootScope.postHistory = res.reverse();   // save the posts!
      buildPlaylist(res);                // build the playlist from post datas!
    });
  };

  // Calls getPosts when page loads so that we have our data right away. This function also builds our SoundManager2 playlist after the data has been returned
  displayPosts()

  // Calls the function that is responsible for deleting posts from the database.
  $scope.remove = function(id) {
    mainServ.remove(id)
    .then(function(res){
      displayPosts();
    });
  };

  // This calls the function that is used to edit posts that already exist in the database.
  $scope.update =function(post) {
    mainServ.update(post)
    .then(function(res){
      displayPosts();
    });
  };
  $scope.refresh = function () {
    location.reload();
  }

  var loopId= function(){
    for (var i = 0;i < $scope.songs.length;i++){
      if($scope.currentPlaying){
      var slicedId = parseInt($scope.currentPlaying.split('/',[3])[2].split('-',[1])[0]);
        if(slicedId == $scope.songs[i].id){
          console.log("we made it")
          $scope.currentTitle = $scope.songs[i].title;
          $scope.currentArtist = $scope.songs[i].artist;
        }
      }
    }
  };
  setInterval(function(){
    loopId();
  },1000)
  
  $scope.getMe = function(){
    mainServ.getMe()
    .then(function(response){
      $scope.loggedInUser = response;

    })
  };
  

});
