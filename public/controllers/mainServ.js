
//MODEL: communicates to controller

/*Setup mainServ.js by associating app name using .module method, and passing service name to .service method.
Use function argument to inject in $http method*/

/*A service is essentially a Constructor function,
So when creating function variables, be sure to use the 'this' keyword. */


angular.module("AudioCurator").service("mainServ", function($http) {


	
  this.clientId = '93b670379c03c10be221ed90ee118f93';
  this.clientSecret = '87b74a7dd855b8cb9ec10a533be05848';


	this.postBlog = function(newPost){
		console.log(newPost);
		var today = "[" + new Date().toISOString().slice(0, 10) + "] - " + new Date().toISOString().slice(11, 19);
		//This creates a string of date and time, down to seconds, so that posts can be ordered chronologically
		//so the newest post is posted at the top
		var worddate = (new Date()).toString().slice(4, 15);
		//This takes the created string, and only displays the day, date, and month so that we aren't getting
		//time, seconds, and milliseconds added to our blog posts
		newPost.date = today;
  	newPost.displaydate = worddate;

  	console.log('finalized post just before $http', newPost);
  	return $http({
  		method: "POST",
  		url: "/post",
  		data: newPost
  	}).then(function(res){
  		console.log('$http response', res);
  		return res;
  	})

	};

	this.getMe = function(){
		return $http({
			method: "GET",
			url:"/user/me"
		}).then(function(response){
			console.log(response)
			return response;
		})
	};

	this.getPosts = function() {
  	return $http({
			method: "GET",
			url: "/post"
		}).then(function(res){
			console.log('getPosts got posts:', res.data);
			return res.data;
		})

	};

	this.remove = function(id) {
		return $http({
			method: "DELETE",
			url:"/post/" + id
		}).then(function(res){
			console.log(res.data);
			return res.data;
		})
	};

	this.update = function(post) {
		return $http({
			method: "PUT",
			url:"/post/" + post._id,
			data: post
		}).then(function(res){
			console.log(res.data);
			return res.data;
		})
	};

	// This function will resolve a soundcloud share URL to it's respective API url which gives us access to it's ID number and streaming URL.
  this.resolveShareURLtoAPI = function(shareUrl){
    return $http({
      method: 'GET',
      url: 'http://api.soundcloud.com/resolve.json?url=' + shareUrl + "&client_id=" + this.clientId
    });
  };


	// This function gets info about the logged in user. Currently just used to find the displayName of a user when they are saving a new post.
	// this.getUser = function (user) {
	//   return $http ({
	//     method: "GET",
	//     url: '/user/me'
	//   }).then(function (response) {
	//     console.log('mainServ.getUser', response.data);
	//     return response.data;
	//   });
	// };

	// These user related functions are commented because they are not in use, but the endpoints have been setup for them to work if we need them.

	// this.getUsers = function () {
	//   return $http ({
	//     method: "GET",
	//     url: '/user'
	//   }).then(function (response){
	//     return response.data;
	//   });
	// };
	// this.changeUser = function (user) {
	//   return $http ({
	//     method: "PUT",
	//     url: '/user/' + user._id,
	//     data: user
	//   }).then(function (response) {
	//     console.log(response);
	//     return response.data;
	//   });
	// };
	// this.deleteUser = function (user) {
	//   return $http ({
	//     method: "DELETE",
	//     url: '/user/' + user._id,
	//   }).then(function (response) {
	//     return response.data;
	//   });
	// };

});
