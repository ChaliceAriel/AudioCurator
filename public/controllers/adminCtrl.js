angular.module('AudioCurator').controller('adminCtrl', function($scope, $rootScope, $http, $state, mainServ){
  


  $scope.currentUser = '';

  // This function checks if the person accessing /admin is logged in, then saves their information $scope.currentUser or will redirect them. The function is called by ng-init in the admin.html template.
  $scope.checkIfLoggedIn = function(){
    $http.get('/user/me')          // This route only tests if a user is logged in and responds
      .then(function(res){
        if (!res.data._id){        // There will be something at res.data._id if a user is logged in
          $state.go("home");       // This will transition back to the home page if the user is not logged in.
        } else {
          $scope.currentUser = res.data.displayName;  // Since the user is logged in, save their displayName.
        }
    });
  };

  // Checks if the current user is logged in. This function will be executed when the admin state is accessed.
  $scope.checkIfLoggedIn();

  // This handles new post submissions by retrieving required data from SoundCloud's API as well as saving the data to mongoDB
  $scope.postBlog = function(newPost){                // newPost object will contain all of our new post data. see postModel.js for more details.
    if (newPost.body){                                // newPost must have at least a post body to be valid post
      newPost.postedBy = $scope.currentUser;          // Record the post's author
      mainServ.resolveShareURLtoAPI(newPost.trackInfo.shareUrl) // This makes the HTTP request to soundcloud's API for data based on shareUrl
      .then(function(res){                            // This section grabs the data we want to keep from soundcloud
        console.log('sc res', res);
        newPost.trackInfo = {
          artist: res.data.artist,
          art: res.data.artwork_url,                  // Artwork because pictures are pretty!
          title: res.data.title,                      // Title so people know what they are hearing. Soundcloud usually includes artist with title.
          streamURL: res.data.stream_url,             // This is what we will feed SoundManager2 for the audio stream
          apiURL: res.data.uri,                       // The direct API url in case we need to grab info from soundcloud again someday
          soundcloudId: res.data.id
        };
        mainServ.postBlog(newPost);                   // Data is prepared! Now POST it to the database!
      }).then(function(){
        mainServ.getPosts()                           // Get the full list of posts again since there is a new one now
        .then(function(res){
          $rootScope.postHistory = res;               // Save the posts we just got to rootScope which will display them on the page.
        })
      });
        $scope.newBlogPost = '';                      // Clear the blog post form
    } else {                                          // If the post is empty...
      alert("Please enter a some thoughts!");         // Alert the user that they are not trying hard enough.
    }
  };

  $scope.readytodelete = false;
  $scope.readytoupdate = false;

  // This function can be deleted
  // SC.get("https://api.soundcloud.com/users/slavetothesound/favorites", {
  //     limit: 30
  // }, function(tracks) {
  //     for (var i = 0; i < tracks.length; i ++) {
  //         SC.stream( '/tracks/' + tracks[i].id, function( sm_object ){
  //
  //           var url = 'https' + sm_object.url.slice(4);
  //               var track = {
  //                 id: tracks[i].id,
  //                 title: tracks[i].title,
  //                 artist: tracks[i].genre,
  //                 url: url
  //             };
  //             $scope.$apply(function () {
  //                 $scope.songs.push(track);
  //                 // console.log(url);
  //             });
  //         });
  //     }
  // });

});
