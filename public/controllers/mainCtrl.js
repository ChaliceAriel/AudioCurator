
/*Setup mainCtrl.js by associating app name using .module method, and passing controller name to .controller method
Use function argument to inject in the $scope object and the mainServ service file.*/

angular.module("AudioCurator").controller("mainCtrl", function($scope, mainServ) {

  // This variable controls whether the Login/Register form is displayed.
  $scope.showAuth = false;
  // Toggles the value of the showAuth variable to display or hide the login form.
  $scope.toggleLoginView = function() {
    console.log("showAuth value", $scope.showAuth)
    $scope.showAuth = $scope.showAuth ? false : true;
  };
  // This variable determines which of the Login/Register forms is displayed.
  $scope.loginOrRegister = true;


  $scope.name = mainServ.name;

  $scope.readytodelete = false;
  $scope.readytoupdate = false;

  $scope.clientId = mainServ.clientId;
  $scope.clientSecret = mainServ.clientSecret;

  $scope.clientStream;

  $scope.blogPost;
  $scope.postHistory;


  $scope.postBlog = function(newPost){
    if (newPost){

      mainServ.postBlog(newPost)
      .then(function(res){
        $scope.blogPost = res;
        displayPosts();
        $scope.newBlogPost = "";

      })
    } else {
      alert("Please enter a blog post");
  }
};


  $scope.getStream = function(clientId){

    mainServ.getClientStream(clientId)

  .then(function(res){

    $scope.clientStream = res;

  })

  }

  var displayPosts = function(){
    mainServ.getPosts()
    .then(function(res){
      $scope.postHistory = res;
    })
  }
  //call getPosts when page loads
  displayPosts();

  $scope.remove = function(id) {
    mainServ.remove(id)
    .then(function(res){
      displayPosts();
    })

  }

  $scope.update =function(post) {
    mainServ.update(post)
    .then(function(res){
      displayPosts();
    })
  }

});